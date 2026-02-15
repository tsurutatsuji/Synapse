import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { mask } from "@/lib/crypto";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    try {
      const { ensureUser } = await import("@/lib/ensure-user");
      const user = await ensureUser(session.user.email);

      if (!user?.config) {
        return NextResponse.json({ config: null, subscription: null });
      }

      const openclawHost = process.env.OPENCLAW_HOST || "";
      const webhookUrl = user.config.webhookPath
        ? `${openclawHost}${user.config.webhookPath}`
        : "";

      return NextResponse.json({
        config: {
          // 機密データはマスクして返す（末尾4文字のヒントのみ）
          // 生の API キーやトークンはクライアントに返さない
          aiApiKeyHint: mask(user.config.aiApiKey),
          aiApiKeySet: !!user.config.aiApiKey,
          aiProvider: user.config.aiProvider,
          lineTokenHint: mask(user.config.lineToken),
          lineTokenSet: !!user.config.lineToken,
          lineSecretHint: mask(user.config.lineSecret),
          lineSecretSet: !!user.config.lineSecret,
          deploymentType: user.config.deploymentType,
          deployed: user.config.deployStatus === "active",
          webhookUrl,
        },
        subscription: user.subscription
          ? {
              plan: user.subscription.plan,
              messagesUsed: user.subscription.messagesUsed,
              messagesLimit: user.subscription.messagesLimit,
            }
          : null,
      });
    } catch {
      // DB未接続の場合は初期状態を返す
      return NextResponse.json({ config: null, subscription: null });
    }
  } catch {
    return NextResponse.json({ error: "読み込みに失敗しました" }, { status: 500 });
  }
}
