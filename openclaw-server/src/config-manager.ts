/* ================================================================
 *  Config Manager
 *
 *  OpenClaw の openclaw.json を読み書きする。
 *  エージェントの追加・削除時にこのファイルを更新すると、
 *  Gateway がファイル変更を検知して自動リロードする。
 * ================================================================ */

import fs from "fs";
import path from "path";
import type {
  OpenClawConfig,
  AgentEntry,
  LineAccountConfig,
  Binding,
  AuthProfiles,
  RegisterAgentRequest,
} from "./types";

const STATE_DIR = process.env.OPENCLAW_STATE_DIR || "/data/.openclaw";
const WORKSPACE_DIR = process.env.OPENCLAW_WORKSPACE_DIR || "/data/workspaces";
const CONFIG_PATH = path.join(STATE_DIR, "openclaw.json");

// ── ディレクトリ初期化 ───────────────────────────────────────────

export function ensureDirectories(): void {
  const dirs = [
    STATE_DIR,
    path.join(STATE_DIR, "agents"),
    WORKSPACE_DIR,
  ];
  for (const dir of dirs) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// ── 設定ファイルの読み書き ────────────────────────────────────────

export function readConfig(): OpenClawConfig {
  if (!fs.existsSync(CONFIG_PATH)) {
    const initial = createInitialConfig();
    writeConfig(initial);
    return initial;
  }
  const raw = fs.readFileSync(CONFIG_PATH, "utf-8");
  return JSON.parse(raw) as OpenClawConfig;
}

export function writeConfig(config: OpenClawConfig): void {
  fs.mkdirSync(path.dirname(CONFIG_PATH), { recursive: true, mode: 0o700 });
  // 機密情報を含むため、オーナーのみ読み書き可能
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), { mode: 0o600 });
  console.log("[config] openclaw.json updated");
}

function createInitialConfig(): OpenClawConfig {
  const gatewayToken = process.env.GATEWAY_TOKEN || "easyclaw-internal";
  return {
    gateway: {
      port: 18789,
      bind: "loopback",
      auth: { mode: "token", token: gatewayToken },
    },
    agents: {
      defaults: {
        model: { primary: "google/gemini-2.0-flash" },
      },
      list: [],
    },
    channels: {
      line: { accounts: {} },
    },
    bindings: [],
  };
}

// ── エージェント操作 ──────────────────────────────────────────────

export function addAgent(req: RegisterAgentRequest): void {
  const config = readConfig();
  const { agentId, model, aiApiKey, line, soul } = req;

  const agentDir = path.join(STATE_DIR, "agents", agentId, "agent");
  const workspace = path.join(WORKSPACE_DIR, agentId);

  // 1. agents.list に追加（既存なら更新）
  const existing = config.agents.list.findIndex((a) => a.id === agentId);
  const entry: AgentEntry = {
    id: agentId,
    workspace,
    agentDir,
    model: { primary: model },
  };
  if (existing >= 0) {
    config.agents.list[existing] = entry;
  } else {
    config.agents.list.push(entry);
  }

  // 2. channels.line.accounts に追加
  const webhookPath = line.webhookPath || `/line/${agentId}`;
  const lineAccount: LineAccountConfig = {
    channelAccessToken: line.channelAccessToken,
    channelSecret: line.channelSecret,
    webhookPath,
  };
  config.channels.line.accounts[agentId] = lineAccount;

  // 3. bindings に追加（既存なら更新）
  const bindingIdx = config.bindings.findIndex((b) => b.agentId === agentId);
  const binding: Binding = {
    agentId,
    match: { channel: "line", accountId: agentId },
  };
  if (bindingIdx >= 0) {
    config.bindings[bindingIdx] = binding;
  } else {
    config.bindings.push(binding);
  }

  // 設定ファイルを保存（Gateway が自動リロード）
  writeConfig(config);

  // 4. per-agent ディレクトリとファイルを作成（安全なパーミッション）
  fs.mkdirSync(agentDir, { recursive: true, mode: 0o700 });
  fs.mkdirSync(workspace, { recursive: true, mode: 0o700 });

  // 5. AI API キーを auth-profiles.json に保存
  if (aiApiKey) {
    writeAuthProfiles(agentDir, model, aiApiKey);
  }

  // 6. SOUL.md を作成（存在しなければ）
  const soulPath = path.join(workspace, "SOUL.md");
  if (!fs.existsSync(soulPath)) {
    const description = soul?.description || "親切で優秀なAIアシスタント";
    const soulContent = `# SOUL\n\nあなたは${description}です。\nLINEのチャットで日本語で会話しています。\n回答は簡潔で、わかりやすくしてください。\n`;
    fs.writeFileSync(soulPath, soulContent);
  }

  console.log(`[config] Agent added: ${agentId} (${model})`);
}

export function removeAgent(agentId: string): boolean {
  const config = readConfig();

  // agents.list から削除
  const agentIdx = config.agents.list.findIndex((a) => a.id === agentId);
  if (agentIdx < 0) return false;
  config.agents.list.splice(agentIdx, 1);

  // channels.line.accounts から削除
  delete config.channels.line.accounts[agentId];

  // bindings から削除
  config.bindings = config.bindings.filter((b) => b.agentId !== agentId);

  writeConfig(config);
  console.log(`[config] Agent removed: ${agentId}`);
  return true;
}

export function getAgent(agentId: string): AgentEntry | undefined {
  const config = readConfig();
  return config.agents.list.find((a) => a.id === agentId);
}

export function listAgents(): { id: string; model: string }[] {
  const config = readConfig();
  return config.agents.list.map((a) => ({
    id: a.id,
    model: a.model?.primary || config.agents.defaults.model.primary,
  }));
}

// ── auth-profiles.json の書き込み ─────────────────────────────────

function writeAuthProfiles(
  agentDir: string,
  model: string,
  apiKey: string
): void {
  const provider = model.split("/")[0]; // "anthropic", "openai", "google"
  const profileKey = `${provider}:user`;

  const profiles: AuthProfiles = {
    profiles: {
      [profileKey]: {
        mode: "api_key",
        apiKey,
      },
    },
  };

  const profilePath = path.join(agentDir, "auth-profiles.json");
  // API キーを含むため、オーナーのみ読み書き可能
  fs.writeFileSync(profilePath, JSON.stringify(profiles, null, 2), { mode: 0o600 });
}
