"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

/* ─── Constants ─── */

const AI_MODELS = [
  {
    id: "gemini-flash",
    name: "Gemini Flash",
    provider: "Google",
    badge: "無料・おすすめ",
    description: "無料で使えます。APIキーも不要です。",
    needsKey: false,
  },
  {
    id: "claude",
    name: "Claude",
    provider: "Anthropic",
    badge: "高性能",
    description: "より賢い回答が得られます。APIキーが必要です。",
    needsKey: true,
  },
  {
    id: "gpt",
    name: "GPT-4o",
    provider: "OpenAI",
    badge: null,
    description: "ChatGPTと同じAI。APIキーが必要です。",
    needsKey: true,
  },
] as const;

const LINE_GUIDE_STEPS = [
  {
    title: "LINE Developers を開く",
    detail: "developers.line.biz をブラウザで開いて、お持ちの LINE アカウントでログインしてください。",
  },
  {
    title: "「プロバイダー」を作る",
    detail: "ログインしたら「プロバイダー」→「作成」をクリック。名前は何でもOKです（例：「マイAIボット」）。",
  },
  {
    title: "「Messaging API」のボットを作る",
    detail: "作ったプロバイダーの中で「チャネル作成」→「Messaging API」を選んでください。ボットの名前と説明を入力して作成します。",
  },
  {
    title: "「シークレット」をコピーして貼り付け",
    detail: "「チャネル基本設定」タブを開いて、下のほうにある「チャネルシークレット」という文字列をコピー → このページの「シークレット」欄に貼り付けてください。",
  },
  {
    title: "「トークン」を発行して貼り付け",
    detail: "「Messaging API設定」タブの一番下にある「チャネルアクセストークン（長期）」の「発行」ボタンを押して、表示された文字列をコピー → このページの「トークン」欄に貼り付けてください。",
  },
];

const SETUP_STEPS = [
  "AIの準備をしています...",
  "LINEと接続しています...",
  "動作を確認しています...",
  "完了しました！",
];

/* ─── Page ─── */

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Form state — デフォルトは無料の Gemini Flash
  const [aiModel, setAiModel] = useState("gemini-flash");
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
            setAiModel(data.config.aiProvider || "gemini-flash");
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

  const selectedModel = AI_MODELS.find((m) => m.id === aiModel) || AI_MODELS[0];
  const canDeploy =
    !!lineToken.trim() &&
    !!lineSecret.trim() &&
    (!selectedModel.needsKey || !!aiApiKey.trim());

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
        throw new Error(data.error || "うまくいきませんでした");
      }

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
      setDeployError(e instanceof Error ? e.message : "うまくいきませんでした");
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

  /* ─── 起動完了 ─── */
  if (deployed && !deploying) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-[#F0EDE5] washi-texture">
        <Header email={session?.user?.email} onLogout={() => signOut({ callbackUrl: "/" })} />
        <main className="max-w-xl mx-auto px-6 py-16 space-y-8 animate-fade-in-up">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-[#C9A96E]/10 border border-[#C9A96E]/20 flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-[#C9A96E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold font-serif-jp mt-6">AIボットが動いています</h1>
            <p className="mt-3 text-sm text-[#A8A49C]/60">
              あと1つだけ設定が必要です。下の手順に従ってください。
            </p>
          </div>

          {webhookUrl && (
            <div className="glass rounded-xl p-6 space-y-5">
              {/* ステップ 1: URLをコピー */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-6 h-6 rounded-full bg-[#C73E1D] text-[#F0EDE5] text-xs font-bold flex items-center justify-center">1</span>
                  <p className="text-sm font-bold">この URL をコピーしてください</p>
                </div>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs text-[#A8A49C]/60 font-mono truncate bg-[#050505] rounded-lg px-3 py-2.5">
                    {webhookUrl}
                  </code>
                  <button
                    onClick={() => navigator.clipboard.writeText(webhookUrl)}
                    className="shrink-0 text-xs px-4 py-2.5 rounded-lg bg-[#C73E1D] hover:bg-[#d4552f] text-[#F0EDE5] transition-all font-bold"
                  >
                    コピー
                  </button>
                </div>
              </div>

              {/* ステップ 2: LINE Developersに貼り付け */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-6 h-6 rounded-full bg-[#C73E1D] text-[#F0EDE5] text-xs font-bold flex items-center justify-center">2</span>
                  <p className="text-sm font-bold">LINE Developers に貼り付け</p>
                </div>
                <div className="space-y-2 text-xs text-[#A8A49C]/50 leading-relaxed">
                  <p>1. <a href="https://developers.line.biz" target="_blank" rel="noopener noreferrer" className="text-[#C9A96E] underline">LINE Developers</a> を開いて、先ほど作ったボットを選びます</p>
                  <p>2. 「Messaging API設定」タブをクリック</p>
                  <p>3. 「Webhook URL」の欄に、コピーした URL を貼り付けます</p>
                  <p>4. 「Webhookの利用」をオンにします</p>
                </div>
              </div>

              {/* ステップ 3: 試す */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 rounded-full bg-[#C9A96E] text-[#0a0a0a] text-xs font-bold flex items-center justify-center">3</span>
                  <p className="text-sm font-bold">LINE でメッセージを送ってみましょう</p>
                </div>
                <p className="text-xs text-[#A8A49C]/50 leading-relaxed ml-8">
                  お友だちに話しかけるように、ボットにメッセージを送ってみてください。AIが返事をしてくれます。
                </p>
              </div>
            </div>
          )}

          <button onClick={handleReset} className="block mx-auto text-sm text-[#A8A49C]/30 hover:text-[#F0EDE5] transition-all">
            設定を変更する
          </button>
        </main>
      </div>
    );
  }

  /* ─── 起動中 ─── */
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
                <h2 className="text-xl font-bold font-serif-jp">うまくいきませんでした</h2>
                <p className="mt-3 text-sm text-[#C73E1D]/70">{deployError}</p>
                <p className="mt-2 text-xs text-[#A8A49C]/40">
                  LINEの情報が正しいか確認してから、もう一度お試しください。
                </p>
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
                <h2 className="text-xl font-bold font-serif-jp">AIボットを起動しています...</h2>
                <p className="mt-3 text-sm text-[#A8A49C]/50">1分ほどで完了します。画面はそのままでお待ちください。</p>
              </>
            )}
          </div>

          <div className="glass rounded-2xl p-6 space-y-3">
            {SETUP_STEPS.map((label, i) => {
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

  /* ─── メインフォーム ─── */
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#F0EDE5] washi-texture">
      <Header email={session?.user?.email} onLogout={() => signOut({ callbackUrl: "/" })} />

      <main className="max-w-xl mx-auto px-6 py-12 space-y-10">
        {/* タイトル */}
        <div className="text-center">
          <p className="text-[#C9A96E]/50 text-xs tracking-[0.3em] mb-4 font-serif-jp">
            SETUP
          </p>
          <h1 className="text-3xl font-bold font-serif-jp tracking-tight">
            LINE AIボットをつくる
          </h1>
          <p className="mt-4 text-sm text-[#A8A49C]/50">
            AIを選んで、LINEをつなげて、ボタンを押すだけ。
          </p>
        </div>

        {/* ─── ステップ 1: AIを選ぶ ─── */}
        <div className="glass-strong rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-5">
            <span className="w-7 h-7 rounded-full bg-[#C73E1D] text-[#F0EDE5] text-xs font-bold flex items-center justify-center">1</span>
            <h2 className="text-sm font-bold text-[#F0EDE5]">
              AIを選ぶ
            </h2>
          </div>

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
                    model.id === "gemini-flash"
                      ? "bg-[#C9A96E]/10 text-[#C9A96E] border border-[#C9A96E]/20"
                      : "bg-[#C73E1D]/15 text-[#C73E1D] border border-[#C73E1D]/20"
                  }`}>
                    {model.badge}
                  </span>
                )}
                <p className="font-bold text-sm">{model.name}</p>
                <p className="text-[10px] text-[#A8A49C]/40 mt-1">{model.provider}</p>
              </button>
            ))}
          </div>

          {/* 選んだモデルの説明 */}
          <p className="mt-4 text-xs text-[#A8A49C]/40 leading-relaxed">
            {selectedModel.description}
          </p>

          {/* APIキー入力（必要なモデルのみ） */}
          {selectedModel.needsKey && (
            <div className="mt-5">
              <label className="text-xs text-[#A8A49C]/50 mb-2 block">
                {aiModel === "claude" ? "Claude" : "OpenAI"} の APIキー
                <span className="text-[#C73E1D]/50 ml-1">（必須）</span>
              </label>
              <input
                type="password"
                value={aiApiKey}
                onChange={(e) => setAiApiKey(e.target.value)}
                placeholder={aiApiKeyHint ? `設定済み (${aiApiKeyHint})` : (aiModel === "claude" ? "sk-ant-api03-..." : "sk-...")}
                className="w-full bg-[#F0EDE5]/[0.04] border border-[#F0EDE5]/[0.06] rounded-xl py-3 px-4 text-[#F0EDE5] placeholder:text-[#A8A49C]/20 focus:outline-none focus:ring-1 focus:ring-[#C9A96E]/30 font-mono text-sm transition-all"
              />
              <p className="mt-1.5 text-[11px] text-[#A8A49C]/30">
                {aiModel === "claude" ? "console.anthropic.com" : "platform.openai.com"} で取得できます。
                <span className="text-[#C73E1D]/40 ml-1">他の人に見せないでください。</span>
              </p>
            </div>
          )}
        </div>

        {/* ─── ステップ 2: LINEをつなげる ─── */}
        <div className="glass-strong rounded-2xl p-8">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-full bg-[#C73E1D] text-[#F0EDE5] text-xs font-bold flex items-center justify-center">2</span>
              <h2 className="text-sm font-bold text-[#F0EDE5]">
                LINEをつなげる
              </h2>
            </div>
            <button
              onClick={() => setShowLineGuide(!showLineGuide)}
              className="text-[11px] px-3 py-1.5 rounded-full border border-[#C73E1D]/30 text-[#C73E1D] hover:bg-[#C73E1D]/10 transition-all"
            >
              {showLineGuide ? "閉じる" : "はじめての方はこちら"}
            </button>
          </div>

          <p className="text-xs text-[#A8A49C]/40 mb-5 leading-relaxed">
            LINE Developers でボットを作成して、2つの情報をここに貼り付けてください。
          </p>

          {/* LINE Guide */}
          {showLineGuide && (
            <div className="glass rounded-xl p-5 mb-6 space-y-4 animate-fade-in-up">
              <p className="text-xs text-[#C9A96E]/60 font-bold font-serif-jp">LINE ボットの作り方（5分）</p>
              {LINE_GUIDE_STEPS.map((step, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="shrink-0 w-6 h-6 rounded-full bg-[#C9A96E]/10 border border-[#C9A96E]/20 flex items-center justify-center text-[11px] text-[#C9A96E]/60 font-bold mt-0.5">
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
                トークン（チャネルアクセストークン）
              </label>
              <input
                type="password"
                value={lineToken}
                onChange={(e) => setLineToken(e.target.value)}
                placeholder={lineTokenHint ? `設定済み (${lineTokenHint})` : "ここに貼り付け..."}
                className="w-full bg-[#F0EDE5]/[0.04] border border-[#F0EDE5]/[0.06] rounded-xl py-3 px-4 text-[#F0EDE5] placeholder:text-[#A8A49C]/20 focus:outline-none focus:ring-1 focus:ring-[#C9A96E]/30 font-mono text-sm transition-all"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-xs text-[#A8A49C]/50 mb-2">
                <svg className="w-3.5 h-3.5 text-[#C9A96E]/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                シークレット（チャネルシークレット）
              </label>
              <input
                type="password"
                value={lineSecret}
                onChange={(e) => setLineSecret(e.target.value)}
                placeholder={lineSecretHint ? `設定済み (${lineSecretHint})` : "ここに貼り付け..."}
                className="w-full bg-[#F0EDE5]/[0.04] border border-[#F0EDE5]/[0.06] rounded-xl py-3 px-4 text-[#F0EDE5] placeholder:text-[#A8A49C]/20 focus:outline-none focus:ring-1 focus:ring-[#C9A96E]/30 font-mono text-sm transition-all"
              />
            </div>
          </div>
        </div>

        {/* ─── ステップ 3: 起動ボタン ─── */}
        <div className="space-y-3">
          <button
            onClick={handleDeploy}
            disabled={!canDeploy}
            className="w-full bg-[#C73E1D] hover:bg-[#d4552f] text-[#F0EDE5] font-bold py-4 px-6 rounded-full transition-all duration-500 disabled:opacity-20 disabled:cursor-not-allowed text-lg"
          >
            AIボットを起動する
          </button>

          {!canDeploy && (
            <p className="text-center text-xs text-[#A8A49C]/30">
              {!lineToken.trim() || !lineSecret.trim()
                ? "LINE の情報を入力してください"
                : "APIキーを入力してください"
              }
            </p>
          )}
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
