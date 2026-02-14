/* ================================================================
 *  LINE Webhook Proxy
 *
 *  外部からの LINE Webhook リクエストを、内部で動いている
 *  本物の OpenClaw Gateway に転送する。
 *
 *  POST /line/:accountId
 *    → http://127.0.0.1:18789/webhook/line/:accountId
 *
 *  Raw body と全ヘッダー（特に x-line-signature）をそのまま転送。
 * ================================================================ */

import { Router, Request, Response } from "express";
import { getGatewayPort, isGatewayRunning } from "./gateway-manager";

export function createProxyRouter(): Router {
  const router = Router();

  // raw body で受け取る（署名検証に必要）
  router.post("/:accountId", async (req: Request, res: Response) => {
    if (!isGatewayRunning()) {
      res.status(503).json({ error: "Gateway is not running" });
      return;
    }

    const accountId = req.params.accountId;
    const gatewayPort = getGatewayPort();
    const targetUrl = `http://127.0.0.1:${gatewayPort}/webhook/line/${accountId}`;

    try {
      const body = req.body as Buffer;

      const proxyRes = await fetch(targetUrl, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-line-signature": (req.headers["x-line-signature"] as string) || "",
          "user-agent": (req.headers["user-agent"] as string) || "",
        },
        body,
      });

      // LINE は即座に 200 を返す必要があるため、
      // Gateway が応答を返すのを待ってから返す
      const responseBody = await proxyRes.text();
      res.status(proxyRes.status).send(responseBody);
    } catch (e) {
      console.error(`[proxy] Failed to forward webhook for ${accountId}:`, e);
      // LINE に 200 を返さないとリトライが続くので、
      // エラーでも 200 を返す
      res.status(200).json({ ok: true, proxied: false });
    }
  });

  return router;
}
