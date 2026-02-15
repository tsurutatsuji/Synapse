/**
 * 入力バリデーションスキーマ
 *
 * 全 API エンドポイントで使用する Zod スキーマを定義する。
 */

import { z } from "zod";

/** 許可される AI プロバイダーの一覧 */
const AI_PROVIDERS = ["claude", "gpt", "gemini-flash"] as const;

/** デプロイ API のリクエストボディ */
export const deploySchema = z.object({
  aiProvider: z.enum(AI_PROVIDERS, {
    message: "不正な AI プロバイダーです",
  }),
  aiApiKey: z
    .string()
    .max(500, "API キーが長すぎます")
    .default(""),
  lineToken: z
    .string()
    .min(1, "LINE チャネルアクセストークンが必要です")
    .max(500, "トークンが長すぎます"),
  lineSecret: z
    .string()
    .min(1, "LINE チャネルシークレットが必要です")
    .max(200, "シークレットが長すぎます"),
});

export type DeployInput = z.infer<typeof deploySchema>;

/** agentId のフォーマット（英数字とハイフンのみ） */
export const agentIdSchema = z
  .string()
  .regex(/^ec-[a-f0-9]{12}$/, "不正な agentId フォーマットです");

/** メールアドレスの基本バリデーション */
export const emailSchema = z.string().email("不正なメールアドレスです").max(320);

/**
 * OPENCLAW_HOST の URL バリデーション。
 * 本番環境では HTTPS を強制する。
 */
export function validateOpenClawHost(url: string): void {
  if (!url) {
    throw new Error("OPENCLAW_HOST が設定されていません");
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error("OPENCLAW_HOST の URL が不正です");
  }

  // localhost / 開発環境では HTTP を許可、本番では HTTPS を強制
  const isLocal =
    parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1";
  if (!isLocal && parsed.protocol !== "https:") {
    throw new Error(
      "OPENCLAW_HOST は HTTPS でなければなりません（本番環境）"
    );
  }
}
