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
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-lg font-bold text-slate-800">
            OpenClaw ダッシュボード
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-500">{userEmail}</span>
            <button
              onClick={handleLogout}
              className="text-sm text-slate-500 hover:text-slate-800 transition-colors"
            >
              ログアウト
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">セットアップ</h1>
            <p className="text-slate-500 mt-1">
              必要な情報を入力して、デプロイボタンを押すだけです。
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-5">
            <div>
              <label
                htmlFor="claude-key"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Claude APIキー
              </label>
              <input
                id="claude-key"
                type="password"
                value={claudeApiKey}
                onChange={(e) => setClaudeApiKey(e.target.value)}
                placeholder="sk-ant-api03-..."
                className="w-full border border-slate-300 rounded-lg py-3 px-4 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                disabled={deployed}
              />
              <p className="mt-1 text-xs text-slate-400">
                Anthropic Console (console.anthropic.com) から取得できます
              </p>
            </div>

            <div>
              <label
                htmlFor="telegram-token"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Telegram Bot トークン
              </label>
              <input
                id="telegram-token"
                type="password"
                value={telegramToken}
                onChange={(e) => setTelegramToken(e.target.value)}
                placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz..."
                className="w-full border border-slate-300 rounded-lg py-3 px-4 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                disabled={deployed}
              />
              <p className="mt-1 text-xs text-slate-400">
                Telegram で @BotFather に話しかけて /newbot で取得できます
              </p>
            </div>

            {!deployed && (
              <button
                onClick={handleDeploy}
                disabled={deploying || !claudeApiKey.trim() || !telegramToken.trim()}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg"
              >
                {deploying ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
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
                  "デプロイ開始"
                )}
              </button>
            )}
          </div>

          {deployed && (
            <div className="space-y-6 animate-in fade-in">
              <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                <h2 className="text-lg font-bold text-green-800 flex items-center gap-2">
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
                <div className="mt-3 space-y-2 text-sm text-green-700">
                  <p>
                    <span className="font-medium">Claude APIキー:</span>{" "}
                    <code className="bg-green-100 px-2 py-0.5 rounded">
                      {claudeApiKey.slice(0, 12)}...
                    </code>
                  </p>
                  <p>
                    <span className="font-medium">Telegram Bot トークン:</span>{" "}
                    <code className="bg-green-100 px-2 py-0.5 rounded">
                      {telegramToken.slice(0, 12)}...
                    </code>
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-xl font-bold text-slate-900 mb-4">
                  次の手順ガイド
                </h2>
                <p className="text-slate-600 mb-4">
                  以下のコマンドを順番にコピーして、ターミナル（コマンドプロンプト）に貼り付けて実行してください。
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

                <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-sm text-amber-800">
                    <span className="font-bold">ヒント:</span>{" "}
                    Vercel にデプロイする場合は、上記の環境変数を Vercel
                    のダッシュボードで設定してください。
                    Settings &rarr; Environment Variables から追加できます。
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setDeployed(false);
                  setClaudeApiKey("");
                  setTelegramToken("");
                }}
                className="text-sm text-slate-500 hover:text-slate-800 underline transition-colors"
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
    <div className="border border-slate-200 rounded-lg overflow-hidden">
      <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex items-center justify-between">
        <span className="text-sm font-medium text-slate-700">
          ステップ {step}: {title}
        </span>
        <button
          onClick={handleClick}
          className="text-xs bg-slate-200 hover:bg-slate-300 text-slate-600 px-3 py-1 rounded transition-colors"
        >
          {copied ? "コピーしました!" : "コピー"}
        </button>
      </div>
      <pre className="p-4 text-sm bg-slate-900 text-slate-100 overflow-x-auto whitespace-pre-wrap">
        <code>{command}</code>
      </pre>
    </div>
  );
}
