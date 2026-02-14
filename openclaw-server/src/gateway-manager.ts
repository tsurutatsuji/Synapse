/* ================================================================
 *  Gateway Manager
 *
 *  本物の OpenClaw Gateway を子プロセスとして起動・監視する。
 *  OpenClaw は npm でグローバルインストールされている前提
 *  （Dockerfile で `npm install -g openclaw` 済み）。
 * ================================================================ */

import { spawn, ChildProcess } from "child_process";
import { ensureDirectories, readConfig } from "./config-manager";

const GATEWAY_PORT = 18789;
const RESTART_DELAY_MS = 3000;
const MAX_RESTART_ATTEMPTS = 10;

let gatewayProcess: ChildProcess | null = null;
let restartCount = 0;
let stopping = false;

// ── Gateway 起動 ──────────────────────────────────────────────────

export function startGateway(): void {
  ensureDirectories();

  // 初期設定を確保（readConfig が無ければ作成する）
  readConfig();

  spawnGateway();

  // プロセス終了時に Gateway も停止
  process.on("SIGTERM", () => stopGateway());
  process.on("SIGINT", () => stopGateway());
}

function spawnGateway(): void {
  if (stopping) return;

  console.log(`[gateway] Starting OpenClaw Gateway on port ${GATEWAY_PORT}...`);

  const stateDir = process.env.OPENCLAW_STATE_DIR || "/data/.openclaw";
  const workspaceDir = process.env.OPENCLAW_WORKSPACE_DIR || "/data/workspaces";

  gatewayProcess = spawn("openclaw", ["gateway"], {
    env: {
      ...process.env,
      OPENCLAW_STATE_DIR: stateDir,
      OPENCLAW_WORKSPACE_DIR: workspaceDir,
      OPENCLAW_GATEWAY_PORT: String(GATEWAY_PORT),
      OPENCLAW_GATEWAY_BIND: "loopback",
      NODE_ENV: "production",
    },
    stdio: ["ignore", "pipe", "pipe"],
  });

  // Gateway の stdout/stderr をログに流す
  gatewayProcess.stdout?.on("data", (data: Buffer) => {
    const lines = data.toString().trim().split("\n");
    for (const line of lines) {
      console.log(`[openclaw] ${line}`);
    }
  });

  gatewayProcess.stderr?.on("data", (data: Buffer) => {
    const lines = data.toString().trim().split("\n");
    for (const line of lines) {
      console.error(`[openclaw] ${line}`);
    }
  });

  gatewayProcess.on("exit", (code, signal) => {
    console.warn(
      `[gateway] OpenClaw Gateway exited (code=${code}, signal=${signal})`
    );
    gatewayProcess = null;

    if (stopping) return;

    // 自動再起動
    restartCount++;
    if (restartCount > MAX_RESTART_ATTEMPTS) {
      console.error(
        `[gateway] Too many restarts (${MAX_RESTART_ATTEMPTS}). Giving up.`
      );
      return;
    }

    console.log(
      `[gateway] Restarting in ${RESTART_DELAY_MS}ms (attempt ${restartCount}/${MAX_RESTART_ATTEMPTS})...`
    );
    setTimeout(spawnGateway, RESTART_DELAY_MS);
  });

  gatewayProcess.on("error", (err) => {
    console.error(`[gateway] Failed to start OpenClaw:`, err.message);
    gatewayProcess = null;
  });

  // 起動成功したらカウンターをリセット（30秒後）
  setTimeout(() => {
    if (gatewayProcess && !gatewayProcess.killed) {
      restartCount = 0;
    }
  }, 30_000);
}

// ── Gateway 停止 ──────────────────────────────────────────────────

export function stopGateway(): void {
  stopping = true;
  if (gatewayProcess) {
    console.log("[gateway] Stopping OpenClaw Gateway...");
    gatewayProcess.kill("SIGTERM");

    // 5秒待ってまだ終わらなければ強制終了
    setTimeout(() => {
      if (gatewayProcess && !gatewayProcess.killed) {
        console.warn("[gateway] Force killing OpenClaw Gateway...");
        gatewayProcess.kill("SIGKILL");
      }
    }, 5000);
  }
}

// ── ヘルスチェック ────────────────────────────────────────────────

export function isGatewayRunning(): boolean {
  return gatewayProcess !== null && !gatewayProcess.killed;
}

export function getGatewayPort(): number {
  return GATEWAY_PORT;
}
