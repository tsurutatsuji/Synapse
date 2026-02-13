"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const WIZARD_STEPS = [
  { id: "environment", label: "環境を選ぶ" },
  { id: "ai", label: "AIを選ぶ" },
  { id: "line", label: "LINEと連携" },
  { id: "security", label: "セキュリティ" },
  { id: "deploy", label: "起動する" },
];

const AI_MODELS = [
  { id: "gemini-flash", name: "Gemini Flash", provider: "Google", price: "無料", tier: "free", description: "無料で使えるAIモデル。まずはこちらでお試し。" },
  { id: "claude", name: "Claude", provider: "Anthropic", price: "従量課金", tier: "premium", description: "高品質な日本語応答。ビジネス利用に最適。" },
  { id: "gpt", name: "GPT-4o", provider: "OpenAI", price: "従量課金", tier: "premium", description: "汎用性の高いAIモデル。幅広いタスクに対応。" },
  { id: "gemini-pro", name: "Gemini Pro", provider: "Google", price: "従量課金", tier: "premium", description: "Googleの高性能モデル。検索連携が強み。" },
];

const VPS_PROVIDERS = [
  { id: "local", name: "ローカル（無料お試し）", description: "お使いのパソコンで動かします", price: "¥0" },
  { id: "xserver", name: "XServer VPS", description: "10日間無料・国内最速", price: "月額¥830〜" },
  { id: "conoha", name: "ConoHa VPS", description: "時間課金・コスパ◎", price: "月額¥751〜" },
  { id: "sakura", name: "さくらのVPS", description: "2週間無料・老舗", price: "月額¥643〜" },
  { id: "other", name: "その他のVPS", description: "お手持ちのサーバー", price: "" },
];

const SECURITY_ITEMS = [
  { id: "sandbox", label: "サンドボックス有効化", description: "AIの操作範囲を制限し、システムファイルを保護", command: "openclaw config set sandbox true", default: true },
  { id: "nonroot", label: "非rootユーザー作成", description: "root権限ではなく専用ユーザーで実行", command: "sudo adduser openclaw && sudo su - openclaw", default: true },
  { id: "fail2ban", label: "Fail2Ban 導入", description: "不正なSSHログインを自動ブロック", command: "sudo apt install fail2ban -y && sudo systemctl enable fail2ban", default: true },
  { id: "tailscale", label: "Tailscale VPN", description: "安全なVPN経由でのみサーバーにアクセス", command: "curl -fsSL https://tailscale.com/install.sh | sh && sudo tailscale up", default: false },
  { id: "firewall", label: "ファイアウォール設定", description: "必要なポートのみ開放（SSH + Webhook）", command: "sudo ufw allow 22 && sudo ufw allow 443 && sudo ufw enable", default: true },
];

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Wizard state
  const [currentStep, setCurrentStep] = useState(0);
  const [deploymentType, setDeploymentType] = useState("local");
  const [aiModel, setAiModel] = useState("gemini-flash");
  const [aiApiKey, setAiApiKey] = useState("");
  const [lineToken, setLineToken] = useState("");
  const [lineSecret, setLineSecret] = useState("");
  const [securityOptions, setSecurityOptions] = useState<string[]>(
    SECURITY_ITEMS.filter((s) => s.default).map((s) => s.id)
  );
  const [deployed, setDeployed] = useState(false);
  const [deploying, setDeploying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Dashboard tabs (post-deploy)
  const [activeTab, setActiveTab] = useState<"guide" | "logs" | "backup" | "troubleshoot">("guide");

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
            setAiApiKey(data.config.aiApiKey || data.config.claudeApiKey || "");
            setAiModel(data.config.aiProvider || "claude");
            setLineToken(data.config.lineToken);
            setLineSecret(data.config.lineSecret);
            setDeploymentType(data.config.deploymentType || "local");
            setDeployed(true);
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
    if (!aiApiKey.trim() && aiModel !== "gemini-flash") return;
    if (!lineToken.trim() || !lineSecret.trim()) return;
    setDeploying(true);
    setError("");
    try {
      const res = await fetch("/api/save-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          claudeApiKey: aiApiKey,
          aiProvider: aiModel,
          lineToken,
          lineSecret,
          deploymentType,
          securitySetup: securityOptions.length > 0,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "保存に失敗しました");
      setDeployed(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "保存に失敗しました。もう一度お試しください。");
    } finally {
      setDeploying(false);
    }
  };

  const handleDownloadEnv = async () => {
    const res = await fetch("/api/download-env", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        claudeApiKey: aiApiKey,
        aiProvider: aiModel,
        lineToken,
        lineSecret,
      }),
    });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = ".env";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLogout = () => {
    signOut({ callbackUrl: "/" });
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const toggleSecurity = (id: string) => {
    setSecurityOptions((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: return !!deploymentType;
      case 1: return !!aiModel && (aiModel === "gemini-flash" || !!aiApiKey.trim());
      case 2: return !!lineToken.trim() && !!lineSecret.trim();
      case 3: return true;
      case 4: return true;
      default: return false;
    }
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

      <main className="max-w-2xl mx-auto px-6 py-12">
        {!deployed ? (
          /* ─── WIZARD MODE ─── */
          <div className="space-y-10">
            {/* Title */}
            <div className="text-center">
              <p className="text-[#C9A96E]/50 text-xs tracking-[0.5em] mb-4 font-serif-jp">
                セットアップ
              </p>
              <h1 className="text-3xl font-bold font-serif-jp tracking-tight">
                はじめましょう
              </h1>
            </div>

            {/* Progress Bar */}
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                {WIZARD_STEPS.map((step, i) => (
                  <div key={step.id} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 ${
                          i < currentStep
                            ? "bg-[#C9A96E] text-[#0a0a0a]"
                            : i === currentStep
                            ? "bg-[#C73E1D] text-[#F0EDE5]"
                            : "bg-[#F0EDE5]/[0.06] text-[#A8A49C]/40"
                        }`}
                      >
                        {i < currentStep ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          i + 1
                        )}
                      </div>
                      <span className={`text-[10px] mt-2 hidden sm:block ${
                        i <= currentStep ? "text-[#A8A49C]/60" : "text-[#A8A49C]/20"
                      }`}>
                        {step.label}
                      </span>
                    </div>
                    {i < WIZARD_STEPS.length - 1 && (
                      <div className={`w-8 sm:w-16 h-px mx-1 sm:mx-2 transition-all duration-500 ${
                        i < currentStep ? "bg-[#C9A96E]/60" : "bg-[#F0EDE5]/[0.06]"
                      }`} />
                    )}
                  </div>
                ))}
              </div>
              {/* Mobile step label */}
              <p className="text-center text-sm text-[#C9A96E]/60 font-serif-jp sm:hidden">
                {WIZARD_STEPS[currentStep].label}
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="glass rounded-2xl p-5 border-[#C73E1D]/20 bg-[#C73E1D]/5">
                <p className="text-sm text-[#C73E1D]">{error}</p>
              </div>
            )}

            {/* Step Content */}
            <div className="glass-strong rounded-2xl p-8 sm:p-10 animate-fade-in-up">
              {/* ─── Step 1: 環境選択 ─── */}
              {currentStep === 0 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-bold font-serif-jp mb-2">AIをどこで動かしますか？</h2>
                    <p className="text-sm text-[#A8A49C]/50">
                      まずはローカル（無料）で試して、気に入ったらVPSで24時間稼働にできます。
                      <Link href="/vps-guide" className="text-[#C73E1D] hover:text-[#d4552f] ml-1 transition-all duration-500">
                        詳しい比較を見る →
                      </Link>
                    </p>
                  </div>
                  <div className="space-y-3">
                    {VPS_PROVIDERS.map((vps) => (
                      <button
                        key={vps.id}
                        onClick={() => setDeploymentType(vps.id)}
                        className={`w-full text-left p-5 rounded-xl transition-all duration-500 ${
                          deploymentType === vps.id
                            ? "bg-[#C73E1D]/10 border border-[#C73E1D]/30 ring-1 ring-[#C73E1D]/20"
                            : "bg-[#F0EDE5]/[0.02] border border-[#F0EDE5]/[0.06] hover:border-[#F0EDE5]/[0.12]"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-bold text-sm">{vps.name}</p>
                            <p className="text-xs text-[#A8A49C]/40 mt-1">{vps.description}</p>
                          </div>
                          {vps.price && (
                            <span className={`text-sm font-bold ${
                              vps.price === "¥0" ? "text-[#06C755]" : "text-[#C9A96E]"
                            }`}>
                              {vps.price}
                            </span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* ─── Step 2: AIモデル選択 ─── */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-bold font-serif-jp mb-2">どのAIを使いますか？</h2>
                    <p className="text-sm text-[#A8A49C]/50">
                      まずは無料のGemini Flashがおすすめ。あとからいつでも変更できます。
                    </p>
                    <div className="mt-3 glass rounded-xl p-4">
                      <p className="text-xs text-[#C9A96E]/60">
                        <span className="font-bold">トライアルモード：</span>
                        フリープランは1日50メッセージまで。無料のGemini Flashで試してみましょう。
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {AI_MODELS.map((model) => (
                      <button
                        key={model.id}
                        onClick={() => setAiModel(model.id)}
                        className={`w-full text-left p-5 rounded-xl transition-all duration-500 ${
                          aiModel === model.id
                            ? "bg-[#C73E1D]/10 border border-[#C73E1D]/30 ring-1 ring-[#C73E1D]/20"
                            : "bg-[#F0EDE5]/[0.02] border border-[#F0EDE5]/[0.06] hover:border-[#F0EDE5]/[0.12]"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-sm">{model.name}</p>
                              {model.tier === "free" && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#06C755]/10 text-[#06C755] border border-[#06C755]/20">
                                  無料
                                </span>
                              )}
                              {model.tier === "premium" && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#C9A96E]/10 text-[#C9A96E]/70 border border-[#C9A96E]/20">
                                  プレミアム
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-[#A8A49C]/40 mt-1">{model.description}</p>
                          </div>
                          <span className="text-xs text-[#A8A49C]/40">{model.provider}</span>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* API Key input (not needed for free models) */}
                  {aiModel !== "gemini-flash" && (
                    <div className="mt-4">
                      <label className="flex items-center gap-2 text-sm text-[#A8A49C]/70 mb-2.5">
                        <svg className="w-4 h-4 text-[#C9A96E]/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                        APIキー
                      </label>
                      <input
                        type="password"
                        value={aiApiKey}
                        onChange={(e) => setAiApiKey(e.target.value)}
                        placeholder={aiModel === "claude" ? "sk-ant-api03-..." : aiModel === "gpt" ? "sk-..." : "AIxxxxx..."}
                        className="w-full bg-[#F0EDE5]/[0.04] border border-[#F0EDE5]/[0.06] rounded-xl py-3.5 px-4 text-[#F0EDE5] placeholder:text-[#A8A49C]/20 focus:outline-none focus:ring-1 focus:ring-[#C9A96E]/30 focus:border-[#C9A96E]/20 font-mono text-sm transition-all duration-500"
                      />
                      <p className="mt-2 text-xs text-[#A8A49C]/30">
                        {aiModel === "claude" && "console.anthropic.com にログインして取得"}
                        {aiModel === "gpt" && "platform.openai.com にログインして取得"}
                        {aiModel === "gemini-pro" && "aistudio.google.com にログインして取得"}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* ─── Step 3: LINE連携 ─── */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-bold font-serif-jp mb-2">LINEと連携する</h2>
                    <p className="text-sm text-[#A8A49C]/50">
                      LINE Developersから2つの情報を貼り付けるだけ。
                      <Link href="/guide" className="text-[#C73E1D] hover:text-[#d4552f] ml-1 transition-all duration-500">
                        取得方法をみる →
                      </Link>
                    </p>
                  </div>

                  {/* LINE Channel Access Token */}
                  <div>
                    <label className="flex items-center gap-2 text-sm text-[#A8A49C]/70 mb-2.5">
                      <svg className="w-4 h-4 text-[#06C755]/70" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
                      </svg>
                      LINEのトークン
                    </label>
                    <input
                      type="password"
                      value={lineToken}
                      onChange={(e) => setLineToken(e.target.value)}
                      placeholder="チャネルアクセストークンを貼り付け..."
                      className="w-full bg-[#F0EDE5]/[0.04] border border-[#F0EDE5]/[0.06] rounded-xl py-3.5 px-4 text-[#F0EDE5] placeholder:text-[#A8A49C]/20 focus:outline-none focus:ring-1 focus:ring-[#C9A96E]/30 focus:border-[#C9A96E]/20 font-mono text-sm transition-all duration-500"
                    />
                    <p className="mt-2 text-xs text-[#A8A49C]/30">
                      developers.line.biz → Messaging API設定 から取得
                    </p>
                  </div>

                  {/* LINE Channel Secret */}
                  <div>
                    <label className="flex items-center gap-2 text-sm text-[#A8A49C]/70 mb-2.5">
                      <svg className="w-4 h-4 text-[#C9A96E]/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      LINEのシークレット
                    </label>
                    <input
                      type="password"
                      value={lineSecret}
                      onChange={(e) => setLineSecret(e.target.value)}
                      placeholder="チャネルシークレットを貼り付け..."
                      className="w-full bg-[#F0EDE5]/[0.04] border border-[#F0EDE5]/[0.06] rounded-xl py-3.5 px-4 text-[#F0EDE5] placeholder:text-[#A8A49C]/20 focus:outline-none focus:ring-1 focus:ring-[#C9A96E]/30 focus:border-[#C9A96E]/20 font-mono text-sm transition-all duration-500"
                    />
                    <p className="mt-2 text-xs text-[#A8A49C]/30">
                      developers.line.biz → チャネル基本設定 から取得
                    </p>
                  </div>
                </div>
              )}

              {/* ─── Step 4: セキュリティ設定 ─── */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-bold font-serif-jp mb-2">セキュリティを強化する</h2>
                    <p className="text-sm text-[#A8A49C]/50">
                      おすすめの設定にチェックが入っています。そのままでOKです。
                      {deploymentType === "local" && (
                        <span className="block mt-2 text-[#C9A96E]/60">
                          ローカル環境の場合、サンドボックスのみが有効です。VPS移行時に他の設定も適用できます。
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="space-y-3">
                    {SECURITY_ITEMS.map((item) => {
                      const isVpsOnly = ["nonroot", "fail2ban", "tailscale", "firewall"].includes(item.id);
                      const disabled = deploymentType === "local" && isVpsOnly;
                      return (
                        <button
                          key={item.id}
                          onClick={() => !disabled && toggleSecurity(item.id)}
                          disabled={disabled}
                          className={`w-full text-left p-5 rounded-xl transition-all duration-500 ${
                            disabled
                              ? "opacity-30 cursor-not-allowed bg-[#F0EDE5]/[0.02] border border-[#F0EDE5]/[0.04]"
                              : securityOptions.includes(item.id)
                              ? "bg-[#C9A96E]/5 border border-[#C9A96E]/20"
                              : "bg-[#F0EDE5]/[0.02] border border-[#F0EDE5]/[0.06] hover:border-[#F0EDE5]/[0.12]"
                          }`}
                        >
                          <div className="flex items-start gap-4">
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 shrink-0 transition-all duration-300 ${
                              securityOptions.includes(item.id)
                                ? "bg-[#C9A96E] border-[#C9A96E]"
                                : "border-[#A8A49C]/20"
                            }`}>
                              {securityOptions.includes(item.id) && (
                                <svg className="w-3 h-3 text-[#0a0a0a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-sm">{item.label}</p>
                              <p className="text-xs text-[#A8A49C]/40 mt-1">{item.description}</p>
                              {disabled && (
                                <p className="text-[10px] text-[#A8A49C]/30 mt-1">VPS環境でのみ利用可能</p>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ─── Step 5: デプロイ確認 ─── */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-bold font-serif-jp mb-2">設定の確認</h2>
                    <p className="text-sm text-[#A8A49C]/50">
                      以下の内容で起動します。よろしいですか？
                    </p>
                  </div>

                  <div className="space-y-4">
                    <SummaryRow label="動作環境" value={VPS_PROVIDERS.find((v) => v.id === deploymentType)?.name || deploymentType} />
                    <SummaryRow label="AIモデル" value={AI_MODELS.find((m) => m.id === aiModel)?.name || aiModel} />
                    <SummaryRow label="LINE連携" value="設定済み" />
                    <SummaryRow label="セキュリティ" value={`${securityOptions.length}項目 有効`} />
                    <SummaryRow
                      label="プラン"
                      value={aiModel === "gemini-flash" ? "フリー（50メッセージ/日）" : "プレミアム（無制限）"}
                    />
                  </div>

                  <button
                    onClick={handleDeploy}
                    disabled={deploying}
                    className="w-full bg-[#C73E1D] hover:bg-[#d4552f] text-[#F0EDE5] font-bold py-4 px-6 rounded-full transition-all duration-500 disabled:opacity-30 text-lg mt-4"
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
                </div>
              )}
            </div>

            {/* Navigation Buttons */}
            {currentStep < 4 && (
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
                  disabled={currentStep === 0}
                  className="text-sm text-[#A8A49C]/40 hover:text-[#F0EDE5] transition-all duration-500 disabled:opacity-20 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
                  </svg>
                  もどる
                </button>
                <button
                  onClick={() => setCurrentStep((s) => Math.min(4, s + 1))}
                  disabled={!canProceed()}
                  className="bg-[#C73E1D] hover:bg-[#d4552f] text-[#F0EDE5] font-semibold py-3 px-8 rounded-full transition-all duration-500 disabled:opacity-10 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  次へ
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        ) : (
          /* ─── POST-DEPLOY DASHBOARD ─── */
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
                以下の手順でAIを起動できます。
              </p>
            </div>

            {/* Dashboard Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {[
                { id: "guide" as const, label: "セットアップ" },
                { id: "logs" as const, label: "ログ" },
                { id: "backup" as const, label: "バックアップ" },
                { id: "troubleshoot" as const, label: "トラブルシューター" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all duration-500 ${
                    activeTab === tab.id
                      ? "bg-[#C73E1D] text-[#F0EDE5]"
                      : "text-[#A8A49C]/50 hover:text-[#F0EDE5] border border-[#F0EDE5]/[0.06] hover:border-[#F0EDE5]/[0.15]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            {activeTab === "guide" && (
              <div className="glass rounded-2xl p-8 sm:p-10">
                <h3 className="text-lg font-bold mb-2 font-serif-jp tracking-wide">次にやること</h3>
                <p className="text-[#A8A49C]/40 mb-8 text-sm">
                  下のコマンドを1つずつコピーして、黒い画面（ターミナル）に貼り付けてください。
                </p>
                <div className="space-y-4">
                  <StepBlock step={1} title="OpenClawをダウンロード" command="git clone https://github.com/openclaw/openclaw.git && cd openclaw" onCopy={handleCopy} />
                  <div className="glass rounded-xl p-5 flex items-center justify-between">
                    <span className="text-sm text-[#A8A49C]/60 flex items-center gap-3">
                      <span className="w-5 h-5 rounded-full bg-[#C9A96E]/10 border border-[#C9A96E]/20 flex items-center justify-center text-[10px] text-[#C9A96E]/60 font-serif-jp">2</span>
                      カギのファイルをダウンロード
                    </span>
                    <button onClick={handleDownloadEnv} className="text-xs px-4 py-1.5 rounded-full bg-[#C73E1D] hover:bg-[#d4552f] text-[#F0EDE5] transition-all duration-500">
                      .envをダウンロード
                    </button>
                  </div>
                  <StepBlock step={3} title="ダウンロードした .env ファイルを openclaw フォルダに入れる" command="（ファイルをドラッグ&ドロップでOK）" onCopy={handleCopy} />
                  <StepBlock step={4} title="準備する" command="npm install" onCopy={handleCopy} />
                  <StepBlock step={5} title="起動する" command="npm run start" onCopy={handleCopy} />

                  {/* Security commands (if VPS) */}
                  {deploymentType !== "local" && securityOptions.length > 0 && (
                    <>
                      <div className="mt-6 mb-2">
                        <h4 className="text-sm font-bold text-[#C9A96E]/70 font-serif-jp">セキュリティ設定</h4>
                        <p className="text-xs text-[#A8A49C]/30 mt-1">以下のコマンドをVPSで実行してセキュリティを強化してください。</p>
                      </div>
                      {SECURITY_ITEMS.filter((s) => securityOptions.includes(s.id)).map((item, i) => (
                        <StepBlock key={item.id} step={6 + i} title={item.label} command={item.command} onCopy={handleCopy} />
                      ))}
                    </>
                  )}
                </div>

                <div className="mt-8 glass rounded-xl p-5">
                  <p className="text-sm text-[#A8A49C]/50 leading-relaxed">
                    <span className="text-[#C9A96E]/70 font-serif-jp font-bold">ヒント：</span>
                    LINE Developersの設定画面で、Webhook URLの設定が必要です。
                    起動後に表示されるURLを「Messaging API設定」→「Webhook URL」に貼り付けてください。
                  </p>
                </div>
              </div>
            )}

            {activeTab === "logs" && (
              <div className="glass rounded-2xl p-8 sm:p-10">
                <h3 className="text-lg font-bold mb-2 font-serif-jp tracking-wide">ログビューア</h3>
                <p className="text-[#A8A49C]/40 mb-6 text-sm">
                  OpenClawの動作ログをリアルタイムで確認できます。
                </p>
                <div className="bg-[#050505] rounded-xl p-5 font-mono text-xs text-[#A8A49C]/40 h-64 overflow-y-auto">
                  <p className="text-[#06C755]/70">[INFO] OpenClaw v2.4.1 起動中...</p>
                  <p className="text-[#06C755]/70">[INFO] LINE Messaging API 接続済み</p>
                  <p className="text-[#C9A96E]/70">[WARN] Webhook URL が未設定です</p>
                  <p className="text-[#A8A49C]/30 mt-4">
                    ログはOpenClawが稼働中のときにリアルタイムで表示されます。
                    VPSに接続してログを取得するには、プレミアムプランが必要です。
                  </p>
                </div>
                <div className="mt-4 flex gap-3">
                  <button className="text-xs px-4 py-2 rounded-full border border-[#F0EDE5]/[0.06] text-[#A8A49C]/40 hover:text-[#F0EDE5] hover:border-[#F0EDE5]/[0.15] transition-all duration-500">
                    ログを更新
                  </button>
                  <button className="text-xs px-4 py-2 rounded-full border border-[#F0EDE5]/[0.06] text-[#A8A49C]/40 hover:text-[#F0EDE5] hover:border-[#F0EDE5]/[0.15] transition-all duration-500">
                    ログをダウンロード
                  </button>
                </div>
              </div>
            )}

            {activeTab === "backup" && (
              <div className="glass rounded-2xl p-8 sm:p-10">
                <h3 className="text-lg font-bold mb-2 font-serif-jp tracking-wide">バックアップ</h3>
                <p className="text-[#A8A49C]/40 mb-6 text-sm">
                  設定とチャット履歴をバックアップ・復元できます。
                </p>

                <div className="space-y-4">
                  <div className="bg-[#F0EDE5]/[0.02] rounded-xl p-5 border border-[#F0EDE5]/[0.06]">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-sm">設定のバックアップ</p>
                        <p className="text-xs text-[#A8A49C]/30 mt-1">.env ファイルとSOUL.md をダウンロード</p>
                      </div>
                      <button onClick={handleDownloadEnv} className="text-xs px-4 py-2 rounded-full bg-[#C73E1D] hover:bg-[#d4552f] text-[#F0EDE5] transition-all duration-500">
                        ダウンロード
                      </button>
                    </div>
                  </div>

                  <div className="bg-[#F0EDE5]/[0.02] rounded-xl p-5 border border-[#F0EDE5]/[0.06]">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-sm">自動バックアップ</p>
                        <p className="text-xs text-[#A8A49C]/30 mt-1">毎日自動でバックアップを作成</p>
                      </div>
                      <span className="text-xs px-3 py-1 rounded-full bg-[#C9A96E]/10 text-[#C9A96E]/70 border border-[#C9A96E]/20">
                        プレミアム
                      </span>
                    </div>
                  </div>

                  <div className="bg-[#F0EDE5]/[0.02] rounded-xl p-5 border border-[#F0EDE5]/[0.06]">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-sm">バックアップから復元</p>
                        <p className="text-xs text-[#A8A49C]/30 mt-1">過去のバックアップから設定を復元</p>
                      </div>
                      <span className="text-xs px-3 py-1 rounded-full bg-[#C9A96E]/10 text-[#C9A96E]/70 border border-[#C9A96E]/20">
                        プレミアム
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <Link href="/pricing" className="text-sm text-[#C73E1D] hover:text-[#d4552f] transition-all duration-500">
                    プレミアムプランを見る →
                  </Link>
                </div>
              </div>
            )}

            {activeTab === "troubleshoot" && (
              <div className="glass rounded-2xl p-8 sm:p-10">
                <h3 className="text-lg font-bold mb-2 font-serif-jp tracking-wide">AIトラブルシューター</h3>
                <p className="text-[#A8A49C]/40 mb-6 text-sm">
                  よくある問題と解決方法。困ったときはこちらを確認してください。
                </p>

                <div className="space-y-3">
                  <TroubleshootItem
                    title="LINEからメッセージが届かない"
                    solutions={[
                      "Webhook URLが正しく設定されているか確認",
                      "LINE DevelopersでWebhookが「利用中」になっているか確認",
                      "OpenClawが起動しているか確認（npm run start）",
                    ]}
                  />
                  <TroubleshootItem
                    title="AIが応答しない"
                    solutions={[
                      "APIキーが正しく設定されているか確認",
                      "APIキーの残高（クレジット）があるか確認",
                      ".envファイルが正しい場所にあるか確認",
                    ]}
                  />
                  <TroubleshootItem
                    title="npm install でエラーが出る"
                    solutions={[
                      "Node.js のバージョンが22以上か確認: node -v",
                      "古いnode_modulesを削除して再実行: rm -rf node_modules && npm install",
                      "npmのキャッシュをクリア: npm cache clean --force",
                    ]}
                  />
                  <TroubleshootItem
                    title="VPSに接続できない"
                    solutions={[
                      "SSHの接続情報（IPアドレス、ユーザー名、パスワード）を確認",
                      "VPSが起動しているかプロバイダーの管理画面で確認",
                      "ファイアウォールでSSH（ポート22）が許可されているか確認",
                    ]}
                  />
                </div>
              </div>
            )}

            {/* Quick Links */}
            <div className="grid grid-cols-2 gap-3">
              <Link href="/skills" className="glass rounded-xl p-5 text-center hover:bg-[#F0EDE5]/[0.03] transition-all duration-500">
                <p className="text-sm font-bold">Japan Skill Pack</p>
                <p className="text-xs text-[#A8A49C]/30 mt-1">日本向けスキル</p>
              </Link>
              <Link href="/extensions" className="glass rounded-xl p-5 text-center hover:bg-[#F0EDE5]/[0.03] transition-all duration-500">
                <p className="text-sm font-bold">カスタムスキル</p>
                <p className="text-xs text-[#A8A49C]/30 mt-1">スキルを自動生成</p>
              </Link>
            </div>

            {/* Reset */}
            <div className="text-center">
              <button
                onClick={() => {
                  setDeployed(false);
                  setCurrentStep(0);
                  setAiApiKey("");
                  setLineToken("");
                  setLineSecret("");
                  setError("");
                  setDeploymentType("local");
                  setAiModel("gemini-flash");
                  setSecurityOptions(SECURITY_ITEMS.filter((s) => s.default).map((s) => s.id));
                }}
                className="text-sm text-[#A8A49C]/30 hover:text-[#F0EDE5] transition-all duration-500"
              >
                はじめからやり直す
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

/* ─── Sub-components ─── */

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-[#F0EDE5]/[0.04] last:border-0">
      <span className="text-sm text-[#A8A49C]/50">{label}</span>
      <span className="text-sm font-bold">{value}</span>
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
    <div className="glass rounded-xl overflow-hidden">
      <div className="px-5 py-3.5 border-b border-[#F0EDE5]/[0.04] flex items-center justify-between">
        <span className="text-sm text-[#A8A49C]/60 flex items-center gap-3">
          <span className="w-5 h-5 rounded-full bg-[#C9A96E]/10 border border-[#C9A96E]/20 flex items-center justify-center text-[10px] text-[#C9A96E]/60 font-serif-jp">
            {step}
          </span>
          {title}
        </span>
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
      <pre className="p-5 text-sm bg-[#050505] text-[#A8A49C]/60 overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed">
        <code>{command}</code>
      </pre>
    </div>
  );
}

function TroubleshootItem({
  title,
  solutions,
}: {
  title: string;
  solutions: string[];
}) {
  return (
    <details className="glass rounded-xl group">
      <summary className="p-5 cursor-pointer flex items-center justify-between text-sm font-bold list-none">
        {title}
        <svg className="w-4 h-4 text-[#A8A49C]/40 group-open:rotate-180 transition-transform duration-300 shrink-0 ml-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
        </svg>
      </summary>
      <div className="px-5 pb-5 space-y-2">
        {solutions.map((sol, i) => (
          <div key={i} className="flex items-start gap-2">
            <span className="text-[#C9A96E]/60 mt-0.5 shrink-0">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </span>
            <p className="text-sm text-[#A8A49C]/50">{sol}</p>
          </div>
        ))}
      </div>
    </details>
  );
}
