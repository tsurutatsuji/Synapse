"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const plans = [
  {
    name: "フリー",
    price: "¥0",
    period: "永久無料",
    description: "まずは気軽にお試し",
    features: [
      "1日50メッセージまで",
      "Gemini Flash（無料AIモデル）",
      "ローカル環境で動作",
      "LINE連携",
      "基本セキュリティガイド",
      "日本語セットアップウィザード",
    ],
    limitations: [
      "VPSデプロイガイドのみ",
      "Japan Skill Pack なし",
      "バックアップ機能なし",
    ],
    cta: "無料ではじめる",
    highlighted: false,
    comingSoon: false,
    href: "/login",
  },
  {
    name: "プレミアム",
    price: "¥1,980",
    period: "/ 月",
    description: "本格的にAIを活用したい方",
    features: [
      "メッセージ無制限",
      "Claude / GPT / Gemini Pro 対応",
      "VPSワンクリックデプロイ",
      "Japan Skill Pack 全機能",
      "ログビューア & バックアップ",
      "AIトラブルシューター",
      "カスタムスキル生成",
      "優先サポート",
    ],
    limitations: [],
    cta: "プレミアムに登録",
    highlighted: false,
    comingSoon: true,
    href: "/login",
  },
];

export default function PricingPage() {
  const { status } = useSession();
  const router = useRouter();

  const handleSelect = (href: string) => {
    if (status === "authenticated") {
      router.push("/dashboard");
    } else {
      router.push(href);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#F0EDE5] washi-texture">
      {/* Header */}
      <nav className="border-b border-[#F0EDE5]/[0.04] bg-[#0a0a0a]/60 backdrop-blur-2xl sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="shuin text-[9px]" style={{ width: "1.4rem", height: "1.4rem", borderWidth: "1px" }}>易</div>
            <span className="text-lg font-bold tracking-widest font-serif-jp">EasyClaw</span>
          </Link>
          <Link href="/dashboard" className="text-sm text-[#A8A49C]/60 hover:text-[#F0EDE5] transition-all duration-500 border border-[#F0EDE5]/[0.06] hover:border-[#F0EDE5]/[0.15] rounded-full px-4 py-1.5">
            ダッシュボードへ
          </Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-20">
        {/* Title */}
        <div className="text-center mb-20">
          <p className="text-[#C9A96E]/50 text-xs tracking-[0.5em] mb-4 font-serif-jp">料金プラン</p>
          <h1 className="text-3xl sm:text-4xl font-bold font-serif-jp tracking-tight">
            シンプルな料金体系
          </h1>
          <p className="text-[#A8A49C]/50 mt-4 text-sm">
            まずは無料で試して、気に入ったらアップグレード。
          </p>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`glass rounded-2xl p-8 sm:p-10 relative ${
                plan.highlighted ? "ring-1 ring-[#C73E1D]/30" : ""
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-[#C73E1D] text-[#F0EDE5] text-xs px-4 py-1 rounded-full font-bold">
                    人気
                  </span>
                </div>
              )}

              <h3 className="text-xl font-bold font-serif-jp mb-2">{plan.name}</h3>
              <p className="text-sm text-[#A8A49C]/50 mb-4">{plan.description}</p>

              <div className="mb-8">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-sm text-[#A8A49C]/50 ml-1">{plan.period}</span>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2.5 text-sm">
                    <svg className="w-4 h-4 text-[#C9A96E] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-[#A8A49C]/70">{feature}</span>
                  </li>
                ))}
                {plan.limitations.map((limitation) => (
                  <li key={limitation} className="flex items-center gap-2.5 text-sm">
                    <svg className="w-4 h-4 text-[#A8A49C]/20 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span className="text-[#A8A49C]/30">{limitation}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => !plan.comingSoon && handleSelect(plan.href)}
                disabled={plan.comingSoon}
                className={`w-full py-3.5 rounded-full font-semibold transition-all duration-500 ${
                  plan.comingSoon
                    ? "bg-[#A8A49C]/20 text-[#A8A49C]/40 cursor-not-allowed"
                    : "border border-[#F0EDE5]/[0.08] hover:border-[#F0EDE5]/[0.15] text-[#A8A49C] hover:text-[#F0EDE5]"
                }`}
              >
                {plan.comingSoon ? "準備中" : plan.cta}
              </button>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="mt-24 max-w-2xl mx-auto">
          <h2 className="text-xl font-bold font-serif-jp text-center mb-10">よくある質問</h2>
          <div className="space-y-4">
            <FaqItem
              question="AI（Claude / GPT）の利用料は含まれますか？"
              answer="EasyClawの料金にAIの利用料は含まれません。AIプロバイダー（Anthropic、OpenAI等）に直接お支払いいただきます（BYOK: Bring Your Own Key）。フリープランではGemini Flashなど無料のAIモデルをご利用いただけます。"
            />
            <FaqItem
              question="いつでも解約できますか？"
              answer="はい、いつでもワンクリックで解約できます。解約後も当月末まではプレミアム機能をご利用いただけます。"
            />
            <FaqItem
              question="VPSの費用は別途かかりますか？"
              answer="はい、VPSの費用はVPSプロバイダーに直接お支払いいただきます。ローカル環境で動かす場合はVPS費用はかかりません。"
            />
            <FaqItem
              question="フリープランからプレミアムへのデータ移行は？"
              answer="自動的に移行されます。設定やLINE連携はそのまま引き継がれ、プレミアム機能が即座に有効になります。"
            />
          </div>
        </div>
      </main>
    </div>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  return (
    <details className="glass rounded-2xl group">
      <summary className="p-6 cursor-pointer flex items-center justify-between text-sm font-bold list-none">
        {question}
        <svg className="w-4 h-4 text-[#A8A49C]/40 group-open:rotate-180 transition-transform duration-300 shrink-0 ml-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
        </svg>
      </summary>
      <div className="px-6 pb-6 text-sm text-[#A8A49C]/60 leading-relaxed">
        {answer}
      </div>
    </details>
  );
}
