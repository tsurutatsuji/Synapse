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

// ── Middleware ────────────────────────────────────────────────────

// LINE webhook は raw body が必要（署名検証のため）
app.use("/line", express.raw({ type: "application/json" }));
app.use(express.json());

// ── Routes ───────────────────────────────────────────────────────

// 管理API（ダッシュボードから呼ばれる）
app.use("/_admin", createAdminRouter());

// LINE Webhook プロキシ（LINE Platform から来る）
app.use("/line", createProxyRouter());

// ヘルスチェック
app.get("/health", (_req, res) => {
  const agents = listAgents();
  res.json({
    ok: true,
    gateway: isGatewayRunning(),
    agents: agents.length,
    uptime: process.uptime(),
  });
});

// ── Start ────────────────────────────────────────────────────────

// 1. Express サーバー起動
app.listen(PORT, () => {
  console.log(`[easyclaw] Wrapper server running on port ${PORT}`);
  console.log(`[easyclaw] Admin API:  http://localhost:${PORT}/_admin/agents`);
  console.log(`[easyclaw] Health:     http://localhost:${PORT}/health`);

  // 2. OpenClaw Gateway を子プロセスとして起動
  console.log("[easyclaw] Starting OpenClaw Gateway...");
  startGateway();
});
