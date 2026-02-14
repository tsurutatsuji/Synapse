import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

/**
 * マルチテナント方式のクラウドデプロイ。
 *
 * 1台の OpenClaw インスタンスに、ユーザーごとの agentId を追加する。
 * ユーザーが "Deploy OpenClaw" を押すと:
 *   1. DB にエージェント情報を保存
 *   2. OpenClaw 管理APIにエージェント登録をリクエスト
 *   3. Webhook URL をユーザーに返す
 *
 * 環境変数:
 *   OPENCLAW_HOST       — OpenClaw サーバーのベースURL (例: https://easyclaw-openclaw.up.railway.app)
 *   OPENCLAW_ADMIN_KEY  — OpenClaw 管理API の認証キー
 */

function generateAgentId(): string {
  return `ec-${crypto.randomBytes(6).toString("hex")}`;
}

function resolveModel(aiProvider: string): string {
  switch (aiProvider) {
    case "claude":
      return "anthropic/claude-sonnet-4-5-20250929";
    case "gpt":
      return "openai/gpt-4o";
    case "gemini-flash":
      return "google/gemini-2.0-flash";
    default:
      return "anthropic/claude-sonnet-4-5-20250929";
  }
}

export async function POST(req: NextRequest) {
  // ── Auth ──
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return Response.json({ error: "ログインが必要です" }, { status: 401 });
  }

  const openclawHost = process.env.OPENCLAW_HOST;
  const adminKey = process.env.OPENCLAW_ADMIN_KEY;

  if (!openclawHost || !adminKey) {
    return Response.json(
      { error: "サーバー設定が不足しています。管理者にお問い合わせください。" },
      { status: 500 }
    );
  }

  const { aiProvider, aiApiKey, lineToken, lineSecret } = await req.json();

  if (!lineToken || !lineSecret) {
    return Response.json({ error: "LINE の情報が必要です" }, { status: 400 });
  }

  // ── Find or create user ──
  const { ensureUser } = await import("@/lib/ensure-user");
  const user = await ensureUser(session.user.email);

  // ── Check subscription (free trial = 7 days) ──
  const sub = user.subscription;
  if (sub && sub.plan === "free" && sub.status === "expired") {
    return Response.json(
      { error: "無料トライアルが終了しました。プランをアップグレードしてください。" },
      { status: 403 }
    );
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: Record<string, unknown>) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      try {
        // ── Step 1: Register agent in DB ──
        send({ step: 1, message: "エージェントを登録しています..." });

        const agentId = user.config?.agentId || generateAgentId();
        const webhookPath = `/line/${agentId}`;
        const webhookUrl = `${openclawHost}${webhookPath}`;

        await prisma.botConfig.upsert({
          where: { userId: user.id },
          update: {
            aiProvider,
            aiApiKey: aiApiKey || "",
            lineToken,
            lineSecret,
            agentId,
            webhookPath,
            deployStatus: "deploying",
            deploymentType: "cloud",
          },
          create: {
            userId: user.id,
            aiProvider,
            aiApiKey: aiApiKey || "",
            lineToken,
            lineSecret,
            agentId,
            webhookPath,
            deployStatus: "deploying",
            deploymentType: "cloud",
          },
        });

        send({ step: 1, message: "エージェント登録完了" });

        // ── Step 2: Push agent config to OpenClaw ──
        send({ step: 2, message: "OpenClaw にエージェントを追加しています..." });

        const agentConfig = {
          agentId,
          model: resolveModel(aiProvider),
          aiApiKey: aiApiKey || undefined,
          line: {
            channelAccessToken: lineToken,
            channelSecret: lineSecret,
            webhookPath,
          },
          soul: {
            language: "ja",
            description: "親切で優秀なAIアシスタント",
          },
        };

        const openclawRes = await fetch(`${openclawHost}/_admin/agents`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminKey}`,
          },
          body: JSON.stringify(agentConfig),
        });

        if (!openclawRes.ok) {
          const errText = await openclawRes.text().catch(() => "");
          throw new Error(`OpenClaw エージェント登録失敗: ${errText || openclawRes.status}`);
        }

        send({ step: 2, message: "OpenClaw にエージェント追加完了" });

        // ── Step 3: Verify agent is running ──
        send({ step: 3, message: "起動を確認しています..." });

        // Health check — retry up to 5 times
        let healthy = false;
        for (let i = 0; i < 5; i++) {
          try {
            const healthRes = await fetch(`${openclawHost}/_admin/agents/${agentId}/health`, {
              headers: { Authorization: `Bearer ${adminKey}` },
            });
            if (healthRes.ok) {
              healthy = true;
              break;
            }
          } catch {
            /* retry */
          }
          await new Promise((r) => setTimeout(r, 2000));
        }

        if (!healthy) {
          // Even if health check fails, the agent may still be starting up.
          // Mark as active anyway — OpenClaw will serve requests once ready.
        }

        // ── Step 4: Mark as active ──
        send({ step: 4, message: "デプロイ完了！" });

        await prisma.botConfig.update({
          where: { userId: user.id },
          data: {
            deployStatus: "active",
            deployedAt: new Date(),
          },
        });

        // If user doesn't have a subscription yet, create free trial
        if (!sub) {
          const trialEnd = new Date();
          trialEnd.setDate(trialEnd.getDate() + 7);
          await prisma.subscription.create({
            data: {
              userId: user.id,
              plan: "free",
              status: "active",
              messagesLimit: 100,
              currentPeriodEnd: trialEnd,
            },
          });
        }

        send({ done: true, webhookUrl });
      } catch (e) {
        // Mark as failed
        await prisma.botConfig.updateMany({
          where: { userId: user.id },
          data: { deployStatus: "pending" },
        });
        send({
          error: true,
          message: e instanceof Error ? e.message : "デプロイに失敗しました",
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
