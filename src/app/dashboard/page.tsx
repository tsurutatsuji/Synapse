"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function DashboardPage() {
  const router = useRouter();
  const [claudeApiKey, setClaudeApiKey] = useState("");
  const [telegramToken, setTelegramToken] = useState("");
  const [deployed, setDeployed] = useState(false);
  const [deploying, setDeploying] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("easyclaw_user");
    if (!stored) {
      router.push("/login");
      return;
    }
    const user = JSON.parse(stored);
    setUserEmail(user.email || "");
  }, [router]);

  const handleDeploy = () => {
    if (!claudeApiKey.trim() || !telegramToken.trim()) return;
    setDeploying(true);
    setTimeout(() => {
      setDeploying(false);
      setDeployed(true);
    }, 1500);
  };

  const handleLogout = () => {
    localStorage.removeItem("easyclaw_user");
    router.push("/");
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Header */}
      <header className="border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-sm font-bold">
              E
            </div>
            <span className="text-lg font-bold">EasyClaw</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-500">{userEmail}</span>
            <button
              onClick={handleLogout}
              className="text-sm text-slate-500 hover:text-white transition-colors bg-white/5 border border-white/10 rounded-lg px-3 py-1.5"
            >
              ログアウト
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="space-y-8">
          {/* Title */}
          <div>
            <h1 className="text-3xl font-bold">セットアップ</h1>
            <p className="text-slate-500 mt-2">
              必要な情報を入力して、デプロイボタンを押すだけ。
            </p>
          </div>

          {/* Setup Form */}
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-8 space-y-6">
            {/* Claude API Key */}
            <div>
              <label
                htmlFor="claude-key"
                className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2"
              >
                <svg
                  className="w-4 h-4 text-indigo-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                  />
                </svg>
                Claude APIキー
              </label>
              <input
                id="claude-key"
                type="password"
                value={claudeApiKey}
                onChange={(e) => setClaudeApiKey(e.target.value)}
                placeholder="sk-ant-api03-..."
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 px-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono text-sm transition-all"
                disabled={deployed}
              />
              <p className="mt-2 text-xs text-slate-600">
                Anthropic Console (console.anthropic.com) から取得できます
              </p>
            </div>

            {/* Telegram Token */}
            <div>
              <label
                htmlFor="telegram-token"
                className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2"
              >
                <svg
                  className="w-4 h-4 text-indigo-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                Telegram Bot トークン
              </label>
              <input
                id="telegram-token"
                type="password"
                value={telegramToken}
                onChange={(e) => setTelegramToken(e.target.value)}
                placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz..."
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 px-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono text-sm transition-all"
                disabled={deployed}
              />
              <p className="mt-2 text-xs text-slate-600">
                Telegram で @BotFather に話しかけて /newbot で取得できます
              </p>
            </div>

            {/* Deploy Button */}
            {!deployed && (
              <button
                onClick={handleDeploy}
                disabled={
                  deploying || !claudeApiKey.trim() || !telegramToken.trim()
                }
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-4 px-6 rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed text-lg shadow-lg shadow-indigo-600/20"
              >
                {deploying ? (
                  <span className="flex items-center justify-center gap-3">
                    <svg
                      className="animate-spin h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    デプロイ中...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                    デプロイ開始
                  </span>
                )}
              </button>
            )}
          </div>

          {/* Post-deploy success */}
          {deployed && (
            <div className="space-y-6 animate-fade-in-up">
              {/* Success Banner */}
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6">
                <h2 className="text-lg font-bold text-emerald-400 flex items-center gap-2">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  設定が完了しました
                </h2>
                <div className="mt-3 space-y-1.5 text-sm text-emerald-300/80">
                  <p>
                    <span className="text-emerald-400 font-medium">
                      Claude APIキー:
                    </span>{" "}
                    <code className="bg-emerald-500/10 px-2 py-0.5 rounded text-emerald-300 font-mono">
                      {claudeApiKey.slice(0, 12)}...
                    </code>
                  </p>
                  <p>
                    <span className="text-emerald-400 font-medium">
                      Telegram Bot トークン:
                    </span>{" "}
                    <code className="bg-emerald-500/10 px-2 py-0.5 rounded text-emerald-300 font-mono">
                      {telegramToken.slice(0, 12)}...
                    </code>
                  </p>
                </div>
              </div>

              {/* Steps Guide */}
              <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-8">
                <h2 className="text-xl font-bold mb-2">次の手順ガイド</h2>
                <p className="text-slate-500 mb-6 text-sm">
                  以下のコマンドを順番にコピーして、ターミナルに貼り付けて実行してください。
                </p>

                <div className="space-y-4">
                  <StepBlock
                    step={1}
                    title="リポジトリをクローン"
                    command="git clone https://github.com/openclaw/openclaw.git && cd openclaw"
                    onCopy={handleCopy}
                  />
                  <StepBlock
                    step={2}
                    title="環境変数を設定"
                    command={`echo "ANTHROPIC_API_KEY=${claudeApiKey}" >> .env\necho "TELEGRAM_BOT_TOKEN=${telegramToken}" >> .env`}
                    onCopy={handleCopy}
                  />
                  <StepBlock
                    step={3}
                    title="依存パッケージをインストール"
                    command="npm install"
                    onCopy={handleCopy}
                  />
                  <StepBlock
                    step={4}
                    title="起動する"
                    command="npm run start"
                    onCopy={handleCopy}
                  />
                </div>

                {/* Vercel Hint */}
                <div className="mt-6 bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                  <p className="text-sm text-amber-300/80">
                    <span className="font-bold text-amber-400">ヒント:</span>{" "}
                    Vercel にデプロイする場合は、上記の環境変数を Vercel
                    のダッシュボードで設定してください。 Settings → Environment
                    Variables から追加できます。
                  </p>
                </div>
              </div>

              {/* Reset */}
              <button
                onClick={() => {
                  setDeployed(false);
                  setClaudeApiKey("");
                  setTelegramToken("");
                }}
                className="text-sm text-slate-600 hover:text-indigo-400 transition-colors"
              >
                やり直す
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function StepBlock({
  step,
  title,
  command,
  onCopy,
}: {
  step: number;
  title: string;
  command: string;
  onCopy: (text: string) => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleClick = () => {
    onCopy(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="border border-white/10 rounded-xl overflow-hidden">
      <div className="bg-white/[0.03] px-4 py-3 border-b border-white/10 flex items-center justify-between">
        <span className="text-sm font-medium text-slate-300">
          <span className="text-indigo-400 font-bold mr-2">
            Step {step}
          </span>
          {title}
        </span>
        <button
          onClick={handleClick}
          className={`text-xs px-3 py-1.5 rounded-lg transition-all font-medium ${
            copied
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
              : "bg-white/5 text-slate-400 hover:text-white border border-white/10 hover:border-white/20"
          }`}
        >
          {copied ? "コピー済み" : "コピー"}
        </button>
      </div>
      <pre className="p-4 text-sm bg-[#0d1117] text-slate-300 overflow-x-auto whitespace-pre-wrap font-mono">
        <code>{command}</code>
      </pre>
    </div>
  );
}
