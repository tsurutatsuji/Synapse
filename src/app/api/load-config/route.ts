import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { config: true, subscription: true },
    });

    if (!user?.config) {
      return NextResponse.json({ config: null, subscription: null });
    }

    return NextResponse.json({
      config: {
        aiApiKey: user.config.aiApiKey,
        aiProvider: user.config.aiProvider,
        claudeApiKey: user.config.aiApiKey,
        lineToken: user.config.lineToken,
        lineSecret: user.config.lineSecret,
        deploymentType: user.config.deploymentType,
        securitySetup: user.config.securitySetup,
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
    return NextResponse.json({ error: "読み込みに失敗しました" }, { status: 500 });
  }
}
