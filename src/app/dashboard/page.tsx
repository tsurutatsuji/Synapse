"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

/* ─── Constants ─── */

const AI_MODELS = [
  { id: "claude", name: "Claude", provider: "Anthropic", badge: "おすすめ" },
  { id: "gpt", name: "GPT-4o", provider: "OpenAI", badge: null },
  { id: "gemini-flash", name: "Gemini Flash", provider: "Google", badge: "無料" },
] as const;

const LINE_GUIDE_STEPS = [
  { title: "LINE Developersにログイン", detail: "developers.line.biz にアクセスし、Googleアカウントでログイン。" },
  { title: "新しいプロバイダーを作る", detail: "「プロバイダー」→「作成」をクリック。名前は何でもOK（例：「マイAI」）。" },
  { title: "Messaging APIチャネルを作る", detail: "プロバイダーの中で「チャネル作成」→「Messaging API」を選択。チャネル名と説明を入力して作成。" },
  { title: "チャネルシークレットをコピー", detail: "「チャネル基本設定」タブの下にある「チャネルシークレット」をコピー → 下の「LINEのシークレット」に貼り付け。" },
  { title: "アクセストークンを発行してコピー", detail: "「Messaging API設定」タブの一番下「チャネルアクセストークン（長期）」→「発行」を押してコピー → 下の「LINEのトークン」に貼り付け。" },
];

const DEPLOY_STEPS = [
  "エージェントを登録",
  "OpenClaw に接続",
  "起動を確認",
  "デプロイ完了",
];

/* ─── Page ─── */

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Form state
  const [aiModel, setAiModel] = useState("claude");
  const [aiApiKey, setAiApiKey] = useState("");
  const [lineToken, setLineToken] = useState("");
  const [lineSecret, setLineSecret] = useState("");
  const [showLineGuide, setShowLineGuide] = useState(false);

  // 既存設定のヒント（マスク済み）
  const [aiApiKeyHint, setAiApiKeyHint] = useState("");
  const [lineTokenHint, setLineTokenHint] = useState("");
  const [lineSecretHint, setLineSecretHint] = useState("");

  // Deploy state
  const [deploying, setDeploying] = useState(false);
  const [deployed, setDeployed] = useState(false);
  const [deployStepIndex, setDeployStepIndex] = useState(-1);
  const [deployError, setDeployError] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [loading, setLoading] = useState(true);

  // Auth check
  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  // Load existing config
  useEffect(() => {
    if (status !== "authenticated") return;
    (async () => {
      try {
        const res = await fetch("/api/load-config");
        if (res.ok) {
          const data = await res.json();
          if (data.config) {
            // 生のキーは返ってこない — マスク済みヒントのみ
            setAiModel(data.config.aiProvider || "claude");
            setAiApiKeyHint(data.config.aiApiKeyHint || "");
            setLineTokenHint(data.config.lineTokenHint || "");
            setLineSecretHint(data.config.lineSecretHint || "");
            if (data.config.deployed) {
              setDeployed(true);
              setWebhookUrl(data.config.webhookUrl || "");
            }
          }
        }
      } catch {
        /* first time — no config */
      } finally {
        setLoading(false);
      }
    })();
  }, [status]);

  const canDeploy =
    !!lineToken.trim() &&
    !!lineSecret.trim() &&
    (aiModel === "gemini-flash" || !!aiApiKey.trim());

  const handleDeploy = async () => {
    if (!canDeploy) return;
    setDeploying(true);
    setDeployError("");
    setDeployStepIndex(0);

    try {
      const res = await fetch("/api/cloud-deploy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          aiProvider: aiModel,
          aiApiKey,
          lineToken,
          lineSecret,
        }),
      });

      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "デプロイに失敗しました");
      }

      // SSE stream
      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value);
        const lines = text.split("\n").filter((l) => l.startsWith("data: "));
        for (const line of lines) {
          try {
            const data = JSON.parse(line.slice(6));
            if (data.error) throw new Error(data.message);
            if (data.step) setDeployStepIndex(data.step - 1);
            if (data.done) {
              setWebhookUrl(data.webhookUrl || "");
              setDeployed(true);
            }
          } catch (e) {
            if (e instanceof Error && e.message !== "Unexpected end of JSON input") {
              throw e;
            }
          }
        }
      }
    } catch (e) {
      setDeployError(e instanceof Error ? e.message : "デプロイに失敗しました");
    } finally {
      setDeploying(false);
    }
  };

  const handleReset = () => {
    setDeployed(false);
    setDeploying(false);
    setDeployStepIndex(-1);
    setDeployError("");
    setWebhookUrl("");
  };

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

  /* ─── Deployed state ─── */
  if (deployed && !deploying) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-[#F0EDE5] washi-texture">
        <Header email={session?.user?.email} onLogout={() => signOut({ callbackUrl: "/" })} />
        <main className="max-w-xl mx-auto px-6 py-16 text-center space-y-8 animate-fade-in-up">
          <div className="w-16 h-16 rounded-full bg-[#C9A96E]/10 border border-[#C9A96E]/20 flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-[#C9A96E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold font-serif-jp">AIが稼働中です</h1>
            <p className="mt-3 text-sm text-[#A8A49C]/50">LINEでメッセージを送ってみてください。</p>
          </div>

          {webhookUrl && (
            <div className="glass rounded-xl p-5 text-left">
              <p className="text-xs text-[#C9A96E]/60 font-bold mb-2">Webhook URL</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-xs text-[#A8A49C]/60 font-mono truncate bg-[#050505] rounded-lg px-3 py-2">
                  {webhookUrl}
                </code>
                <button
                  onClick={() => navigator.clipboard.writeText(webhookUrl)}
                  className="shrink-0 text-xs px-3 py-2 rounded-lg bg-[#C73E1D] hover:bg-[#d4552f] text-[#F0EDE5] transition-all"
                >
                  コピー
                </button>
              </div>
              <p className="text-xs text-[#A8A49C]/30 mt-2">
                LINE Developers → Messaging API設定 → Webhook URL に貼り付けてください。
              </p>
            </div>
          )}

          <button onClick={handleReset} className="text-sm text-[#A8A49C]/30 hover:text-[#F0EDE5] transition-all">
            設定を変更する
          </button>
        </main>
      </div>
    );
  }

  /* ─── Deploy in progress ─── */
  if (deploying) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-[#F0EDE5] washi-texture">
        <Header email={session?.user?.email} onLogout={() => signOut({ callbackUrl: "/" })} />
        <main className="max-w-xl mx-auto px-6 py-16 space-y-8 animate-fade-in-up">
          <div className="text-center">
            {deployError ? (
              <>
                <div className="w-14 h-14 rounded-full bg-[#C73E1D]/10 border border-[#C73E1D]/20 flex items-center justify-center mx-auto mb-5">
                  <svg className="w-7 h-7 text-[#C73E1D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold font-serif-jp">エラーが発生しました</h2>
                <p className="mt-3 text-sm text-[#C73E1D]/70">{deployError}</p>
                <button
                  onClick={handleDeploy}
                  className="mt-6 text-sm px-6 py-2.5 rounded-full bg-[#C73E1D] hover:bg-[#d4552f] text-[#F0EDE5] transition-all"
                >
                  もう一度試す
                </button>
              </>
            ) : (
              <>
                <svg className="animate-spin h-10 w-10 text-[#C73E1D] mx-auto mb-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <h2 className="text-xl font-bold font-serif-jp">デプロイしています...</h2>
                <p className="mt-3 text-sm text-[#A8A49C]/50">1分ほどで完了します。そのままお待ちください。</p>
              </>
            )}
          </div>

          <div className="glass rounded-2xl p-6 space-y-3">
            {DEPLOY_STEPS.map((label, i) => {
              const state =
                i < deployStepIndex ? "done" : i === deployStepIndex ? "active" : "pending";
              return (
                <div
                  key={i}
                  className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-500 ${
                    state === "active"
                      ? "bg-[#C73E1D]/5 border border-[#C73E1D]/20"
                      : state === "done"
                      ? "bg-[#C9A96E]/5 border border-[#C9A96E]/10"
                      : "bg-[#F0EDE5]/[0.02] border border-[#F0EDE5]/[0.04]"
                  }`}
                >
                  <div className="shrink-0">
                    {state === "done" ? (
                      <div className="w-6 h-6 rounded-full bg-[#C9A96E] flex items-center justify-center">
                        <svg className="w-3.5 h-3.5 text-[#0a0a0a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    ) : state === "active" ? (
                      <svg className="animate-spin w-6 h-6 text-[#C73E1D]" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    ) : (
                      <div className="w-6 h-6 rounded-full border-2 border-[#A8A49C]/15" />
                    )}
                  </div>
                  <p className={`text-sm font-bold ${
                    state === "done" ? "text-[#C9A96E]/80"
                    : state === "active" ? "text-[#F0EDE5]"
                    : "text-[#A8A49C]/30"
                  }`}>{label}</p>
                </div>
              );
            })}
          </div>
        </main>
      </div>
    );
  }

  /* ─── Main form ─── */
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#F0EDE5] washi-texture">
      <Header email={session?.user?.email} onLogout={() => signOut({ callbackUrl: "/" })} />

      <main className="max-w-xl mx-auto px-6 py-12 space-y-10">
        {/* Title */}
        <div className="text-center">
          <p className="text-[#C9A96E]/50 text-xs tracking-[0.5em] mb-4 font-serif-jp">
            DEPLOY
          </p>
          <h1 className="text-3xl font-bold font-serif-jp tracking-tight">
            OpenClawをデプロイ
          </h1>
          <p className="mt-4 text-sm text-[#A8A49C]/50">
            モデルを選んで、LINEを連携して、ボタンを押す。それだけ。
          </p>
        </div>

        {/* ─── 1. Model selector ─── */}
        <div className="glass-strong rounded-2xl p-8">
          <h2 className="text-sm font-bold text-[#A8A49C]/60 mb-5 tracking-wider">
            AIモデルを選ぶ
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {AI_MODELS.map((model) => (
              <button
                key={model.id}
                onClick={() => setAiModel(model.id)}
                className={`relative p-4 rounded-xl text-center transition-all duration-500 ${
                  aiModel === model.id
                    ? "bg-[#C73E1D]/10 border-2 border-[#C73E1D]/40 ring-1 ring-[#C73E1D]/20"
                    : "bg-[#F0EDE5]/[0.02] border-2 border-transparent hover:border-[#F0EDE5]/[0.08]"
                }`}
              >
                {model.badge && (
                  <span className={`absolute -top-2 right-2 text-[10px] px-2 py-0.5 rounded-full ${
                    model.badge === "おすすめ"
                      ? "bg-[#C73E1D]/15 text-[#C73E1D] border border-[#C73E1D]/20"
                      : "bg-[#C9A96E]/10 text-[#C9A96E] border border-[#C9A96E]/20"
                  }`}>
                    {model.badge}
                  </span>
                )}
                <p className="font-bold text-sm">{model.name}</p>
                <p className="text-[10px] text-[#A8A49C]/40 mt-1">{model.provider}</p>
              </button>
            ))}
          </div>

          {/* API Key */}
          {aiModel !== "gemini-flash" && (
            <div className="mt-5">
              <input
                type="password"
                value={aiApiKey}
                onChange={(e) => setAiApiKey(e.target.value)}
                placeholder={aiApiKeyHint ? `設定済み (${aiApiKeyHint})` : (aiModel === "claude" ? "sk-ant-api03-..." : "sk-...")}
                className="w-full bg-[#F0EDE5]/[0.04] border border-[#F0EDE5]/[0.06] rounded-xl py-3 px-4 text-[#F0EDE5] placeholder:text-[#A8A49C]/20 focus:outline-none focus:ring-1 focus:ring-[#C9A96E]/30 font-mono text-sm transition-all"
              />
              <p className="mt-1.5 text-[11px] text-[#A8A49C]/30">
                {aiModel === "claude" ? "console.anthropic.com" : "platform.openai.com"} で取得
              </p>
            </div>
          )}
        </div>

        {/* ─── 2. LINE connection ─── */}
        <div className="glass-strong rounded-2xl p-8">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-bold text-[#A8A49C]/60 tracking-wider">
              LINEを連携する
            </h2>
            <button
              onClick={() => setShowLineGuide(!showLineGuide)}
              className="text-[11px] px-3 py-1 rounded-full border border-[#C73E1D]/30 text-[#C73E1D] hover:bg-[#C73E1D]/10 transition-all"
            >
              {showLineGuide ? "閉じる" : "取得方法をみる"}
            </button>
          </div>

          {/* LINE Guide */}
          {showLineGuide && (
            <div className="glass rounded-xl p-5 mb-6 space-y-3 animate-fade-in-up">
              <p className="text-xs text-[#C9A96E]/60 font-bold font-serif-jp">LINE連携の手順</p>
              {LINE_GUIDE_STEPS.map((step, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="shrink-0 w-5 h-5 rounded-full bg-[#C9A96E]/10 border border-[#C9A96E]/20 flex items-center justify-center text-[10px] text-[#C9A96E]/60 font-serif-jp mt-0.5">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-sm font-bold">{step.title}</p>
                    <p className="text-xs text-[#A8A49C]/50 mt-1 leading-relaxed">{step.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-2 text-xs text-[#A8A49C]/50 mb-2">
                <svg className="w-3.5 h-3.5 text-[#06C755]/70" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
                </svg>
                チャネルアクセストークン
              </label>
              <input
                type="password"
                value={lineToken}
                onChange={(e) => setLineToken(e.target.value)}
                placeholder={lineTokenHint ? `設定済み (${lineTokenHint})` : "トークンを貼り付け..."}
                className="w-full bg-[#F0EDE5]/[0.04] border border-[#F0EDE5]/[0.06] rounded-xl py-3 px-4 text-[#F0EDE5] placeholder:text-[#A8A49C]/20 focus:outline-none focus:ring-1 focus:ring-[#C9A96E]/30 font-mono text-sm transition-all"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-xs text-[#A8A49C]/50 mb-2">
                <svg className="w-3.5 h-3.5 text-[#C9A96E]/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                チャネルシークレット
              </label>
              <input
                type="password"
                value={lineSecret}
                onChange={(e) => setLineSecret(e.target.value)}
                placeholder={lineSecretHint ? `設定済み (${lineSecretHint})` : "シークレットを貼り付け..."}
                className="w-full bg-[#F0EDE5]/[0.04] border border-[#F0EDE5]/[0.06] rounded-xl py-3 px-4 text-[#F0EDE5] placeholder:text-[#A8A49C]/20 focus:outline-none focus:ring-1 focus:ring-[#C9A96E]/30 font-mono text-sm transition-all"
              />
            </div>
          </div>
        </div>

        {/* ─── Deploy button ─── */}
        <button
          onClick={handleDeploy}
          disabled={!canDeploy}
          className="w-full bg-[#C73E1D] hover:bg-[#d4552f] text-[#F0EDE5] font-bold py-4 px-6 rounded-full transition-all duration-500 disabled:opacity-20 disabled:cursor-not-allowed text-lg"
        >
          Deploy OpenClaw
        </button>

        {!canDeploy && (
          <p className="text-center text-xs text-[#A8A49C]/30">
            {!lineToken.trim() || !lineSecret.trim()
              ? "LINEのトークンとシークレットを入力してください"
              : "APIキーを入力してください"
            }
          </p>
        )}

        {/* ─── Comparison (like SimpleClaw) ─── */}
        <div className="glass rounded-2xl p-8">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-xs text-[#A8A49C]/30 font-bold mb-3">従来の方法</p>
              <p className="text-3xl font-bold text-[#A8A49C]/20 font-serif-jp">60分</p>
              <p className="text-[11px] text-[#A8A49C]/20 mt-2 leading-relaxed">
                VPS契約 → SSH接続 → Node.jsインストール → OpenClawインストール → 設定ファイル作成 → 起動...
              </p>
            </div>
            <div>
              <p className="text-xs text-[#C73E1D] font-bold mb-3">EasyClaw</p>
              <p className="text-3xl font-bold text-[#F0EDE5] font-serif-jp">&lt;1分</p>
              <p className="text-[11px] text-[#A8A49C]/50 mt-2 leading-relaxed">
                モデルを選んで、LINEを連携して、デプロイ。サーバー・SSH・環境構築は全部こちらで用意済み。
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

/* ─── Sub-components ─── */

function Header({ email, onLogout }: { email?: string | null; onLogout: () => void }) {
  return (
    <header className="border-b border-[#F0EDE5]/[0.04] bg-[#0a0a0a]/60 backdrop-blur-2xl sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-6 py-5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="shuin text-[9px]" style={{ width: "1.4rem", height: "1.4rem", borderWidth: "1px" }}>
            易
          </div>
          <span className="text-lg font-bold tracking-widest font-serif-jp text-[#F0EDE5]">
            EasyClaw
          </span>
        </Link>
        <div className="flex items-center gap-5">
          <span className="text-sm text-[#A8A49C]/40 hidden sm:block">{email}</span>
          <button
            onClick={onLogout}
            className="text-sm text-[#A8A49C]/60 hover:text-[#F0EDE5] transition-all duration-500 border border-[#F0EDE5]/[0.06] hover:border-[#F0EDE5]/[0.15] rounded-full px-4 py-1.5"
          >
            ログアウト
          </button>
        </div>
      </div>
    </header>
  );
}
