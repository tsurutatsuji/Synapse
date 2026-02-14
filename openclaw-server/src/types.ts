/* ================================================================
 *  EasyClaw OpenClaw Wrapper — Type Definitions
 *
 *  OpenClaw の openclaw.json 設定ファイルの型と、
 *  管理API で使う型を定義する。
 * ================================================================ */

// ── openclaw.json の構造 ─────────────────────────────────────────

export interface OpenClawConfig {
  gateway: GatewayConfig;
  agents: AgentsConfig;
  channels: ChannelsConfig;
  bindings: Binding[];
}

export interface GatewayConfig {
  port: number;
  bind: string;
  auth: {
    mode: string;
    token: string;
  };
}

export interface AgentsConfig {
  defaults: {
    model: ModelConfig;
  };
  list: AgentEntry[];
}

export interface ModelConfig {
  primary: string;
  fallbacks?: string[];
}

export interface AgentEntry {
  id: string;
  workspace: string;
  agentDir: string;
  model?: ModelConfig;
}

export interface ChannelsConfig {
  line: {
    accounts: Record<string, LineAccountConfig>;
  };
}

export interface LineAccountConfig {
  channelAccessToken: string;
  channelSecret: string;
  webhookPath: string;
}

export interface Binding {
  agentId: string;
  match: {
    channel: string;
    accountId: string;
  };
}

// ── 管理API リクエスト ────────────────────────────────────────────

export interface RegisterAgentRequest {
  agentId: string;
  model: string;
  aiApiKey?: string;
  line: {
    channelAccessToken: string;
    channelSecret: string;
    webhookPath?: string;
  };
  soul?: {
    language?: string;
    description?: string;
  };
}

// ── AI プロバイダー → auth-profiles.json の型 ─────────────────────

export interface AuthProfiles {
  profiles: Record<string, AuthProfile>;
}

export interface AuthProfile {
  mode: string;
  apiKey: string;
}
