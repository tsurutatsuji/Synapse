import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { claudeApiKey, lineToken, lineSecret } = await req.json();

    if (!claudeApiKey || !lineToken || !lineSecret) {
      return NextResponse.json({ error: "すべての項目を入力してください" }, { status: 400 });
    }

    const envContent = `ANTHROPIC_API_KEY=${claudeApiKey}\nLINE_CHANNEL_ACCESS_TOKEN=${lineToken}\nLINE_CHANNEL_SECRET=${lineSecret}\n`;

    return new NextResponse(envContent, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": 'attachment; filename=".env"',
      },
    });
  } catch {
    return NextResponse.json({ error: "ファイル生成に失敗しました" }, { status: 500 });
  }
}
