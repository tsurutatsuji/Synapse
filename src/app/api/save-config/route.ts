import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const { claudeApiKey, lineToken, lineSecret } = await req.json();

    if (!claudeApiKey || !lineToken || !lineSecret) {
      return NextResponse.json({ error: "すべての項目を入力してください" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "ユーザーが見つかりません" }, { status: 404 });
    }

    await prisma.botConfig.upsert({
      where: { userId: user.id },
      update: { claudeApiKey, lineToken, lineSecret },
      create: { userId: user.id, claudeApiKey, lineToken, lineSecret },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "保存に失敗しました" }, { status: 500 });
  }
}
