"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const examplePrompts = [
  "毎朝7時に今日の予定をLINEで教えてくれるスキル",
  "Slackのメンションを要約してLINEに転送するスキル",
  "写真を送ったら背景を削除してくれるスキル",
  "英語のメールを日本語に翻訳して返信案を作るスキル",
];

export default function ExtensionsPage() {
  const { status } = useSession();
  const router = useRouter();

  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#F0EDE5] washi-texture">
      {/* Header */}
      <nav className="border-b border-[#F0EDE5]/[0.04] bg-[#0a0a0a]/60 backdrop-blur-2xl sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="shuin text-[9px]" style={{ width: "1.4rem", height: "1.4rem", borderWidth: "1px" }}>易</div>
            <span className="text-lg font-bold tracking-widest font-serif-jp">EasyClaw</span>
          </Link>
          <Link href="/dashboard" className="text-sm text-[#A8A49C]/60 hover:text-[#F0EDE5] transition-all duration-500 border border-[#F0EDE5]/[0.06] hover:border-[#F0EDE5]/[0.15] rounded-full px-4 py-1.5">
            ダッシュボードへ
          </Link>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-6 py-20">
        {/* Title */}
        <div className="text-center mb-16">
          <p className="text-[#C9A96E]/50 text-xs tracking-[0.5em] mb-4 font-serif-jp">拡張機能</p>
          <h1 className="text-3xl font-bold font-serif-jp tracking-tight">
            カスタムスキル生成
          </h1>
          <p className="text-[#A8A49C]/50 mt-4 text-sm max-w-md mx-auto leading-relaxed">
            やりたいことを日本語で書くだけで、<br />
            AIがOpenClawのスキルコードを自動生成します。
          </p>
          <div className="mt-4">
            <span className="inline-flex items-center gap-2 text-xs px-4 py-1.5 rounded-full bg-[#C73E1D]/10 text-[#C73E1D] border border-[#C73E1D]/20">
              プレミアム限定
            </span>
          </div>
        </div>

        {/* Generator */}
        <div className="glass-strong rounded-2xl p-8 sm:p-10 space-y-6">
          <div>
            <label className="block text-sm text-[#A8A49C]/70 mb-2.5">
              どんなスキルを作りたいですか？
            </label>
            <textarea
              disabled
              placeholder="例: 毎朝7時に今日の天気と予定をLINEで教えてくれるスキル"
              rows={3}
              className="w-full bg-[#F0EDE5]/[0.04] border border-[#F0EDE5]/[0.06] rounded-xl py-3.5 px-4 text-[#F0EDE5] placeholder:text-[#A8A49C]/20 text-sm resize-none opacity-40 cursor-not-allowed"
            />
          </div>

          {/* Example Prompts */}
          <div>
            <p className="text-xs text-[#A8A49C]/30 mb-3">アイデア:</p>
            <div className="flex flex-wrap gap-2">
              {examplePrompts.map((ep) => (
                <span
                  key={ep}
                  className="text-[11px] px-3 py-1.5 rounded-full border border-[#F0EDE5]/[0.06] text-[#A8A49C]/20"
                >
                  {ep.length > 25 ? ep.slice(0, 25) + "..." : ep}
                </span>
              ))}
            </div>
          </div>

          <button
            disabled
            className="w-full bg-[#A8A49C]/20 text-[#A8A49C]/40 font-bold py-4 px-6 rounded-full cursor-not-allowed"
          >
            準備中
          </button>
        </div>

      </main>
    </div>
  );
}
