# EasyClaw-JP

日本語対応の OpenClaw 用 Web UI アプリ。Next.js 14 App Router + Tailwind CSS で構築したダッシュボード。

## 機能

- **トップページ**: OpenClaw の紹介と「今すぐ始める」ボタン
- **ログインページ**: Google OAuth またはメールでの認証（デモモード搭載）
- **ダッシュボード**: Claude API キー・Telegram Bot トークン入力、デプロイ実行、手順ガイド表示

## セットアップ

```bash
npm install
npm run dev
```

http://localhost:3000 でアクセスできます。

## Vercel デプロイ

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/tsurutatsuji/EasyClaw-JP)

## 技術スタック

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS

## 認証について

現在はデモモード（localStorage ベース）です。本番環境では以下のいずれかに置き換えてください：

- [Clerk](https://clerk.com/)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
