import { NextRequest, NextResponse } from "next/server";
import { exec, spawn } from "child_process";
import { promisify } from "util";
import {
  existsSync,
  writeFileSync,
  mkdirSync,
  createWriteStream,
  unlinkSync,
  renameSync,
  readdirSync,
  rmSync,
} from "fs";
import { join } from "path";
import os from "os";
import https from "https";

const execAsync = promisify(exec);

/* ── ZIP ダウンロード（リダイレクト対応） ── */
function downloadFile(url: string, dest: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = createWriteStream(dest);
    https
      .get(url, (res) => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          file.close();
          unlinkSync(dest);
          downloadFile(res.headers.location!, dest).then(resolve).catch(reject);
          return;
        }
        res.pipe(file);
        file.on("finish", () => {
          file.close();
          resolve();
        });
      })
      .on("error", (err) => {
        file.close();
        reject(err);
      });
  });
}

/* ── .env 生成 ── */
function buildEnvContent(
  aiProvider: string,
  apiKey: string,
  lineToken: string,
  lineSecret: string
): string {
  let env = "";
  switch (aiProvider) {
    case "claude":
      env += `ANTHROPIC_API_KEY=${apiKey}\nAI_PROVIDER=anthropic\n`;
      break;
    case "gpt":
      env += `OPENAI_API_KEY=${apiKey}\nAI_PROVIDER=openai\n`;
      break;
    case "gemini-pro":
      env += `GOOGLE_AI_API_KEY=${apiKey}\nAI_PROVIDER=google\nAI_MODEL=gemini-pro\n`;
      break;
    case "gemini-flash":
      env += `GOOGLE_AI_API_KEY=\nAI_PROVIDER=google\nAI_MODEL=gemini-flash\n`;
      break;
    default:
      env += `ANTHROPIC_API_KEY=${apiKey}\nAI_PROVIDER=anthropic\n`;
  }
  env += `LINE_CHANNEL_ACCESS_TOKEN=${lineToken}\n`;
  env += `LINE_CHANNEL_SECRET=${lineSecret}\n`;
  return env;
}

/* ── メインハンドラ（SSE でリアルタイム進捗） ── */
export async function POST(req: NextRequest) {
  // Vercel 上では child_process が使えないので弾く
  if (process.env.VERCEL === "1") {
    return NextResponse.json(
      { error: "自動デプロイはローカル環境でのみ利用できます" },
      { status: 400 }
    );
  }

  const { claudeApiKey, aiProvider, lineToken, lineSecret, deploymentType } =
    await req.json();

  if (deploymentType !== "local") {
    return NextResponse.json(
      { error: "自動デプロイはローカル環境のみ対応しています" },
      { status: 400 }
    );
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: Record<string, unknown>) => {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
        );
      };

      try {
        const homeDir = os.homedir();
        const installDir = join(homeDir, "openclaw");
        const isWindows = process.platform === "win32";

        /* ── Step 1: Git 確認 ── */
        send({ step: 1, status: "in_progress", message: "環境を確認しています..." });
        let hasGit = false;
        try {
          await execAsync("git --version");
          hasGit = true;
        } catch {
          /* Git が無い */
        }
        send({
          step: 1,
          status: "done",
          message: hasGit
            ? "Git が利用可能です"
            : "Git なし — ZIP でダウンロードします",
        });

        /* ── Step 2: OpenClaw ダウンロード ── */
        send({ step: 2, status: "in_progress", message: "OpenClaw をダウンロードしています..." });

        if (existsSync(installDir)) {
          send({ step: 2, status: "done", message: "openclaw フォルダが既にあります（スキップ）" });
        } else if (hasGit) {
          await execAsync(
            `git clone https://github.com/openclaw/openclaw.git "${installDir}"`,
            { timeout: 120000 }
          );
          send({ step: 2, status: "done", message: "ダウンロード完了" });
        } else {
          // ZIP fallback
          const zipUrl =
            "https://github.com/openclaw/openclaw/archive/refs/heads/main.zip";
          const zipPath = join(homeDir, "openclaw-download.zip");
          const extractDir = join(homeDir, "openclaw-extract");

          await downloadFile(zipUrl, zipPath);

          if (isWindows) {
            await execAsync(
              `powershell -Command "Expand-Archive -Force -Path '${zipPath}' -DestinationPath '${extractDir}'"`,
              { timeout: 60000 }
            );
          } else {
            mkdirSync(extractDir, { recursive: true });
            await execAsync(`unzip -o "${zipPath}" -d "${extractDir}"`, {
              timeout: 60000,
            });
          }

          // GitHub ZIP は "openclaw-main" のようなサブフォルダに展開される
          const entries = readdirSync(extractDir);
          const subDir = entries.find((f) => f.startsWith("openclaw"));
          if (subDir) {
            renameSync(join(extractDir, subDir), installDir);
          }

          // クリーンアップ
          try { unlinkSync(zipPath); } catch { /* ignore */ }
          try { rmSync(extractDir, { recursive: true }); } catch { /* ignore */ }

          send({ step: 2, status: "done", message: "ZIP からダウンロード完了" });
        }

        /* ── Step 3: .env 作成 ── */
        send({ step: 3, status: "in_progress", message: "設定ファイルを作成しています..." });
        const envContent = buildEnvContent(aiProvider, claudeApiKey, lineToken, lineSecret);
        writeFileSync(join(installDir, ".env"), envContent);
        send({ step: 3, status: "done", message: ".env ファイル作成完了" });

        /* ── Step 4: npm install ── */
        send({ step: 4, status: "in_progress", message: "パッケージをインストールしています（少し時間がかかります）..." });
        const npmCmd = isWindows ? "npm.cmd" : "npm";
        await execAsync(`${npmCmd} install`, {
          cwd: installDir,
          timeout: 300000, // 5分
        });
        send({ step: 4, status: "done", message: "インストール完了" });

        /* ── Step 5: 起動 ── */
        send({ step: 5, status: "in_progress", message: "OpenClaw を起動しています..." });
        const child = spawn(npmCmd, ["run", "start"], {
          cwd: installDir,
          detached: true,
          stdio: "ignore",
          env: { ...process.env, NODE_ENV: "production" },
        });
        child.unref();
        send({ step: 5, status: "done", message: "起動しました！" });

        send({ done: true, installDir });
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "不明なエラーが発生しました";
        send({ error: true, message });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
