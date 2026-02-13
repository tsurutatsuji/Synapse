"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [claudeApiKey, setClaudeApiKey] = useState("");
  const [lineToken, setLineToken] = useState("");
  const [lineSecret, setLineSecret] = useState("");
  const [deployed, setDeployed] = useState(false);
  const [deploying, setDeploying] = useState(false);
  const [configId, setConfigId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 認証チェック
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // 既存の設定を読み込む
  useEffect(() => {
    if (status !== "authenticated") return;
    (async () => {
      try {
        const res = await fetch("/api/load-config");
        if (res.ok) {
          const data = await res.json();
          if (data.config) {
            setClaudeApiKey(data.config.claudeApiKey);
            setLineToken(data.config.lineToken);
            setLineSecret(data.config.lineSecret);
            setConfigId(data.config.id);
            if (data.config.webhookActive) setDeployed(true);
          }
        }
      } catch {
        // 初回は設定なしなので無視
      } finally {
        setLoading(false);
      }
    })();
  }, [status]);

  const handleDeploy = async () => {
    if (!claudeApiKey.trim() || !lineToken.trim() || !lineSecret.trim()) return;
    setDeploying(true);
    setError("");
    try {
      const res = await fetch("/api/save-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ claudeApiKey, lineToken, lineSecret }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "保存に失敗しました");
      setConfigId(data.configId);
      setDeployed(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "保存に失敗しました。もう一度お試しください。");
    } finally {
      setDeploying(false);
    }
  };

  const handleLogout = () => {
    signOut({ callbackUrl: "/" });
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const webhookUrl = configId
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/api/webhook?id=${configId}`
    : "";

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <svg className="animate-spin h-8 w-8 text-[#C9A96E]/50" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#F0EDE5] washi-texture">
      {/* Header */}
      <header className="border-b border-[#F0EDE5]/[0.04] bg-[#0a0a0a]/60 backdrop-blur-2xl sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="shuin text-[9px]" style={{ width: "1.4rem", height: "1.4rem", borderWidth: "1px" }}>
              易
            </div>
            <span className="text-lg font-bold tracking-widest font-serif-jp">
              EasyClaw
            </span>
          </Link>
          <div className="flex items-center gap-5">
            <span className="text-sm text-[#A8A49C]/40 hidden sm:block">
              {session?.user?.email}
            </span>
            <button
              onClick={handleLogout}
              className="text-sm text-[#A8A49C]/60 hover:text-[#F0EDE5] transition-all duration-500 border border-[#F0EDE5]/[0.06] hover:border-[#F0EDE5]/[0.15] rounded-full px-4 py-1.5"
            >
              ログアウト
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-20">
        <div className="space-y-12">
          {/* Title */}
          <div className="text-center">
            <p className="text-[#C9A96E]/50 text-xs tracking-[0.5em] mb-4 font-serif-jp">
              設定
            </p>
            <h1 className="text-3xl font-bold font-serif-jp tracking-tight">
              はじめましょう
            </h1>
            <p className="text-[#A8A49C]/50 mt-4 text-sm">
              3つの情報を入力するだけで準備完了です。
              <Link href="/guide" className="text-[#C73E1D] hover:text-[#d4552f] ml-1 transition-all duration-500">
                取得方法をみる →
              </Link>
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="glass rounded-2xl p-5 border-[#C73E1D]/20 bg-[#C73E1D]/5">
              <p className="text-sm text-[#C73E1D]">{error}</p>
            </div>
          )}

          {/* Form */}
          <div className="glass-strong rounded-2xl p-8 sm:p-10 space-y-8">
            {/* Claude API Key */}
            <div>
              <label
                htmlFor="claude-key"
                className="flex items-center gap-2 text-sm text-[#A8A49C]/70 mb-2.5"
              >
                <svg className="w-4 h-4 text-[#C9A96E]/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
                AIのカギ（Claude APIキー）
              </label>
              <input
                id="claude-key"
                type="password"
                value={claudeApiKey}
                onChange={(e) => setClaudeApiKey(e.target.value)}
                placeholder="sk-ant-api03-..."
                className="w-full bg-[#F0EDE5]/[0.04] border border-[#F0EDE5]/[0.06] rounded-xl py-3.5 px-4 text-[#F0EDE5] placeholder:text-[#A8A49C]/20 focus:outline-none focus:ring-1 focus:ring-[#C9A96E]/30 focus:border-[#C9A96E]/20 font-mono text-sm transition-all duration-500"
                disabled={deployed}
              />
              <p className="mt-2 text-xs text-[#A8A49C]/30">
                console.anthropic.com にログインして取得できます
              </p>
            </div>

            {/* LINE Channel Access Token */}
            <div>
              <label
                htmlFor="line-token"
                className="flex items-center gap-2 text-sm text-[#A8A49C]/70 mb-2.5"
              >
                <svg className="w-4 h-4 text-[#06C755]/70" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
                </svg>
                LINEのトークン
              </label>
              <input
                id="line-token"
                type="password"
                value={lineToken}
                onChange={(e) => setLineToken(e.target.value)}
                placeholder="チャネルアクセストークンを貼り付け..."
                className="w-full bg-[#F0EDE5]/[0.04] border border-[#F0EDE5]/[0.06] rounded-xl py-3.5 px-4 text-[#F0EDE5] placeholder:text-[#A8A49C]/20 focus:outline-none focus:ring-1 focus:ring-[#C9A96E]/30 focus:border-[#C9A96E]/20 font-mono text-sm transition-all duration-500"
                disabled={deployed}
              />
              <p className="mt-2 text-xs text-[#A8A49C]/30">
                developers.line.biz → Messaging API設定 から取得
              </p>
            </div>

            {/* LINE Channel Secret */}
            <div>
              <label
                htmlFor="line-secret"
                className="flex items-center gap-2 text-sm text-[#A8A49C]/70 mb-2.5"
              >
                <svg className="w-4 h-4 text-[#C9A96E]/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                LINEのシークレット
              </label>
              <input
                id="line-secret"
                type="password"
                value={lineSecret}
                onChange={(e) => setLineSecret(e.target.value)}
                placeholder="チャネルシークレットを貼り付け..."
                className="w-full bg-[#F0EDE5]/[0.04] border border-[#F0EDE5]/[0.06] rounded-xl py-3.5 px-4 text-[#F0EDE5] placeholder:text-[#A8A49C]/20 focus:outline-none focus:ring-1 focus:ring-[#C9A96E]/30 focus:border-[#C9A96E]/20 font-mono text-sm transition-all duration-500"
                disabled={deployed}
              />
              <p className="mt-2 text-xs text-[#A8A49C]/30">
                developers.line.biz → チャネル基本設定 から取得
              </p>
            </div>

            {/* Deploy Button */}
            {!deployed && (
              <button
                onClick={handleDeploy}
                disabled={
                  deploying ||
                  !claudeApiKey.trim() ||
                  !lineToken.trim() ||
                  !lineSecret.trim()
                }
                className="w-full bg-[#C73E1D] hover:bg-[#d4552f] text-[#F0EDE5] font-bold py-4 px-6 rounded-full transition-all duration-500 disabled:opacity-10 disabled:cursor-not-allowed text-lg"
              >
                {deploying ? (
                  <span className="flex items-center justify-center gap-3">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    準備しています...
                  </span>
                ) : (
                  "AIを起動する"
                )}
              </button>
            )}
          </div>

          {/* Post-deploy */}
          {deployed && (
            <div className="space-y-8 animate-fade-in-up">
              {/* Success */}
              <div className="glass rounded-2xl p-8 text-center">
                <div className="w-12 h-12 rounded-full bg-[#C9A96E]/10 border border-[#C9A96E]/20 flex items-center justify-center mx-auto mb-5">
                  <svg className="w-6 h-6 text-[#C9A96E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold font-serif-jp tracking-wide">
                  準備ができました！
                </h2>
                <p className="mt-3 text-sm text-[#A8A49C]/50">
                  あと1ステップで完了です。
                </p>
              </div>

              {/* Webhook URL */}
              <div className="glass rounded-2xl p-8 sm:p-10">
                <h3 className="text-lg font-bold mb-2 font-serif-jp tracking-wide">
                  Webhook URLを設定する
                </h3>
                <p className="text-[#A8A49C]/40 mb-6 text-sm">
                  LINE Developersの「Messaging API設定」→「Webhook URL」にこのURLを貼り付けてください。
                </p>

                <WebhookUrlBlock url={webhookUrl} onCopy={handleCopy} />

                <div className="mt-6 space-y-3">
                  <p className="text-sm text-[#A8A49C]/50 leading-relaxed">
                    <span className="text-[#C9A96E]/70 font-serif-jp font-bold">手順：</span>
                  </p>
                  <ol className="list-decimal list-inside text-sm text-[#A8A49C]/50 space-y-2 leading-relaxed">
                    <li>上のURLをコピー</li>
                    <li>LINE Developersの「Messaging API設定」を開く</li>
                    <li>「Webhook URL」に貼り付けて「更新」</li>
                    <li>「Webhookの利用」をオンにする</li>
                    <li>「検証」ボタンを押して「成功」と表示されればOK</li>
                  </ol>
                </div>
              </div>

              {/* Reset */}
              <div className="text-center">
                <button
                  onClick={() => {
                    setDeployed(false);
                    setClaudeApiKey("");
                    setLineToken("");
                    setLineSecret("");
                    setConfigId("");
                    setError("");
                  }}
                  className="text-sm text-[#A8A49C]/30 hover:text-[#F0EDE5] transition-all duration-500"
                >
                  設定をやり直す
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function WebhookUrlBlock({ url, onCopy }: { url: string; onCopy: (text: string) => void }) {
  const [copied, setCopied] = useState(false);

  const handleClick = () => {
    onCopy(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass rounded-xl overflow-hidden">
      <div className="px-5 py-3.5 border-b border-[#F0EDE5]/[0.04] flex items-center justify-between">
        <span className="text-sm text-[#A8A49C]/60">Webhook URL</span>
        <button
          onClick={handleClick}
          className={`text-xs px-3 py-1 rounded-full transition-all duration-500 ${
            copied
              ? "bg-[#C9A96E]/10 text-[#C9A96E] border border-[#C9A96E]/20"
              : "text-[#A8A49C]/40 hover:text-[#F0EDE5] border border-[#F0EDE5]/[0.06] hover:border-[#F0EDE5]/[0.15]"
          }`}
        >
          {copied ? "コピーしました" : "コピー"}
        </button>
      </div>
      <pre className="p-5 text-sm bg-[#050505] text-[#C9A96E]/70 overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed break-all">
        <code>{url}</code>
      </pre>
    </div>
  );
}
