import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * 診断API — 各コンポーネントの接続状態をチェックして返す。
 *
 * チェック項目:
 *   1. データベース接続
 *   2. ENCRYPTION_KEY の設定
 *   3. OPENCLAW_HOST（Railway）への接続
 *   4. OPENCLAW_ADMIN_KEY の有効性
 *   5. ユーザーレコードの存在
 */

type CheckResult = {
  name: string;
  status: "ok" | "error";
  message: string;
};

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  const checks: CheckResult[] = [];

  // ── 1. データベース接続 ──
  let dbConnected = false;
  try {
    const { prisma } = await import("@/lib/prisma");
    await prisma.$queryRaw`SELECT 1`;
    dbConnected = true;
    checks.push({
      name: "データベース",
      status: "ok",
      message: "接続OK",
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "不明なエラー";
    // 内部情報を除去
    const safeMsg = msg.includes("connect")
      ? "データベースに接続できません"
      : msg.includes("does not exist")
      ? "テーブルが見つかりません。マイグレーションが必要です"
      : "データベースエラー";
    checks.push({
      name: "データベース",
      status: "error",
      message: safeMsg,
    });
  }

  // ── 2. ENCRYPTION_KEY ──
  const encKey = process.env.ENCRYPTION_KEY || "";
  if (!encKey) {
    checks.push({
      name: "暗号化キー",
      status: "error",
      message: "ENCRYPTION_KEY が設定されていません",
    });
  } else if (encKey.length !== 64 || !/^[0-9a-fA-F]{64}$/.test(encKey)) {
    checks.push({
      name: "暗号化キー",
      status: "error",
      message: `ENCRYPTION_KEY の形式が不正です（現在 ${encKey.length} 文字、64文字の16進数が必要）`,
    });
  } else {
    // 実際に暗号化→復号してテスト
    try {
      const { encrypt, decrypt } = await import("@/lib/crypto");
      const testPlain = "diagnostics-test";
      const encrypted = encrypt(testPlain);
      const decrypted = decrypt(encrypted);
      if (decrypted === testPlain) {
        checks.push({
          name: "暗号化キー",
          status: "ok",
          message: "暗号化・復号テストOK",
        });
      } else {
        checks.push({
          name: "暗号化キー",
          status: "error",
          message: "暗号化・復号の結果が一致しません",
        });
      }
    } catch {
      checks.push({
        name: "暗号化キー",
        status: "error",
        message: "暗号化処理でエラーが発生しました",
      });
    }
  }

  // ── 3. OPENCLAW_HOST（Railway接続） ──
  const openclawHost = process.env.OPENCLAW_HOST || "";
  if (!openclawHost) {
    checks.push({
      name: "AIサーバー",
      status: "error",
      message: "OPENCLAW_HOST が設定されていません",
    });
  } else {
    try {
      const healthRes = await fetch(`${openclawHost}/health`, {
        signal: AbortSignal.timeout(10000),
      });
      if (healthRes.ok) {
        const data = await healthRes.json().catch(() => ({}));
        checks.push({
          name: "AIサーバー",
          status: "ok",
          message: `接続OK（Gateway: ${data.gateway ? "起動中" : "停止中"}, エージェント数: ${data.agents ?? "不明"})`,
        });
      } else {
        checks.push({
          name: "AIサーバー",
          status: "error",
          message: `AIサーバーが応答しましたがエラーです（HTTP ${healthRes.status}）`,
        });
      }
    } catch (e) {
      const msg = e instanceof TypeError
        ? "AIサーバーに接続できません（ネットワークエラー）"
        : e instanceof Error && e.name === "TimeoutError"
        ? "AIサーバーの応答がタイムアウトしました（10秒）"
        : "AIサーバーへの接続中にエラーが発生しました";
      checks.push({
        name: "AIサーバー",
        status: "error",
        message: msg,
      });
    }
  }

  // ── 4. OPENCLAW_ADMIN_KEY ──
  const adminKey = process.env.OPENCLAW_ADMIN_KEY || "";
  if (!adminKey) {
    checks.push({
      name: "管理キー",
      status: "error",
      message: "OPENCLAW_ADMIN_KEY が設定されていません",
    });
  } else if (openclawHost) {
    try {
      const adminRes = await fetch(`${openclawHost}/_admin/agents`, {
        headers: { Authorization: `Bearer ${adminKey}` },
        signal: AbortSignal.timeout(10000),
      });
      if (adminRes.ok) {
        checks.push({
          name: "管理キー",
          status: "ok",
          message: "管理APIに正常にアクセスできました",
        });
      } else if (adminRes.status === 401 || adminRes.status === 403) {
        checks.push({
          name: "管理キー",
          status: "error",
          message: "管理キーが正しくありません（認証エラー）",
        });
      } else {
        checks.push({
          name: "管理キー",
          status: "error",
          message: `管理APIがエラーを返しました（HTTP ${adminRes.status}）`,
        });
      }
    } catch {
      checks.push({
        name: "管理キー",
        status: "error",
        message: "管理APIに接続できません（AIサーバーが停止中の可能性があります）",
      });
    }
  } else {
    checks.push({
      name: "管理キー",
      status: "error",
      message: "OPENCLAW_HOST 未設定のためチェックできません",
    });
  }

  // ── 5. ユーザーレコード ──
  if (dbConnected) {
    try {
      const { ensureUser } = await import("@/lib/ensure-user");
      const user = await ensureUser(session.user.email);
      checks.push({
        name: "ユーザー",
        status: "ok",
        message: `ユーザー登録済み（ID: ${user.id.slice(0, 8)}...）`,
      });
    } catch {
      checks.push({
        name: "ユーザー",
        status: "error",
        message: "ユーザーレコードの読み込みに失敗しました",
      });
    }
  } else {
    checks.push({
      name: "ユーザー",
      status: "error",
      message: "データベース未接続のためチェックできません",
    });
  }

  const allOk = checks.every((c) => c.status === "ok");

  return NextResponse.json({ ok: allOk, checks });
}
