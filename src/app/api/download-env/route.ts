import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { claudeApiKey, aiProvider, lineToken, lineSecret } = await req.json();

    if (!lineToken || !lineSecret) {
      return NextResponse.json({ error: "LINE の情報を入力してください" }, { status: 400 });
    }

    let envContent = "";

    // AIプロバイダーに応じた環境変数を生成
    switch (aiProvider) {
      case "claude":
        envContent += `ANTHROPIC_API_KEY=${claudeApiKey}\n`;
        envContent += `AI_PROVIDER=anthropic\n`;
        break;
      case "gpt":
        envContent += `OPENAI_API_KEY=${claudeApiKey}\n`;
        envContent += `AI_PROVIDER=openai\n`;
        break;
      case "gemini-pro":
        envContent += `GOOGLE_AI_API_KEY=${claudeApiKey}\n`;
        envContent += `AI_PROVIDER=google\n`;
        envContent += `AI_MODEL=gemini-pro\n`;
        break;
      case "gemini-flash":
        envContent += `GOOGLE_AI_API_KEY=\n`;
        envContent += `AI_PROVIDER=google\n`;
        envContent += `AI_MODEL=gemini-flash\n`;
        break;
      default:
        envContent += `ANTHROPIC_API_KEY=${claudeApiKey}\n`;
        envContent += `AI_PROVIDER=anthropic\n`;
    }

    envContent += `LINE_CHANNEL_ACCESS_TOKEN=${lineToken}\n`;
    envContent += `LINE_CHANNEL_SECRET=${lineSecret}\n`;

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
