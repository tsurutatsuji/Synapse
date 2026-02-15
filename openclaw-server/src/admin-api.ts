/* ================================================================
 *  Admin API
 *
 *  ダッシュボードからエージェントを管理するための REST API。
 *  既存の API 契約（PUT /_admin/agents 等）を維持しつつ、
 *  裏側は config-manager 経由で本物の OpenClaw を設定する。
 *
 *  セキュリティ対策:
 *  - タイミング攻撃耐性のある認証（timingSafeEqual）
 *  - ブルートフォース対策（IP ベースのロックアウト）
 *  - 入力バリデーション（agentId, model, credentials）
 *  - エラーメッセージから内部情報を除去
 * ================================================================ */

import crypto from "crypto";
import { Router } from "express";
import {
  addAgent,
  removeAgent,
  getAgent,
  listAgents,
} from "./config-manager";
import { isGatewayRunning } from "./gateway-manager";
import type { RegisterAgentRequest } from "./types";

const ADMIN_KEY = process.env.OPENCLAW_ADMIN_KEY || "";

// agentId のフォーマット: "ec-" + 12文字の16進数
const AGENT_ID_RE = /^ec-[a-f0-9]{12}$/;

// 許可されるモデル名
const ALLOWED_MODELS = [
  "anthropic/claude-sonnet-4-5-20250929",
  "openai/gpt-4o",
  "google/gemini-2.0-flash",
];

/**
 * タイミング攻撃に耐性のある文字列比較。
 * SHA-256 ハッシュで長さを揃えてから timingSafeEqual で比較する。
 */
function secureCompare(a: string, b: string): boolean {
  const hashA = crypto.createHash("sha256").update(a).digest();
  const hashB = crypto.createHash("sha256").update(b).digest();
  return crypto.timingSafeEqual(hashA, hashB);
}

/** ブルートフォース対策: IP ごとの認証失敗回数を追跡 */
const failedAttempts = new Map<string, { count: number; lastAttempt: number }>();
const MAX_FAILED_ATTEMPTS = 10;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15分

function isLockedOut(ip: string): boolean {
  const record = failedAttempts.get(ip);
  if (!record) return false;
  if (Date.now() - record.lastAttempt > LOCKOUT_DURATION_MS) {
    failedAttempts.delete(ip);
    return false;
  }
  return record.count >= MAX_FAILED_ATTEMPTS;
}

function recordFailedAttempt(ip: string): void {
  const record = failedAttempts.get(ip) || { count: 0, lastAttempt: 0 };
  record.count++;
  record.lastAttempt = Date.now();
  failedAttempts.set(ip, record);
}

export function createAdminRouter(): Router {
  const router = Router();

  // 認証ミドルウェア
  router.use((req, res, next) => {
    const ip = req.ip || req.socket.remoteAddress || "unknown";

    if (isLockedOut(ip)) {
      res.status(429).json({ error: "Too many failed attempts" });
      return;
    }

    if (!ADMIN_KEY) {
      console.error("[admin] OPENCLAW_ADMIN_KEY is not configured");
      res.status(500).json({ error: "Server configuration error" });
      return;
    }

    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith("Bearer ")) {
      recordFailedAttempt(ip);
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const token = auth.slice(7);
    if (!secureCompare(token, ADMIN_KEY)) {
      recordFailedAttempt(ip);
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    next();
  });

  // PUT /_admin/agents — エージェント登録/更新
  router.put("/agents", (req, res) => {
    const body = req.body as Partial<RegisterAgentRequest>;

    // agentId バリデーション
    if (!body.agentId || !AGENT_ID_RE.test(body.agentId)) {
      res.status(400).json({ error: "Invalid agentId format" });
      return;
    }

    // モデル バリデーション
    if (body.model && !ALLOWED_MODELS.includes(body.model)) {
      res.status(400).json({ error: "Invalid model" });
      return;
    }

    // LINE クレデンシャル バリデーション
    if (
      !body.line?.channelAccessToken ||
      !body.line?.channelSecret ||
      body.line.channelAccessToken.length > 500 ||
      body.line.channelSecret.length > 200
    ) {
      res.status(400).json({ error: "Invalid LINE credentials" });
      return;
    }

    // API キーの長さ制限
    if (body.aiApiKey && body.aiApiKey.length > 500) {
      res.status(400).json({ error: "Invalid API key" });
      return;
    }

    const request: RegisterAgentRequest = {
      agentId: body.agentId,
      model: body.model || "google/gemini-2.0-flash",
      aiApiKey: body.aiApiKey,
      line: {
        channelAccessToken: body.line.channelAccessToken,
        channelSecret: body.line.channelSecret,
        webhookPath: `/line/${body.agentId}`,
      },
      soul: body.soul,
    };

    try {
      addAgent(request);
      console.log(`[admin] Agent registered: ${request.agentId}`);
      res.json({ ok: true, agentId: request.agentId });
    } catch (e) {
      console.error("[admin] Failed to register agent:", e);
      // 内部エラーの詳細をクライアントに返さない
      res.status(500).json({ error: "Failed to register agent" });
    }
  });

  // GET /_admin/agents/:agentId/health — ヘルスチェック
  router.get("/agents/:agentId/health", (req, res) => {
    const agentId = req.params.agentId;

    if (!AGENT_ID_RE.test(agentId)) {
      res.status(400).json({ error: "Invalid agentId format" });
      return;
    }

    const agent = getAgent(agentId);
    if (!agent) {
      res.status(404).json({ error: "Agent not found" });
      return;
    }
    res.json({
      ok: true,
      agentId: agent.id,
      gatewayRunning: isGatewayRunning(),
    });
  });

  // DELETE /_admin/agents/:agentId — エージェント削除
  router.delete("/agents/:agentId", (req, res) => {
    const agentId = req.params.agentId;

    if (!AGENT_ID_RE.test(agentId)) {
      res.status(400).json({ error: "Invalid agentId format" });
      return;
    }

    const deleted = removeAgent(agentId);
    res.json({ ok: true, deleted });
  });

  // GET /_admin/agents — 全エージェント一覧
  router.get("/agents", (_req, res) => {
    const agents = listAgents();
    res.json({ agents });
  });

  return router;
}
