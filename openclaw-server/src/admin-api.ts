/* ================================================================
 *  Admin API
 *
 *  ダッシュボードからエージェントを管理するための REST API。
 *  既存の API 契約（PUT /_admin/agents 等）を維持しつつ、
 *  裏側は config-manager 経由で本物の OpenClaw を設定する。
 * ================================================================ */

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

export function createAdminRouter(): Router {
  const router = Router();

  // 認証ミドルウェア
  router.use((req, res, next) => {
    if (!ADMIN_KEY) {
      res.status(500).json({ error: "OPENCLAW_ADMIN_KEY not configured" });
      return;
    }
    const auth = req.headers.authorization;
    if (auth !== `Bearer ${ADMIN_KEY}`) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    next();
  });

  // PUT /_admin/agents — エージェント登録/更新
  router.put("/agents", (req, res) => {
    const body = req.body as Partial<RegisterAgentRequest>;

    if (
      !body.agentId ||
      !body.line?.channelAccessToken ||
      !body.line?.channelSecret
    ) {
      res
        .status(400)
        .json({ error: "agentId and line credentials are required" });
      return;
    }

    const request: RegisterAgentRequest = {
      agentId: body.agentId,
      model: body.model || "google/gemini-2.0-flash",
      aiApiKey: body.aiApiKey,
      line: {
        channelAccessToken: body.line.channelAccessToken,
        channelSecret: body.line.channelSecret,
        webhookPath: body.line.webhookPath || `/line/${body.agentId}`,
      },
      soul: body.soul,
    };

    try {
      addAgent(request);
      console.log(`[admin] Agent registered: ${request.agentId} (${request.model})`);
      res.json({ ok: true, agentId: request.agentId });
    } catch (e) {
      console.error("[admin] Failed to register agent:", e);
      res.status(500).json({
        error: e instanceof Error ? e.message : "Failed to register agent",
      });
    }
  });

  // GET /_admin/agents/:agentId/health — ヘルスチェック
  router.get("/agents/:agentId/health", (req, res) => {
    const agent = getAgent(req.params.agentId);
    if (!agent) {
      res.status(404).json({ error: "Agent not found" });
      return;
    }
    res.json({
      ok: true,
      agentId: agent.id,
      model: agent.model?.primary || "default",
      gatewayRunning: isGatewayRunning(),
    });
  });

  // DELETE /_admin/agents/:agentId — エージェント削除
  router.delete("/agents/:agentId", (req, res) => {
    const deleted = removeAgent(req.params.agentId);
    res.json({ ok: true, deleted });
  });

  // GET /_admin/agents — 全エージェント一覧
  router.get("/agents", (_req, res) => {
    const agents = listAgents();
    res.json({ agents });
  });

  return router;
}
