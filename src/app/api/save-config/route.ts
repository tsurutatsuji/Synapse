import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const { claudeApiKey, aiProvider, lineToken, lineSecret, deploymentType, securitySetup } = await req.json();

    if (!lineToken || !lineSecret) {
      return NextResponse.json({ error: "LINE の情報を入力してください" }, { status: 400 });
    }

    // Gemini Flash の場合は API キー不要
    if (aiProvider !== "gemini-flash" && !claudeApiKey) {
      return NextResponse.json({ error: "AIのAPIキーを入力してください" }, { status: 400 });
    }

    try {
      const { prisma } = await import("@/lib/prisma");

      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
      });

      if (!user) {
        return NextResponse.json({ error: "ユーザーが見つかりません" }, { status: 404 });
      }

      await prisma.botConfig.upsert({
        where: { userId: user.id },
        update: {
          aiApiKey: claudeApiKey || "",
          aiProvider: aiProvider || "claude",
          lineToken,
          lineSecret,
          deploymentType: deploymentType || "local",
          securitySetup: securitySetup ?? false,
        },
        create: {
          userId: user.id,
          aiApiKey: claudeApiKey || "",
          aiProvider: aiProvider || "claude",
          lineToken,
          lineSecret,
          deploymentType: deploymentType || "local",
          securitySetup: securitySetup ?? false,
        },
      });

      // サブスクリプションがなければ作成
      const existingSub = await prisma.subscription.findUnique({
        where: { userId: user.id },
      });
      if (!existingSub) {
        await prisma.subscription.create({
          data: {
            userId: user.id,
            plan: aiProvider === "gemini-flash" ? "free" : "premium",
            messagesLimit: aiProvider === "gemini-flash" ? 50 : 999999,
          },
        });
      }

      return NextResponse.json({ success: true });
    } catch (dbError) {
      console.error("[save-config] DB error:", dbError);
      return NextResponse.json(
        { error: "データベースに接続できません。現在は設定の保存ができません。" },
        { status: 503 }
      );
    }
  } catch {
    return NextResponse.json({ error: "保存に失敗しました" }, { status: 500 });
  }
}
