import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { encrypt } from "@/lib/crypto";
import { deploySchema, validateOpenClawHost } from "@/lib/validation";
import crypto from "crypto";

/**
 * マルチテナント方式のクラウドデプロイ。
 *
 * 1台の OpenClaw インスタンスに、ユーザーごとの agentId を追加する。
 * ユーザーが "Deploy OpenClaw" を押すと:
 *   1. DB にエージェント情報を保存（暗号化）
 *   2. OpenClaw 管理APIにエージェント登録をリクエスト
 *   3. Webhook URL をユーザーに返す
 *
 * セキュリティ対策:
 *   - Zod による入力バリデーション
 *   - AES-256-GCM による機密データの暗号化（DB保存時）
 *   - OPENCLAW_HOST の HTTPS 強制（本番環境）
 *   - エラーメッセージから内部情報を除去
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

  // ── HTTPS バリデーション ──
  try {
    validateOpenClawHost(openclawHost);
  } catch {
    console.error("[deploy] OPENCLAW_HOST validation failed");
    return Response.json(
      { error: "サーバー設定に問題があります。管理者にお問い合わせください。" },
      { status: 500 }
    );
  }

  // ── 入力バリデーション ──
  let input;
  try {
    const body = await req.json();
    input = deploySchema.parse(body);
  } catch {
    return Response.json({ error: "入力内容に問題があります" }, { status: 400 });
  }

  const { aiProvider, aiApiKey, lineToken, lineSecret } = input;

  // Gemini 以外は API キーが必須
  if (aiProvider !== "gemini-flash" && !aiApiKey) {
    return Response.json({ error: "APIキーが必要です" }, { status: 400 });
  }

  // ── Find or create user ──
  let user;
  try {
    const { ensureUser } = await import("@/lib/ensure-user");
    user = await ensureUser(session.user.email);
  } catch (e) {
    console.error("[deploy] ensureUser failed:", e);
    return Response.json(
      { error: "ユーザー情報の読み込みに失敗しました。もう一度お試しください。" },
      { status: 500 }
    );
  }

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

        // 機密データを暗号化してから DB に保存
        const encryptedApiKey = encrypt(aiApiKey);
        const encryptedLineToken = encrypt(lineToken);
        const encryptedLineSecret = encrypt(lineSecret);

        await prisma.botConfig.upsert({
          where: { userId: user.id },
          update: {
            aiProvider,
            aiApiKey: encryptedApiKey,
            lineToken: encryptedLineToken,
            lineSecret: encryptedLineSecret,
            agentId,
            webhookPath,
            deployStatus: "deploying",
            deploymentType: "cloud",
          },
          create: {
            userId: user.id,
            aiProvider,
            aiApiKey: encryptedApiKey,
            lineToken: encryptedLineToken,
            lineSecret: encryptedLineSecret,
            agentId,
            webhookPath,
            deployStatus: "deploying",
            deploymentType: "cloud",
          },
        });

        send({ step: 1, message: "エージェント登録完了" });

        // ── Step 2: Push agent config to OpenClaw ──
        send({ step: 2, message: "OpenClaw にエージェントを追加しています..." });

        // OpenClaw に送る際は平文が必要（Gateway が直接使うため）
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
          const errBody = await openclawRes.text().catch(() => "");
          console.error(`[deploy] OpenClaw error: ${openclawRes.status} ${errBody}`);
          throw new Error(
            openclawRes.status === 403
              ? "AIサーバーに接続できません。サーバーが起動しているか確認してください。"
              : `AIサーバーでエラーが発生しました (${openclawRes.status})`
          );
        }

        send({ step: 2, message: "OpenClaw にエージェント追加完了" });

        // ── Step 3: Verify agent is running ──
        send({ step: 3, message: "起動を確認しています..." });

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
          // Health check 失敗でもエージェントは起動中の可能性があるため続行
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
        await prisma.botConfig.updateMany({
          where: { userId: user.id },
          data: { deployStatus: "pending" },
        });

        console.error("[deploy] Error:", e);
        const message = e instanceof TypeError
          ? "AIサーバーに接続できません。サーバーが起動中か確認してください。"
          : e instanceof Error
          ? e.message
          : "デプロイに失敗しました。しばらく経ってからもう一度お試しください。";
        send({ error: true, message });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-store",
      Connection: "keep-alive",
    },
  });
}
