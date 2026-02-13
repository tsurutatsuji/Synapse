"use client";

import { useState } from "react";
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
  const [prompt, setPrompt] = useState("");
  const [generated, setGenerated] = useState("");
  const [generating, setGenerating] = useState(false);

  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setGenerating(true);
    // デモ: 実際のAPI連携はプレミアム機能として実装
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setGenerated(`// OpenClaw カスタムスキル
// 生成元: "${prompt}"

import { Skill } from '@openclaw/sdk';

export default new Skill({
  name: '${prompt.slice(0, 20)}...',
  description: '${prompt}',

  triggers: [
    { type: 'message', pattern: /.*/ }
  ],

  async handler(context) {
    const { message, reply } = context;

    // TODO: ここにスキルのロジックを実装
    // このコードはAIが生成したテンプレートです。
    // 実際の処理に合わせてカスタマイズしてください。

    await reply(\`スキル「${prompt.slice(0, 10)}」が応答しました: \${message.text}\`);
  }
});`);
    setGenerating(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generated);
  };

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
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="例: 毎朝7時に今日の天気と予定をLINEで教えてくれるスキル"
              rows={3}
              className="w-full bg-[#F0EDE5]/[0.04] border border-[#F0EDE5]/[0.06] rounded-xl py-3.5 px-4 text-[#F0EDE5] placeholder:text-[#A8A49C]/20 focus:outline-none focus:ring-1 focus:ring-[#C9A96E]/30 focus:border-[#C9A96E]/20 text-sm transition-all duration-500 resize-none"
            />
          </div>

          {/* Example Prompts */}
          <div>
            <p className="text-xs text-[#A8A49C]/30 mb-3">アイデア:</p>
            <div className="flex flex-wrap gap-2">
              {examplePrompts.map((ep) => (
                <button
                  key={ep}
                  onClick={() => setPrompt(ep)}
                  className="text-[11px] px-3 py-1.5 rounded-full border border-[#F0EDE5]/[0.06] text-[#A8A49C]/40 hover:text-[#F0EDE5] hover:border-[#F0EDE5]/[0.15] transition-all duration-500"
                >
                  {ep.length > 25 ? ep.slice(0, 25) + "..." : ep}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={generating || !prompt.trim()}
            className="w-full bg-[#C73E1D] hover:bg-[#d4552f] text-[#F0EDE5] font-bold py-4 px-6 rounded-full transition-all duration-500 disabled:opacity-10 disabled:cursor-not-allowed"
          >
            {generating ? (
              <span className="flex items-center justify-center gap-3">
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                AIがコードを生成中...
              </span>
            ) : (
              "スキルを生成する"
            )}
          </button>
        </div>

        {/* Generated Code */}
        {generated && (
          <div className="mt-8 animate-fade-in-up">
            <div className="glass rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-[#F0EDE5]/[0.04] flex items-center justify-between">
                <span className="text-sm text-[#C9A96E]/70 font-serif-jp">生成されたスキル</span>
                <button
                  onClick={handleCopy}
                  className="text-xs px-3 py-1 rounded-full text-[#A8A49C]/40 hover:text-[#F0EDE5] border border-[#F0EDE5]/[0.06] hover:border-[#F0EDE5]/[0.15] transition-all duration-500"
                >
                  コピー
                </button>
              </div>
              <pre className="p-6 text-sm bg-[#050505] text-[#A8A49C]/60 overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed">
                <code>{generated}</code>
              </pre>
            </div>
            <div className="mt-4 glass rounded-xl p-5">
              <p className="text-sm text-[#A8A49C]/50 leading-relaxed">
                <span className="text-[#C9A96E]/70 font-serif-jp font-bold">使い方：</span>
                このコードをコピーして、OpenClawの <code className="text-[#C73E1D]/70">skills/</code> フォルダに保存してください。
                OpenClawを再起動すると、スキルが有効になります。
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
