"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function DashboardPage() {
  const router = useRouter();
  const [claudeApiKey, setClaudeApiKey] = useState("");
  const [lineToken, setLineToken] = useState("");
  const [lineSecret, setLineSecret] = useState("");
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
    if (!claudeApiKey.trim() || !lineToken.trim() || !lineSecret.trim()) return;
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
    <div className="min-h-screen bg-[#111111] text-[#F0EDE5] washi-texture">
      {/* Header */}
      <header className="border-b border-[#C9A96E]/8 bg-[#111111]/70 backdrop-blur-2xl sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="shuin text-[9px]" style={{ width: "1.5rem", height: "1.5rem" }}>
              易
            </div>
            <span className="text-lg font-bold tracking-widest font-serif-jp">
              EasyClaw
            </span>
          </Link>
          <div className="flex items-center gap-5">
            <span className="text-sm text-[#A8A49C]/60 tracking-wide">
              {userEmail}
            </span>
            <button
              onClick={handleLogout}
              className="text-sm text-[#A8A49C] hover:text-[#C9A96E] transition-colors bg-transparent border border-[#C9A96E]/15 hover:border-[#C9A96E]/40 rounded-sm px-4 py-1.5 tracking-wider"
            >
              ログアウト
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-20">
        <div className="space-y-12">
          {/* Title */}
          <div>
            <p className="text-[#C9A96E] text-xs tracking-[0.5em] mb-4 font-serif-jp">
              — 設 定 —
            </p>
            <h1 className="text-3xl font-bold font-serif-jp tracking-wide">
              セットアップ
            </h1>
            <div className="mt-4 h-[1px] w-10 bg-gradient-to-r from-[#C9A96E]/50 to-transparent" />
            <p className="text-[#A8A49C] mt-4 tracking-wide">
              必要な情報を入力して、デプロイボタンを押すだけ。
            </p>
          </div>

          {/* Form */}
          <div className="bg-[#161616]/80 border border-[#C9A96E]/8 rounded-sm p-10 space-y-8 relative">
            {/* 背景パターン */}
            <div className="absolute inset-0 asanoha opacity-15 rounded-sm" />

            <div className="relative space-y-8">
              {/* Claude API Key */}
              <div>
                <label
                  htmlFor="claude-key"
                  className="flex items-center gap-2.5 text-sm font-medium text-[#A8A49C] mb-3 tracking-wide"
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
                      strokeWidth={1.5}
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
                  className="w-full bg-[#F0EDE5]/5 border border-[#C9A96E]/10 rounded-sm py-3.5 px-4 text-[#F0EDE5] placeholder:text-[#A8A49C]/25 focus:outline-none focus:ring-1 focus:ring-[#C9A96E]/40 focus:border-[#C9A96E]/30 font-mono text-sm transition-all"
                  disabled={deployed}
                />
                <p className="mt-2.5 text-xs text-[#A8A49C]/40 tracking-wide">
                  Anthropic Console (console.anthropic.com) から取得
                </p>
              </div>

              {/* LINE Channel Access Token */}
              <div>
                <label
                  htmlFor="line-token"
                  className="flex items-center gap-2.5 text-sm font-medium text-[#A8A49C] mb-3 tracking-wide"
                >
                  <svg
                    className="w-4 h-4 text-[#06C755]"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
                  </svg>
                  LINE チャネルアクセストークン
                </label>
                <input
                  id="line-token"
                  type="password"
                  value={lineToken}
                  onChange={(e) => setLineToken(e.target.value)}
                  placeholder="長期のチャネルアクセストークンを貼り付け..."
                  className="w-full bg-[#F0EDE5]/5 border border-[#C9A96E]/10 rounded-sm py-3.5 px-4 text-[#F0EDE5] placeholder:text-[#A8A49C]/25 focus:outline-none focus:ring-1 focus:ring-[#C9A96E]/40 focus:border-[#C9A96E]/30 font-mono text-sm transition-all"
                  disabled={deployed}
                />
                <p className="mt-2.5 text-xs text-[#A8A49C]/40 tracking-wide">
                  LINE Developers → Messaging API設定 から取得
                </p>
              </div>

              {/* LINE Channel Secret */}
              <div>
                <label
                  htmlFor="line-secret"
                  className="flex items-center gap-2.5 text-sm font-medium text-[#A8A49C] mb-3 tracking-wide"
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
                      strokeWidth={1.5}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  LINE チャネルシークレット
                </label>
                <input
                  id="line-secret"
                  type="password"
                  value={lineSecret}
                  onChange={(e) => setLineSecret(e.target.value)}
                  placeholder="チャネルシークレットを貼り付け..."
                  className="w-full bg-[#F0EDE5]/5 border border-[#C9A96E]/10 rounded-sm py-3.5 px-4 text-[#F0EDE5] placeholder:text-[#A8A49C]/25 focus:outline-none focus:ring-1 focus:ring-[#C9A96E]/40 focus:border-[#C9A96E]/30 font-mono text-sm transition-all"
                  disabled={deployed}
                />
                <p className="mt-2.5 text-xs text-[#A8A49C]/40 tracking-wide">
                  LINE Developers → チャネル基本設定
                </p>
              </div>

              {/* Deploy Button */}
              {!deployed && (
                <div className="pt-2">
                  <button
                    onClick={handleDeploy}
                    disabled={
                      deploying ||
                      !claudeApiKey.trim() ||
                      !lineToken.trim() ||
                      !lineSecret.trim()
                    }
                    className="w-full bg-[#C73E1D] hover:bg-[#d4552f] text-[#F0EDE5] font-bold py-4 px-6 rounded-sm transition-all disabled:opacity-15 disabled:cursor-not-allowed text-lg tracking-wider"
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
                </div>
              )}
            </div>
          </div>

          {/* Post-deploy */}
          {deployed && (
            <div className="space-y-10 animate-fade-in-up">
              {/* Success */}
              <div className="bg-[#1B4965]/10 border border-[#1B4965]/20 rounded-sm p-8 relative">
                <div className="absolute inset-0 seigaiha opacity-30 rounded-sm" />
                <div className="relative">
                  <h2 className="text-lg font-bold text-[#C9A96E] flex items-center gap-3 font-serif-jp tracking-wide">
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
                  <div className="mt-4 h-[1px] w-10 bg-gradient-to-r from-[#C9A96E]/40 to-transparent" />
                  <div className="mt-5 space-y-2.5 text-sm text-[#A8A49C]">
                    <p>
                      <span className="text-[#C9A96E] font-medium">
                        Claude APIキー:
                      </span>{" "}
                      <code className="bg-[#1B4965]/15 px-2 py-0.5 rounded-sm font-mono text-[#F0EDE5]/70 text-xs">
                        {claudeApiKey.slice(0, 12)}...
                      </code>
                    </p>
                    <p>
                      <span className="text-[#06C755] font-medium">
                        LINE トークン:
                      </span>{" "}
                      <code className="bg-[#1B4965]/15 px-2 py-0.5 rounded-sm font-mono text-[#F0EDE5]/70 text-xs">
                        {lineToken.slice(0, 12)}...
                      </code>
                    </p>
                    <p>
                      <span className="text-[#06C755] font-medium">
                        LINE シークレット:
                      </span>{" "}
                      <code className="bg-[#1B4965]/15 px-2 py-0.5 rounded-sm font-mono text-[#F0EDE5]/70 text-xs">
                        {lineSecret.slice(0, 8)}...
                      </code>
                    </p>
                  </div>
                </div>
              </div>

              {/* Steps Guide */}
              <div className="bg-[#161616]/80 border border-[#C9A96E]/8 rounded-sm p-10 relative">
                <div className="absolute inset-0 asanoha opacity-10 rounded-sm" />
                <div className="relative">
                  <p className="text-[#C9A96E] text-xs tracking-[0.5em] mb-3 font-serif-jp">
                    — 次の手順 —
                  </p>
                  <h2 className="text-xl font-bold mb-2 font-serif-jp tracking-wide">
                    セットアップガイド
                  </h2>
                  <div className="mt-3 h-[1px] w-10 bg-gradient-to-r from-[#C9A96E]/40 to-transparent" />
                  <p className="text-[#A8A49C] mt-4 mb-10 text-sm tracking-wide">
                    以下のコマンドを順番に実行してください。
                  </p>

                  <div className="space-y-5">
                    <StepBlock
                      step={1}
                      title="リポジトリをクローン"
                      command="git clone https://github.com/openclaw/openclaw.git && cd openclaw"
                      onCopy={handleCopy}
                    />
                    <StepBlock
                      step={2}
                      title="環境変数を設定"
                      command={`echo "ANTHROPIC_API_KEY=${claudeApiKey}" >> .env\necho "LINE_CHANNEL_ACCESS_TOKEN=${lineToken}" >> .env\necho "LINE_CHANNEL_SECRET=${lineSecret}" >> .env`}
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
                  <div className="mt-10 bg-[#C9A96E]/5 border border-[#C9A96E]/10 rounded-sm p-5">
                    <p className="text-sm text-[#C9A96E]/70 tracking-wide leading-relaxed">
                      <span className="font-bold text-[#C9A96E] font-serif-jp">
                        ヒント:
                      </span>{" "}
                      LINE Developers でWebhook URLを設定してください。
                      デプロイ後のURL +{" "}
                      <code className="bg-[#1B4965]/15 px-1.5 py-0.5 rounded-sm text-[#F0EDE5]/70 text-xs">
                        /api/webhook/line
                      </code>{" "}
                      を Messaging API設定のWebhook URLに貼り付け。
                    </p>
                  </div>
                </div>
              </div>

              {/* Reset */}
              <button
                onClick={() => {
                  setDeployed(false);
                  setClaudeApiKey("");
                  setLineToken("");
                  setLineSecret("");
                }}
                className="text-sm text-[#A8A49C]/40 hover:text-[#C9A96E] transition-colors tracking-wider"
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

  const kanjiNumbers = ["一", "二", "三", "四"];

  return (
    <div className="border border-[#C9A96E]/8 rounded-sm overflow-hidden">
      <div className="bg-[#1C1C1C] px-5 py-3.5 border-b border-[#C9A96E]/8 flex items-center justify-between">
        <span className="text-sm font-medium text-[#A8A49C] flex items-center gap-3 tracking-wide">
          <span className="shuin text-[9px]" style={{ width: "1.3rem", height: "1.3rem", borderWidth: "1.5px" }}>
            {kanjiNumbers[step - 1]}
          </span>
          {title}
        </span>
        <button
          onClick={handleClick}
          className={`text-xs px-3 py-1.5 rounded-sm transition-all font-medium tracking-wider ${
            copied
              ? "bg-[#C9A96E]/10 text-[#C9A96E] border border-[#C9A96E]/25"
              : "bg-transparent text-[#A8A49C]/60 hover:text-[#C9A96E] border border-[#C9A96E]/10 hover:border-[#C9A96E]/30"
          }`}
        >
          {copied ? "コピー済" : "コピー"}
        </button>
      </div>
      <pre className="p-5 text-sm bg-[#0d0d0d] text-[#A8A49C]/80 overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed">
        <code>{command}</code>
      </pre>
    </div>
  );
}
