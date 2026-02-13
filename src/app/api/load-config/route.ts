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
      include: { config: true },
    });

    if (!user?.config) {
      return NextResponse.json({ config: null });
    }

    return NextResponse.json({
      config: {
        claudeApiKey: user.config.claudeApiKey,
        lineToken: user.config.lineToken,
        lineSecret: user.config.lineSecret,
      },
    });
  } catch {
    return NextResponse.json({ error: "読み込みに失敗しました" }, { status: 500 });
  }
}
