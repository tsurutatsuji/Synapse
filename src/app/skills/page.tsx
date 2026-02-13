"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

const skillCategories = [
  {
    category: "ショッピング・EC",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
      </svg>
    ),
    skills: [
      {
        name: "楽天市場 価格トラッカー",
        description: "指定した商品の価格を毎日チェック。値下がりしたらLINEで通知します。ポイント倍率も考慮した実質価格で比較。",
        tags: ["楽天", "価格監視", "通知"],
      },
      {
        name: "Amazon 価格比較",
        description: "楽天とAmazonの価格を自動比較。送料・ポイント込みでどちらがお得か教えてくれます。",
        tags: ["Amazon", "比較", "節約"],
      },
      {
        name: "楽天ポイント最適化",
        description: "お買い物マラソンやSPUの状況を分析し、最もポイントが貯まるタイミングと買い方を提案します。",
        tags: ["楽天", "ポイント", "最適化"],
      },
    ],
  },
  {
    category: "交通・旅行",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h8m-8 4h8m-4-8v16m-7-4h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
    skills: [
      {
        name: "JR 空席チェッカー",
        description: "新幹線や特急の空席状況を確認。希望の列車が空いたらLINEで通知します。",
        tags: ["JR", "新幹線", "予約"],
      },
      {
        name: "乗換案内 AI",
        description: "「明日の朝9時に渋谷に着きたい」と言うだけで、最適なルートと出発時刻を教えてくれます。",
        tags: ["乗換", "ルート", "時刻表"],
      },
    ],
  },
  {
    category: "ビジネス・確定申告",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
    skills: [
      {
        name: "レシートOCR + 仕訳",
        description: "レシートの写真をLINEで送るだけで、金額を読み取り、勘定科目を自動判定。確定申告用のCSVを出力します。",
        tags: ["OCR", "経費", "確定申告"],
      },
      {
        name: "請求書ジェネレーター",
        description: "「○○社に5万円の請求書」と伝えるだけで、PDF請求書を自動生成。インボイス制度対応。",
        tags: ["請求書", "PDF", "インボイス"],
      },
      {
        name: "売上レポート",
        description: "日次・週次・月次の売上をLINEで質問するだけで、グラフ付きレポートを作成します。",
        tags: ["売上", "レポート", "分析"],
      },
    ],
  },
  {
    category: "日常・生活",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
    skills: [
      {
        name: "天気予報 + 服装アドバイス",
        description: "毎朝、地域の天気予報と気温に合わせた服装をLINEで提案。傘が必要な日は事前に通知。",
        tags: ["天気", "通知", "毎朝"],
      },
      {
        name: "ゴミ出しリマインダー",
        description: "地域のゴミ収集スケジュールを登録すると、前日夜にLINEで通知。分別方法も教えてくれます。",
        tags: ["ゴミ出し", "通知", "生活"],
      },
      {
        name: "献立提案 AI",
        description: "冷蔵庫にある食材を伝えるだけで、レシピと買い物リストを提案。栄養バランスも考慮。",
        tags: ["料理", "レシピ", "食材"],
      },
    ],
  },
];

export default function SkillsPage() {
  useSession();

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

      <main className="max-w-5xl mx-auto px-6 py-20">
        {/* Title */}
        <div className="text-center mb-20">
          <p className="text-[#C9A96E]/50 text-xs tracking-[0.5em] mb-4 font-serif-jp">スキル</p>
          <h1 className="text-3xl sm:text-4xl font-bold font-serif-jp tracking-tight">
            Japan Skill Pack
          </h1>
          <p className="text-[#A8A49C]/50 mt-4 text-sm max-w-md mx-auto leading-relaxed">
            日本の生活に特化したAIスキル集。<br />
            LINEで話しかけるだけで、暮らしと仕事がもっとラクに。
          </p>
          <div className="mt-6">
            <span className="inline-flex items-center gap-2 text-xs px-4 py-1.5 rounded-full bg-[#C73E1D]/10 text-[#C73E1D] border border-[#C73E1D]/20">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
              </svg>
              プレミアム限定
            </span>
          </div>
        </div>

        {/* Skill Categories */}
        <div className="space-y-16">
          {skillCategories.map((cat) => (
            <section key={cat.category}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-[#C9A96E]/10 border border-[#C9A96E]/20 flex items-center justify-center text-[#C9A96E]/70">
                  {cat.icon}
                </div>
                <h2 className="text-lg font-bold font-serif-jp">{cat.category}</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {cat.skills.map((skill) => (
                  <div
                    key={skill.name}
                    className="glass rounded-2xl p-6 hover:bg-[#F0EDE5]/[0.03] transition-all duration-500"
                  >
                    <h3 className="font-bold text-sm mb-2">{skill.name}</h3>
                    <p className="text-xs text-[#A8A49C]/50 leading-relaxed mb-4">
                      {skill.description}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {skill.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] px-2 py-0.5 rounded-full bg-[#F0EDE5]/[0.04] text-[#A8A49C]/40 border border-[#F0EDE5]/[0.04]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-24 text-center">
          <div className="glass rounded-2xl p-10 max-w-lg mx-auto">
            <h3 className="text-xl font-bold font-serif-jp mb-3">Japan Skill Pack を使う</h3>
            <p className="text-sm text-[#A8A49C]/50 mb-8">
              プレミアムプランに登録すると、すべてのスキルがLINEから使えるようになります。
            </p>
            <Link
              href="/pricing"
              className="inline-block bg-[#C73E1D] hover:bg-[#d4552f] text-[#F0EDE5] font-semibold py-3.5 px-10 rounded-full transition-all duration-500"
            >
              プランを見る
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
