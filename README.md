# EasyClaw-JP

日本語ユーザー向けの **OpenClaw デプロイ管理ダッシュボード**。
Web UI からワンクリックで LINE AI ボットをデプロイできるようにする、OpenClaw の「ラッパー」サービスです。

---

## ラッパーとは何か？ — 技術的な仕組み

### 概要

EasyClaw は **OpenClaw 本体のコードを改変しません**。
OpenClaw を「npm パッケージ」としてそのまま使い、その周囲に **管理 UI・認証・マルチテナント機能** を追加した「薄い殻（ラッパー）」です。

```
┌─────────────────────────────────────────────────────┐
│  EasyClaw（ラッパー）                                │
│                                                     │
│  ┌──────────────┐     ┌──────────────────────────┐  │
│  │ Next.js      │     │ openclaw-server           │  │
│  │ ダッシュボード │────▶│ (Express, 約200行)        │  │
│  │ (Port 3000)  │     │                          │  │
│  │              │     │  ┌────────────────────┐   │  │
│  │  ・ログイン   │     │  │ OpenClaw Gateway   │   │  │
│  │  ・API キー入力│     │  │ （子プロセス）      │   │  │
│  │  ・デプロイ   │     │  │  Port 18789        │   │  │
│  │  ・設定管理   │     │  │                    │   │  │
│  └──────────────┘     │  │  AI 処理・メモリ・  │   │  │
│                       │  │  スキル — 全部ここ  │   │  │
│                       │  └────────────────────┘   │  │
│                       └──────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

### 「ラッパー」の 3 つの役割

#### 1. フロントエンド（Next.js ダッシュボード）

ユーザーが触る Web UI です。やっていることは：

- ログイン画面を表示（Google OAuth / メール）
- AI モデル選択（Claude / GPT-4o / Gemini Flash）
- API キーと LINE チャネルトークン・シークレットの入力フォーム
- 「Deploy OpenClaw」ボタンで、裏側の API を呼ぶ

**フロントエンド自体は AI 処理を一切行いません。** フォームに入力された値を、バックエンドに送るだけです。

#### 2. バックエンド（openclaw-server — Express サーバー）

これが「ラッパー」の核心部分です。約 200 行の薄い Node.js サーバーで、3 つのことだけをやります：

| 機能 | やっていること | コード |
|------|--------------|--------|
| **プロセス管理** | `openclaw gateway` コマンドを子プロセスとして起動・監視・再起動 | `gateway-manager.ts` |
| **管理 API** | ダッシュボードから受け取った設定を `openclaw.json` に書き込む | `admin-api.ts` + `config-manager.ts` |
| **Webhook プロキシ** | LINE Platform からの HTTP リクエストを OpenClaw Gateway に中継 | `proxy.ts` |

#### 3. データベース（PostgreSQL + Prisma）

ユーザー情報・ボット設定・サブスクリプションを保存します。OpenClaw 本体はデータベースを持たないため、マルチテナント管理のために EasyClaw が追加しています。

---

## ラッパーの仕組み — もう少し詳しく

### 子プロセスとしての起動

EasyClaw は OpenClaw の Gateway を **子プロセス** として起動します。
具体的には、Node.js の `spawn()` で `openclaw gateway` コマンドを実行しています。

```typescript
// gateway-manager.ts より抜粋
gatewayProcess = spawn("openclaw", ["gateway"], {
  env: {
    OPENCLAW_STATE_DIR: "/data/.openclaw",
    OPENCLAW_GATEWAY_PORT: "18789",
    OPENCLAW_GATEWAY_BIND: "loopback",  // 外部から直接アクセス不可
  },
});
```

ポイント：
- OpenClaw Gateway は **内部ポート 18789** で動き、外部に直接公開されません
- EasyClaw の Express サーバー（ポート 3100）が外部からのリクエストを受けて、Gateway に中継します
- Gateway がクラッシュしたら自動で再起動します（最大 10 回）

### 設定ファイル（openclaw.json）による制御

OpenClaw Gateway は `openclaw.json` という設定ファイルで動作を制御します。
EasyClaw は、ダッシュボードからの操作をこの設定ファイルの読み書きに変換しています。

```
ユーザーが「Deploy」ボタンを押す
  ↓
ダッシュボードが POST /api/cloud-deploy を呼ぶ
  ↓
Next.js API が PUT /_admin/agents を呼ぶ
  ↓
openclaw-server が openclaw.json を更新する
  ↓
OpenClaw Gateway がファイル変更を検知して自動リロード
  ↓
LINE ボットが動き始める
```

`openclaw.json` の中身はこんな構造です：

```json
{
  "gateway": {
    "port": 18789,
    "bind": "loopback"
  },
  "agents": {
    "list": [
      {
        "id": "ec-f7c9d4a2e1b5",
        "workspace": "/data/workspaces/ec-f7c9d4a2e1b5",
        "model": { "primary": "anthropic/claude-sonnet-4-5-20250929" }
      }
    ]
  },
  "channels": {
    "line": {
      "accounts": {
        "ec-f7c9d4a2e1b5": {
          "channelAccessToken": "...",
          "channelSecret": "...",
          "webhookPath": "/line/ec-f7c9d4a2e1b5"
        }
      }
    }
  },
  "bindings": [
    {
      "agentId": "ec-f7c9d4a2e1b5",
      "match": { "channel": "line", "accountId": "ec-f7c9d4a2e1b5" }
    }
  ]
}
```

**つまり、EasyClaw がやっていることは「ユーザーのフォーム入力を、この JSON に変換して書き込む」だけです。** AI との会話、メモリ管理、スキル実行といったすべての処理は OpenClaw が行います。

### LINE Webhook の流れ

ユーザーが LINE でメッセージを送ったとき、データはこう流れます：

```
1. ユーザーが LINE でメッセージ送信
   ↓
2. LINE Platform が Webhook URL に POST
   例: https://your-server.com/line/ec-f7c9d4a2e1b5
   ↓
3. EasyClaw (Express) が受け取る
   - x-line-signature ヘッダーと raw body をそのまま保持
   ↓
4. 内部の OpenClaw Gateway に転送（プロキシ）
   → http://127.0.0.1:18789/webhook/line/ec-f7c9d4a2e1b5
   ↓
5. OpenClaw Gateway が処理
   - LINE 署名を検証
   - AI モデルに問い合わせ
   - 応答を LINE に返信
```

EasyClaw は **3 → 4 の中継をしているだけ** です。メッセージの中身は見ません。

---

## 以前のコードとの違い

以前の EasyClaw では、AI 処理やメッセージ管理を自前で実装していました。
現在は **本物の OpenClaw** を npm パッケージとして利用する構成に移行しています。

| | 以前の構成 | 現在の構成 |
|---|---|---|
| AI 処理 | 自前実装 | OpenClaw が処理 |
| メモリ管理 | なし / 簡易的 | OpenClaw の機能を利用 |
| スキル | なし | OpenClaw のスキルシステムを利用 |
| 設定管理 | 独自フォーマット | `openclaw.json`（OpenClaw 標準） |
| デプロイ | 手動 | ダッシュボードからワンクリック |
| マルチテナント | 非対応 | EasyClaw が agentId で管理 |

**要するに：** EasyClaw は「OpenClaw を便利に使うためのリモコン」です。リモコンがテレビの映像を作るわけではないように、EasyClaw が AI 処理を行うわけではありません。

---

## プロジェクト構成

```
EasyClaw-JP/
├── src/                          # Next.js フロントエンド
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/  # 認証 API
│   │   │   ├── cloud-deploy/        # デプロイ API（SSE ストリーミング）
│   │   │   └── load-config/         # 設定読み込み API
│   │   ├── dashboard/               # ダッシュボード画面
│   │   ├── login/                   # ログイン画面
│   │   ├── skills/                  # OpenClaw スキル紹介
│   │   └── page.tsx                 # トップページ
│   ├── components/                  # React コンポーネント
│   └── lib/                         # ユーティリティ
│       ├── auth.ts                  # NextAuth 設定
│       ├── ensure-user.ts           # ユーザー作成/取得
│       └── prisma.ts                # Prisma クライアント
│
├── openclaw-server/                 # OpenClaw ラッパーサーバー
│   └── src/
│       ├── index.ts                 # Express エントリーポイント
│       ├── gateway-manager.ts       # OpenClaw プロセス管理
│       ├── config-manager.ts        # openclaw.json の読み書き
│       ├── admin-api.ts             # 管理 REST API
│       ├── proxy.ts                 # LINE Webhook プロキシ
│       └── types.ts                 # 型定義
│
├── prisma/
│   └── schema.prisma                # データベーススキーマ
│
└── package.json
```

---

## デプロイ構成

EasyClaw は 2 つのサービスとして動きます：

| サービス | デプロイ先 | 役割 |
|---------|-----------|------|
| **Next.js ダッシュボード** | Vercel | Web UI + API ルート + DB 接続 |
| **openclaw-server** | Railway | OpenClaw Gateway の起動・管理・プロキシ |

```
[Vercel]                              [Railway]
Next.js ──── HTTP ────▶ openclaw-server
  │                         │
  │                    ┌────┴────┐
  ▼                    │ OpenClaw │
[Neon DB]              │ Gateway  │──── AI API (Claude/GPT/Gemini)
PostgreSQL             └────┬────┘
                            │
                       LINE Platform
```

---

## セットアップ

### 必要なツール

| ツール | ダウンロード先 | 確認コマンド |
|--------|---------------|-------------|
| **Git** | https://git-scm.com | `git --version` |
| **Node.js（v18以上）** | https://nodejs.org | `node --version` |

### ローカル開発

```bash
# リポジトリをクローン
git clone https://github.com/tsurutatsuji/EasyClaw-JP.git
cd EasyClaw-JP

# 依存パッケージをインストール
npm install

# 環境変数を設定
cp .env.example .env
# .env を編集して必要な値を入力

# 開発サーバーを起動
npm run dev
```

http://localhost:3000 でアクセスできます。

### 環境変数

```env
# --- Next.js (ダッシュボード) ---
DATABASE_URL="postgresql://..."        # PostgreSQL 接続文字列（Neon 推奨）
NEXTAUTH_SECRET="ランダムな文字列"       # JWT 署名用シークレット
NEXTAUTH_URL="http://localhost:3000"   # 認証コールバック URL
GOOGLE_CLIENT_ID=""                    # Google OAuth（任意）
GOOGLE_CLIENT_SECRET=""                # Google OAuth（任意）
OPENCLAW_HOST="https://..."            # openclaw-server の URL
OPENCLAW_ADMIN_KEY="..."               # 管理 API 認証キー

# --- openclaw-server ---
OPENCLAW_ADMIN_KEY="..."               # 管理 API 認証キー（上と同じ値）
PORT=3100                              # Express サーバーのポート
```

---

## 技術スタック

- **フロントエンド:** Next.js 14 (App Router) / TypeScript / Tailwind CSS
- **認証:** NextAuth.js（Google OAuth + メール）
- **DB:** PostgreSQL + Prisma ORM
- **ラッパーサーバー:** Express (Node.js)
- **AI エンジン:** OpenClaw（npm パッケージ）
- **メッセージング:** LINE Messaging API
- **デプロイ:** Vercel（フロント）+ Railway（OpenClaw サーバー）
