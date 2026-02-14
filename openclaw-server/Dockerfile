# ================================================================
#  EasyClaw OpenClaw Wrapper
#
#  OpenClaw 本体は npm パッケージとしてインストール。
#  自分のコードは薄い管理レイヤーだけ。
#  OpenClaw をアップデートするにはバージョン番号を変えるだけ。
# ================================================================

FROM node:22-slim

# OpenClaw をグローバルインストール（外部依存として使う）
# バージョンを固定して、意図しないアップデートを防ぐ
RUN npm install -g openclaw@latest

# ラッパーのビルド
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install --omit=dev

COPY dist/ ./dist/
COPY tsconfig.json ./

# OpenClaw の永続データ用ディレクトリ
ENV OPENCLAW_STATE_DIR=/data/.openclaw
ENV OPENCLAW_WORKSPACE_DIR=/data/workspaces
ENV NODE_ENV=production

# ラッパーの Express サーバーを起動
# （ラッパーが内部で OpenClaw Gateway を子プロセスとして起動する）
CMD ["node", "dist/index.js"]
