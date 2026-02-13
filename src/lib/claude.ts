import Anthropic from "@anthropic-ai/sdk";

const SYSTEM_PROMPT = `あなたは親切で丁寧な日本語のAIアシスタントです。
ユーザーからのメッセージに対して、わかりやすく簡潔に回答してください。
回答は300文字以内を目安にしてください。`;

/** Claude API でメッセージに応答する */
export async function askClaude(userMessage: string, apiKey: string): Promise<string> {
  const client = new Anthropic({ apiKey });

  const response = await client.messages.create({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userMessage }],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  return textBlock ? textBlock.text : "すみません、応答を生成できませんでした。";
}
