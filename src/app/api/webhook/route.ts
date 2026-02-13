import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyLineSignature, replyToLine, LineWebhookBody } from "@/lib/line";
import { askClaude } from "@/lib/claude";

export async function POST(req: NextRequest) {
  try {
    const bodyText = await req.text();
    const signature = req.headers.get("x-line-signature");

    if (!signature) {
      return NextResponse.json({ error: "署名がありません" }, { status: 401 });
    }

    // ユーザーIDからconfigを取得するため、まずイベントをパース
    const body: LineWebhookBody = JSON.parse(bodyText);

    if (!body.events || body.events.length === 0) {
      // LINE の接続確認（Webhook URL検証）
      return NextResponse.json({ ok: true });
    }

    // URLクエリパラメータからユーザーIDを取得
    const configId = req.nextUrl.searchParams.get("id");
    if (!configId) {
      return NextResponse.json({ error: "設定IDが必要です" }, { status: 400 });
    }

    const config = await prisma.botConfig.findUnique({
      where: { id: configId },
    });

    if (!config) {
      return NextResponse.json({ error: "設定が見つかりません" }, { status: 404 });
    }

    // 署名検証
    if (!verifyLineSignature(bodyText, signature, config.lineSecret)) {
      return NextResponse.json({ error: "署名が無効です" }, { status: 401 });
    }

    // イベント処理
    for (const event of body.events) {
      if (event.type === "message" && event.message?.type === "text" && event.replyToken) {
        const userMessage = event.message.text!;

        try {
          const reply = await askClaude(userMessage, config.claudeApiKey);
          await replyToLine(event.replyToken, reply, config.lineToken);
        } catch {
          await replyToLine(
            event.replyToken,
            "申し訳ありません。一時的にエラーが発生しました。しばらくしてからもう一度お試しください。",
            config.lineToken
          );
        }
      }
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
