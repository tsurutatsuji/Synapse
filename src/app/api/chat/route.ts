import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const SYSTEM_PROMPT = `あなたはワークフロー構築アシスタントです。
ユーザーの要望を聞いて、ファイル操作・データ変換・シェル実行などのワークフローを提案してください。

利用可能なノードタイプ:
- file-reader: ファイル読み込み (config: filePath, encoding)
- file-writer: ファイル書き込み (config: filePath, content, append)
- transform-node: データ変換 (config: data, expression)
- conditional-node: 条件分岐 (config: data, condition)
- shell-node: シェルコマンド実行 (config: command)
- merge-node: データ結合
- prompt-node: テンプレートテキスト生成 (config: template, variables)

ワークフローを提案する場合は、以下のJSON形式で返してください:
\`\`\`workflow
{
  "description": "ワークフローの説明",
  "nodes": [
    { "definitionId": "ノードタイプ", "label": "表示名", "config": {} }
  ],
  "edges": [
    { "fromIndex": 0, "toIndex": 1, "fromPort": "出力ポート名", "toPort": "入力ポート名" }
  ]
}
\`\`\`

簡潔に日本語で回答してください。`;

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey || apiKey === "your-api-key-here") {
    return NextResponse.json(
      {
        error: "API_KEY_NOT_SET",
        message:
          "ANTHROPIC_API_KEYが設定されていません。.env.localファイルにAPIキーを設定してください。",
      },
      { status: 401 }
    );
  }

  try {
    const { messages } = await req.json();

    const client = new Anthropic({ apiKey });

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: messages.map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";

    // ワークフロー提案JSONの抽出
    const workflowMatch = text.match(
      /```workflow\s*([\s\S]*?)```/
    );
    let proposal = null;
    let cleanText = text;

    if (workflowMatch) {
      try {
        proposal = JSON.parse(workflowMatch[1].trim());
        cleanText = text.replace(/```workflow\s*[\s\S]*?```/, "").trim();
      } catch {
        // JSONパース失敗は無視
      }
    }

    return NextResponse.json({ text: cleanText, proposal });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "API_ERROR", message },
      { status: 500 }
    );
  }
}
