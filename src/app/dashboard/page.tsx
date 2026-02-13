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
    <div className="min-h-screen bg-[#141414] text-[#F0EDE5] washi-texture">
      {/* Header */}
      <header className="border-b border-[#F0EDE5]/5 bg-[#141414]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#1B4965] rounded-md flex items-center justify-center text-sm font-bold text-[#F0EDE5]">
              易
            </div>
            <span className="text-lg font-bold tracking-wide">EasyClaw</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-[#A8A49C]">{userEmail}</span>
            <button
              onClick={handleLogout}
              className="text-sm text-[#A8A49C] hover:text-[#F0EDE5] transition-colors bg-[#F0EDE5]/5 border border-[#F0EDE5]/10 rounded-md px-3 py-1.5"
            >
              ログアウト
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-16">
        <div className="space-y-10">
          {/* Title */}
          <div>
            <p className="text-[#C9A96E] text-sm tracking-[0.3em] mb-3">
              Setup
            </p>
            <h1 className="text-3xl font-bold">セットアップ</h1>
            <p className="text-[#A8A49C] mt-3">
              必要な情報を入力して、デプロイボタンを押すだけ。
            </p>
          </div>

          {/* Form */}
          <div className="bg-[#1C1C1C]/60 border border-[#F0EDE5]/5 rounded-xl p-8 space-y-6">
            {/* Claude API Key */}
            <div>
              <label
                htmlFor="claude-key"
                className="flex items-center gap-2 text-sm font-medium text-[#A8A49C] mb-2"
              >
                <svg
                  className="w-4 h-4 text-[#C9A96E]"
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
                className="w-full bg-[#F0EDE5]/5 border border-[#F0EDE5]/10 rounded-lg py-3.5 px-4 text-[#F0EDE5] placeholder:text-[#A8A49C]/30 focus:outline-none focus:ring-2 focus:ring-[#1B4965] focus:border-transparent font-mono text-sm transition-all"
                disabled={deployed}
              />
              <p className="mt-2 text-xs text-[#A8A49C]/50">
                Anthropic Console (console.anthropic.com) から取得できます
              </p>
            </div>

            {/* Telegram Token */}
            <div>
              <label
                htmlFor="telegram-token"
                className="flex items-center gap-2 text-sm font-medium text-[#A8A49C] mb-2"
              >
                <svg
                  className="w-4 h-4 text-[#C9A96E]"
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
                className="w-full bg-[#F0EDE5]/5 border border-[#F0EDE5]/10 rounded-lg py-3.5 px-4 text-[#F0EDE5] placeholder:text-[#A8A49C]/30 focus:outline-none focus:ring-2 focus:ring-[#1B4965] focus:border-transparent font-mono text-sm transition-all"
                disabled={deployed}
              />
              <p className="mt-2 text-xs text-[#A8A49C]/50">
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
                className="w-full bg-[#C73E1D] hover:bg-[#d4552f] text-[#F0EDE5] font-bold py-4 px-6 rounded-lg transition-all disabled:opacity-20 disabled:cursor-not-allowed text-lg"
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

          {/* Post-deploy */}
          {deployed && (
            <div className="space-y-8 animate-fade-in-up">
              {/* Success */}
              <div className="bg-[#1B4965]/15 border border-[#1B4965]/25 rounded-xl p-6">
                <h2 className="text-lg font-bold text-[#C9A96E] flex items-center gap-2">
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
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  設定が完了しました
                </h2>
                <div className="mt-3 space-y-1.5 text-sm text-[#A8A49C]">
                  <p>
                    <span className="text-[#C9A96E] font-medium">
                      Claude APIキー:
                    </span>{" "}
                    <code className="bg-[#1B4965]/15 px-2 py-0.5 rounded font-mono text-[#F0EDE5]/80">
                      {claudeApiKey.slice(0, 12)}...
                    </code>
                  </p>
                  <p>
                    <span className="text-[#C9A96E] font-medium">
                      Telegram Bot トークン:
                    </span>{" "}
                    <code className="bg-[#1B4965]/15 px-2 py-0.5 rounded font-mono text-[#F0EDE5]/80">
                      {telegramToken.slice(0, 12)}...
                    </code>
                  </p>
                </div>
              </div>

              {/* Steps Guide */}
              <div className="bg-[#1C1C1C]/60 border border-[#F0EDE5]/5 rounded-xl p-8">
                <p className="text-[#C9A96E] text-sm tracking-[0.3em] mb-2">
                  Next Steps
                </p>
                <h2 className="text-xl font-bold mb-2">次の手順ガイド</h2>
                <p className="text-[#A8A49C] mb-8 text-sm">
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

                {/* Hint */}
                <div className="mt-8 bg-[#C9A96E]/5 border border-[#C9A96E]/15 rounded-lg p-4">
                  <p className="text-sm text-[#C9A96E]/80">
                    <span className="font-bold text-[#C9A96E]">ヒント:</span>{" "}
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
                className="text-sm text-[#A8A49C]/50 hover:text-[#C9A96E] transition-colors"
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
    <div className="border border-[#F0EDE5]/5 rounded-lg overflow-hidden">
      <div className="bg-[#1C1C1C] px-4 py-3 border-b border-[#F0EDE5]/5 flex items-center justify-between">
        <span className="text-sm font-medium text-[#A8A49C]">
          <span className="text-[#C9A96E] font-bold mr-2">
            {step}.
          </span>
          {title}
        </span>
        <button
          onClick={handleClick}
          className={`text-xs px-3 py-1.5 rounded-md transition-all font-medium ${
            copied
              ? "bg-[#1B4965]/20 text-[#C9A96E] border border-[#1B4965]/30"
              : "bg-[#F0EDE5]/5 text-[#A8A49C] hover:text-[#F0EDE5] border border-[#F0EDE5]/10 hover:border-[#F0EDE5]/20"
          }`}
        >
          {copied ? "コピー済み" : "コピー"}
        </button>
      </div>
      <pre className="p-4 text-sm bg-[#0f0f0f] text-[#A8A49C] overflow-x-auto whitespace-pre-wrap font-mono">
        <code>{command}</code>
      </pre>
    </div>
  );
}
