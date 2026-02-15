/* ================================================================
 *  EasyClaw OpenClaw Wrapper
 *
 *  本物の OpenClaw Gateway を子プロセスとして起動し、
 *  管理API と LINE Webhook プロキシを提供する薄いラッパー。
 *
 *  ┌─────────────────────────────────────────────┐
 *  │  Express (PORT)                             │
 *  │  ├── /_admin/*  → 管理API (エージェント管理) │
 *  │  ├── /line/*    → LINE Webhook プロキシ     │
 *  │  └── /health    → ヘルスチェック             │
 *  │                                             │
 *  │  OpenClaw Gateway (子プロセス, port 18789)   │
 *  │  └── LINE / AI / Memory / Skills 全部処理    │
 *  └─────────────────────────────────────────────┘
 *
 *  自分のコード: 管理とプロキシだけ（〜200行）
 *  OpenClaw 本体: npm パッケージとして外部依存
 * ================================================================ */

import express from "express";
import { startGateway, isGatewayRunning } from "./gateway-manager";
import { createAdminRouter } from "./admin-api";
import { createProxyRouter } from "./proxy";
import { listAgents } from "./config-manager";

const app = express();
const PORT = parseInt(process.env.PORT || "3100", 10);

// 許可するオリジン（環境変数で設定、カンマ区切り）
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || "").split(",").filter(Boolean);

// ── Security Middleware ─────────────────────────────────────────

// セキュリティヘッダー
app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  // 本番では HTTPS 強制
  if (process.env.NODE_ENV === "production") {
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }
  next();
});

// CORS 制御
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Methods", "GET, PUT, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Access-Control-Max-Age", "86400");
  }
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }
  next();
});

// リクエストボディのサイズ制限
app.use("/line", express.raw({ type: "application/json", limit: "1mb" }));
app.use(express.json({ limit: "100kb" }));

// ── Simple Rate Limiter ─────────────────────────────────────────

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60_000; // 1分
const RATE_LIMIT_MAX_ADMIN = 30;     // 管理API: 1分に30リクエスト
const RATE_LIMIT_MAX_WEBHOOK = 300;  // Webhook: 1分に300リクエスト

function rateLimit(max: number) {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || "unknown";
    const key = `${ip}:${req.baseUrl}`;
    const now = Date.now();

    const record = rateLimitMap.get(key);
    if (!record || now > record.resetAt) {
      rateLimitMap.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
      next();
      return;
    }

    record.count++;
    if (record.count > max) {
      res.status(429).json({ error: "Rate limit exceeded" });
      return;
    }
    next();
  };
}

// 定期的にレート制限マップをクリーンアップ
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitMap.entries()) {
    if (now > record.resetAt) rateLimitMap.delete(key);
  }
}, 60_000);

// ── Routes ───────────────────────────────────────────────────────

// 管理API（ダッシュボードから呼ばれる）
app.use("/_admin", rateLimit(RATE_LIMIT_MAX_ADMIN), createAdminRouter());

// LINE Webhook プロキシ（LINE Platform から来る）
app.use("/line", rateLimit(RATE_LIMIT_MAX_WEBHOOK), createProxyRouter());

// ヘルスチェック（listAgents が失敗してもサーバーは生存を報告する）
app.get("/health", (_req, res) => {
  try {
    const agents = listAgents();
    res.json({
      ok: true,
      gateway: isGatewayRunning(),
      agents: agents.length,
      uptime: process.uptime(),
    });
  } catch {
    res.json({ ok: true, gateway: false, agents: 0, uptime: process.uptime() });
  }
});

// ── Start ────────────────────────────────────────────────────────

// 1. Express サーバー起動
app.listen(PORT, () => {
  console.log(`[easyclaw] Wrapper server running on port ${PORT}`);
  console.log(`[easyclaw] Admin API:  http://localhost:${PORT}/_admin/agents`);
  console.log(`[easyclaw] Health:     http://localhost:${PORT}/health`);

  // 2. OpenClaw Gateway を子プロセスとして起動
  console.log("[easyclaw] Starting OpenClaw Gateway...");
  try {
    startGateway();
  } catch (e) {
    console.error("[easyclaw] Gateway startup failed:", e);
    console.error("[easyclaw] Admin API is still available for debugging.");
  }
});
