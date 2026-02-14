import express from "express";
import crypto from "crypto";
import fs from "fs";
import path from "path";

/* ================================================================
 *  OpenClaw Multi-Tenant Server
 *
 *  1台のサーバーで複数ユーザーの LINE Bot を動かす。
 *  EasyClaw のダッシュボードから /_admin/agents API で登録し、
 *  LINE webhook は /line/:agentId で受け取る。
 * ================================================================ */

const app = express();
const PORT = parseInt(process.env.PORT || "3100", 10);
const ADMIN_KEY = process.env.OPENCLAW_ADMIN_KEY || "";
const AGENTS_FILE = path.join(process.cwd(), "agents.json");

// ─── Agent Store ─────────────────────────────────────────────────

interface AgentConfig {
  agentId: string;
  model: string;
  aiApiKey?: string;
  line: {
    channelAccessToken: string;
    channelSecret: string;
    webhookPath: string;
  };
  createdAt: string;
}

let agents: Map<string, AgentConfig> = new Map();

function loadAgents() {
  try {
    if (fs.existsSync(AGENTS_FILE)) {
      const data = JSON.parse(fs.readFileSync(AGENTS_FILE, "utf-8"));
      agents = new Map(Object.entries(data));
      console.log(`[store] ${agents.size} agents loaded`);
    }
  } catch (e) {
    console.error("[store] Failed to load agents:", e);
  }
}

function saveAgents() {
  try {
    const obj: Record<string, AgentConfig> = {};
    agents.forEach((v, k) => (obj[k] = v));
    fs.writeFileSync(AGENTS_FILE, JSON.stringify(obj, null, 2));
  } catch (e) {
    console.error("[store] Failed to save agents:", e);
  }
}

loadAgents();

// ─── Middleware ───────────────────────────────────────────────────

// LINE webhook needs raw body for signature verification
app.use("/line", express.raw({ type: "application/json" }));
app.use(express.json());

function requireAdmin(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
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
}

// ─── Admin API ───────────────────────────────────────────────────

// PUT /_admin/agents — Register or update an agent
app.put("/_admin/agents", requireAdmin, (req, res) => {
  const { agentId, model, aiApiKey, line } = req.body;

  if (!agentId || !line?.channelAccessToken || !line?.channelSecret) {
    res.status(400).json({ error: "agentId and line credentials are required" });
    return;
  }

  const config: AgentConfig = {
    agentId,
    model: model || "google/gemini-2.0-flash",
    aiApiKey,
    line: {
      channelAccessToken: line.channelAccessToken,
      channelSecret: line.channelSecret,
      webhookPath: line.webhookPath || `/line/${agentId}`,
    },
    createdAt: agents.get(agentId)?.createdAt || new Date().toISOString(),
  };

  agents.set(agentId, config);
  saveAgents();

  console.log(`[admin] Agent registered: ${agentId} (${model})`);
  res.json({ ok: true, agentId });
});

// GET /_admin/agents/:agentId/health — Health check
app.get("/_admin/agents/:agentId/health", requireAdmin, (req, res) => {
  const agent = agents.get(req.params.agentId);
  if (!agent) {
    res.status(404).json({ error: "Agent not found" });
    return;
  }
  res.json({ ok: true, agentId: agent.agentId, model: agent.model });
});

// DELETE /_admin/agents/:agentId — Remove an agent
app.delete("/_admin/agents/:agentId", requireAdmin, (req, res) => {
  const deleted = agents.delete(req.params.agentId);
  if (deleted) saveAgents();
  res.json({ ok: true, deleted });
});

// GET /_admin/agents — List all agents (for debugging)
app.get("/_admin/agents", requireAdmin, (_req, res) => {
  const list = Array.from(agents.values()).map((a) => ({
    agentId: a.agentId,
    model: a.model,
    createdAt: a.createdAt,
  }));
  res.json({ agents: list });
});

// ─── LINE Webhook ────────────────────────────────────────────────

app.post("/line/:agentId", async (req, res) => {
  const agent = agents.get(req.params.agentId);
  if (!agent) {
    res.status(404).json({ error: "Agent not found" });
    return;
  }

  // Verify LINE signature
  const signature = req.headers["x-line-signature"] as string;
  const body = req.body as Buffer;

  if (!verifySignature(body, signature, agent.line.channelSecret)) {
    console.warn(`[webhook] Invalid signature for agent ${agent.agentId}`);
    res.status(401).json({ error: "Invalid signature" });
    return;
  }

  // Respond to LINE immediately (LINE requires 200 within 1s)
  res.status(200).json({ ok: true });

  // Process events asynchronously
  try {
    const payload = JSON.parse(body.toString());
    const events = payload.events || [];

    for (const event of events) {
      if (event.type === "message" && event.message?.type === "text") {
        await handleTextMessage(agent, event);
      }
    }
  } catch (e) {
    console.error(`[webhook] Error processing events for ${agent.agentId}:`, e);
  }
});

function verifySignature(
  body: Buffer,
  signature: string,
  channelSecret: string
): boolean {
  if (!signature) return false;
  const hmac = crypto.createHmac("SHA256", channelSecret);
  hmac.update(body);
  const expected = hmac.digest("base64");
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  );
}

// ─── Message Handling ────────────────────────────────────────────

async function handleTextMessage(agent: AgentConfig, event: LineEvent) {
  const userMessage = event.message.text;
  const replyToken = event.replyToken;

  console.log(`[${agent.agentId}] Received: "${userMessage.slice(0, 50)}..."`);

  try {
    const aiReply = await callAI(agent, userMessage);
    await replyToLine(agent.line.channelAccessToken, replyToken, aiReply);
    console.log(`[${agent.agentId}] Replied: "${aiReply.slice(0, 50)}..."`);
  } catch (e) {
    console.error(`[${agent.agentId}] AI/Reply error:`, e);
    await replyToLine(
      agent.line.channelAccessToken,
      replyToken,
      "すみません、エラーが発生しました。しばらくしてからもう一度お試しください。"
    );
  }
}

interface LineEvent {
  type: string;
  replyToken: string;
  message: { type: string; text: string };
  source: { userId: string; type: string };
}

// ─── AI Providers ────────────────────────────────────────────────

async function callAI(agent: AgentConfig, userMessage: string): Promise<string> {
  const model = agent.model;

  if (model.startsWith("anthropic/")) {
    return callClaude(agent.aiApiKey || "", model.replace("anthropic/", ""), userMessage);
  }
  if (model.startsWith("openai/")) {
    return callOpenAI(agent.aiApiKey || "", model.replace("openai/", ""), userMessage);
  }
  if (model.startsWith("google/")) {
    return callGemini(agent.aiApiKey || "", model.replace("google/", ""), userMessage);
  }

  throw new Error(`Unsupported model: ${model}`);
}

const SYSTEM_PROMPT =
  "あなたは親切で優秀なAIアシスタントです。LINEのチャットで会話しています。回答は簡潔に、日本語で返してください。";

async function callClaude(
  apiKey: string,
  model: string,
  userMessage: string
): Promise<string> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Claude API error ${res.status}: ${err}`);
  }

  const data = (await res.json()) as { content?: { text: string }[] };
  return data.content?.[0]?.text || "（応答を取得できませんでした）";
}

async function callOpenAI(
  apiKey: string,
  model: string,
  userMessage: string
): Promise<string> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      max_tokens: 1024,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userMessage },
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI API error ${res.status}: ${err}`);
  }

  const data = (await res.json()) as { choices?: { message: { content: string } }[] };
  return data.choices?.[0]?.message?.content || "（応答を取得できませんでした）";
}

async function callGemini(
  apiKey: string,
  model: string,
  userMessage: string
): Promise<string> {
  // Gemini Flash は無料枠がある。API キーがなければ GOOGLE_AI_KEY を使う
  const key = apiKey || process.env.GOOGLE_AI_KEY || "";
  if (!key) throw new Error("Google AI API key is required for Gemini");

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: [{ parts: [{ text: userMessage }] }],
      generationConfig: { maxOutputTokens: 1024 },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API error ${res.status}: ${err}`);
  }

  const data = (await res.json()) as {
    candidates?: { content: { parts: { text: string }[] } }[];
  };
  return (
    data.candidates?.[0]?.content?.parts?.[0]?.text ||
    "（応答を取得できませんでした）"
  );
}

// ─── LINE Reply ──────────────────────────────────────────────────

async function replyToLine(
  channelAccessToken: string,
  replyToken: string,
  text: string
) {
  // LINE has a 5000 character limit per message
  const truncated = text.length > 4900 ? text.slice(0, 4900) + "..." : text;

  const res = await fetch("https://api.line.me/v2/bot/message/reply", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${channelAccessToken}`,
    },
    body: JSON.stringify({
      replyToken,
      messages: [{ type: "text", text: truncated }],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`LINE Reply API error ${res.status}: ${err}`);
  }
}

// ─── Health ──────────────────────────────────────────────────────

app.get("/health", (_req, res) => {
  res.json({ ok: true, agents: agents.size, uptime: process.uptime() });
});

// ─── Start ───────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`[openclaw] Multi-tenant server running on port ${PORT}`);
  console.log(`[openclaw] ${agents.size} agents loaded`);
  if (!ADMIN_KEY) {
    console.warn("[openclaw] WARNING: OPENCLAW_ADMIN_KEY is not set!");
  }
});
