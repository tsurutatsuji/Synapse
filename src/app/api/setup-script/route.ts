import { NextRequest, NextResponse } from "next/server";

/**
 * ユーザーの設定を埋め込んだワンライナー用セットアップスクリプトを生成する。
 * curl -fsSL <url> | bash  で実行すると、
 *   1. Git が無ければインストール
 *   2. Node.js が無ければインストール
 *   3. OpenClaw をクローン（Git無しならZIP）
 *   4. .env を作成
 *   5. npm install
 *   6. npm run start
 * を全自動で行う。
 */

function buildEnvBlock(
  aiProvider: string,
  apiKey: string,
  lineToken: string,
  lineSecret: string
): string {
  let env = "";
  switch (aiProvider) {
    case "claude":
      env += `ANTHROPIC_API_KEY=${apiKey}\nAI_PROVIDER=anthropic`;
      break;
    case "gpt":
      env += `OPENAI_API_KEY=${apiKey}\nAI_PROVIDER=openai`;
      break;
    case "gemini-pro":
      env += `GOOGLE_AI_API_KEY=${apiKey}\nAI_PROVIDER=google\nAI_MODEL=gemini-pro`;
      break;
    case "gemini-flash":
      env += `GOOGLE_AI_API_KEY=\nAI_PROVIDER=google\nAI_MODEL=gemini-flash`;
      break;
    default:
      env += `ANTHROPIC_API_KEY=${apiKey}\nAI_PROVIDER=anthropic`;
  }
  env += `\nLINE_CHANNEL_ACCESS_TOKEN=${lineToken}`;
  env += `\nLINE_CHANNEL_SECRET=${lineSecret}`;
  return env;
}

export async function POST(req: NextRequest) {
  try {
    const { claudeApiKey, aiProvider, lineToken, lineSecret, os } =
      await req.json();

    if (!lineToken || !lineSecret) {
      return NextResponse.json(
        { error: "LINE の情報が必要です" },
        { status: 400 }
      );
    }

    const envBlock = buildEnvBlock(
      aiProvider,
      claudeApiKey || "",
      lineToken,
      lineSecret
    );

    if (os === "windows") {
      // ── Windows 用 PowerShell スクリプト ──
      const ps = `
# === EasyClaw セットアップスクリプト (Windows) ===
Write-Host ""
Write-Host "=== EasyClaw 自動セットアップを開始します ===" -ForegroundColor Cyan
Write-Host ""

# ── 1. Git チェック・インストール ──
Write-Host "[1/5] Git を確認しています..." -ForegroundColor Yellow
if (!(Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "  Git が見つかりません。インストールします..." -ForegroundColor Yellow
    winget install --id Git.Git -e --accept-source-agreements --accept-package-agreements
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
    if (!(Get-Command git -ErrorAction SilentlyContinue)) {
        Write-Host "  Git のインストールに失敗しました。https://git-scm.com から手動でインストールしてください。" -ForegroundColor Red
        exit 1
    }
}
Write-Host "  OK: $(git --version)" -ForegroundColor Green

# ── 2. Node.js チェック・インストール ──
Write-Host "[2/5] Node.js を確認しています..." -ForegroundColor Yellow
if (!(Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "  Node.js が見つかりません。インストールします..." -ForegroundColor Yellow
    winget install --id OpenJS.NodeJS.LTS -e --accept-source-agreements --accept-package-agreements
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
    if (!(Get-Command node -ErrorAction SilentlyContinue)) {
        Write-Host "  Node.js のインストールに失敗しました。https://nodejs.org から手動でインストールしてください。" -ForegroundColor Red
        exit 1
    }
}
Write-Host "  OK: node $(node --version)" -ForegroundColor Green

# ── 3. OpenClaw ダウンロード ──
Write-Host "[3/5] OpenClaw をダウンロードしています..." -ForegroundColor Yellow
$installDir = Join-Path $HOME "openclaw"
if (Test-Path $installDir) {
    Write-Host "  openclaw フォルダが既にあります（スキップ）" -ForegroundColor Yellow
} else {
    git clone https://github.com/openclaw/openclaw.git "$installDir"
    if (!(Test-Path $installDir)) {
        Write-Host "  ダウンロードに失敗しました" -ForegroundColor Red
        exit 1
    }
}
Write-Host "  OK" -ForegroundColor Green

# ── 4. .env 作成 ──
Write-Host "[4/5] 設定ファイルを作成しています..." -ForegroundColor Yellow
@"
${envBlock.replace(/\n/g, "`n")}
"@ | Out-File -FilePath (Join-Path $installDir ".env") -Encoding UTF8
Write-Host "  OK" -ForegroundColor Green

# ── 5. npm install & start ──
Write-Host "[5/5] パッケージをインストールして起動します..." -ForegroundColor Yellow
Set-Location $installDir
npm install
Write-Host ""
Write-Host "=== セットアップ完了！起動します ===" -ForegroundColor Cyan
npm run start
`.trim();

      return new NextResponse(ps, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Content-Disposition": 'attachment; filename="easyclaw-setup.ps1"',
        },
      });
    }

    // ── macOS / Linux 用 bash スクリプト ──
    const bash = `#!/usr/bin/env bash
set -e

echo ""
echo "=== EasyClaw 自動セットアップを開始します ==="
echo ""

# ── 1. Git チェック・インストール ──
echo "[1/5] Git を確認しています..."
if ! command -v git &>/dev/null; then
    echo "  Git が見つかりません。インストールします..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS: Xcode Command Line Tools に含まれる
        xcode-select --install 2>/dev/null || true
        echo "  Xcode Command Line Tools のインストールダイアログが表示された場合は「インストール」を押してください。"
        echo "  完了後、このスクリプトをもう一度実行してください。"
        exit 0
    else
        # Linux (Debian/Ubuntu 系)
        sudo apt-get update -qq && sudo apt-get install -y git
    fi
fi
echo "  OK: $(git --version)"

# ── 2. Node.js チェック・インストール ──
echo "[2/5] Node.js を確認しています..."
if ! command -v node &>/dev/null; then
    echo "  Node.js が見つかりません。インストールします..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if command -v brew &>/dev/null; then
            brew install node
        else
            echo "  Homebrew をインストールします..."
            /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
            eval "$(/opt/homebrew/bin/brew shellenv 2>/dev/null || /usr/local/bin/brew shellenv 2>/dev/null)"
            brew install node
        fi
    else
        # Linux (NodeSource)
        curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
        sudo apt-get install -y nodejs
    fi
fi
echo "  OK: node $(node --version)"

# ── 3. OpenClaw ダウンロード ──
echo "[3/5] OpenClaw をダウンロードしています..."
INSTALL_DIR="$HOME/openclaw"
if [ -d "$INSTALL_DIR" ]; then
    echo "  openclaw フォルダが既にあります（スキップ）"
else
    git clone https://github.com/openclaw/openclaw.git "$INSTALL_DIR"
fi
echo "  OK"

# ── 4. .env 作成 ──
echo "[4/5] 設定ファイルを作成しています..."
cat > "$INSTALL_DIR/.env" << 'ENVEOF'
${envBlock}
ENVEOF
echo "  OK"

# ── 5. npm install & start ──
echo "[5/5] パッケージをインストールして起動します..."
cd "$INSTALL_DIR"
npm install
echo ""
echo "=== セットアップ完了！起動します ==="
npm run start
`.trim();

    return new NextResponse(bash, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Content-Disposition": 'attachment; filename="easyclaw-setup.sh"',
      },
    });
  } catch {
    return NextResponse.json(
      { error: "スクリプト生成に失敗しました" },
      { status: 500 }
    );
  }
}
