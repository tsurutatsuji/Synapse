# ================================================================
#  EasyClaw OpenClaw Wrapper — Multi-stage build
#
#  Stage 1: TypeScript をコンパイル
#  Stage 2: 本番ランタイム（openclaw + Express ラッパー）
# ================================================================

# ── Stage 1: ビルド ────────────────────────────────────────────────
FROM node:22-slim AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install
COPY tsconfig.json ./
COPY src/ ./src/
RUN npm run build

# ── Stage 2: 本番 ─────────────────────────────────────────────────
FROM node:22-slim

# OpenClaw をグローバルインストール（外部依存として使う）
RUN npm install -g openclaw@latest

WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --omit=dev

# Stage 1 のビルド成果物だけコピー
COPY --from=builder /app/dist/ ./dist/

ENV OPENCLAW_STATE_DIR=/data/.openclaw
ENV OPENCLAW_WORKSPACE_DIR=/data/workspaces
ENV NODE_ENV=production

CMD ["node", "dist/index.js"]
