/**
 * フィールドレベル暗号化ユーティリティ
 *
 * AES-256-GCM を使って API キーや LINE トークンを暗号化する。
 * 暗号化されたデータは "v1:<iv>:<authTag>:<ciphertext>" 形式の文字列として保存される。
 *
 * 環境変数 ENCRYPTION_KEY（64文字の16進数 = 32バイト）が必要。
 */

import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const PREFIX = "v1:";

function getKey(): Buffer {
  const hex = process.env.ENCRYPTION_KEY;
  if (!hex || hex.length !== 64) {
    throw new Error(
      "ENCRYPTION_KEY が未設定または不正です。64文字の16進数文字列を設定してください。"
    );
  }
  return Buffer.from(hex, "hex");
}

/**
 * 平文を暗号化して "v1:<iv>:<authTag>:<ciphertext>" 形式の文字列を返す。
 * 空文字列の場合はそのまま返す。
 */
export function encrypt(plaintext: string): string {
  if (!plaintext) return "";

  const key = getKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  return `${PREFIX}${iv.toString("base64")}:${authTag.toString("base64")}:${encrypted.toString("base64")}`;
}

/**
 * 暗号化された文字列を復号して平文を返す。
 * "v1:" プレフィックスがない場合（＝レガシーの平文データ）はそのまま返す。
 */
export function decrypt(ciphertext: string): string {
  if (!ciphertext) return "";

  // v1: プレフィックスがなければ、まだ暗号化されていないレガシーデータ
  if (!ciphertext.startsWith(PREFIX)) {
    return ciphertext;
  }

  const key = getKey();
  const parts = ciphertext.slice(PREFIX.length).split(":");

  if (parts.length !== 3) {
    throw new Error("暗号化データのフォーマットが不正です");
  }

  const iv = Buffer.from(parts[0], "base64");
  const authTag = Buffer.from(parts[1], "base64");
  const encrypted = Buffer.from(parts[2], "base64");

  if (iv.length !== IV_LENGTH || authTag.length !== AUTH_TAG_LENGTH) {
    throw new Error("暗号化データのパラメータが不正です");
  }

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}

/**
 * 機密データをマスクして表示用の文字列を返す。
 * 例: "sk-ant-api03-xxxx...xxxx" → "****xxxx"
 */
export function mask(value: string): string {
  if (!value) return "";
  // 復号してからマスク
  const plain = decrypt(value);
  if (plain.length <= 4) return "****";
  return "****" + plain.slice(-4);
}

/**
 * 値が暗号化済みかどうかを判定する。
 */
export function isEncrypted(value: string): boolean {
  return value.startsWith(PREFIX);
}
