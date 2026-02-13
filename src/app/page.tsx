import Link from "next/link";

const useCases = [
  "メールの要約・返信",
  "Telegramでチャット",
  "書類の自動翻訳",
  "議事録の作成",
  "サポート対応の自動化",
  "スケジュール管理",
  "リサーチ・情報収集",
  "契約書の下書き",
  "SNS投稿の作成",
  "請求書の生成",
  "競合分析レポート",
  "旅行・ホテルの手配",
  "プレゼン資料の作成",
  "データの整理・分析",
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#141414] text-[#F0EDE5] washi-texture">
      {/* ─── Navigation ─── */}
      <nav className="fixed top-0 w-full z-50 bg-[#141414]/80 backdrop-blur-xl border-b border-[#F0EDE5]/5">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#1B4965] rounded-md flex items-center justify-center text-sm font-bold text-[#F0EDE5]">
              易
            </div>
            <span className="text-lg font-bold tracking-wide">EasyClaw</span>
          </div>
          <Link
            href="/login"
            className="bg-[#F0EDE5]/5 hover:bg-[#F0EDE5]/10 text-[#F0EDE5] text-sm font-medium py-2 px-5 rounded-md transition-all border border-[#F0EDE5]/10"
          >
            ログイン
          </Link>
        </div>
      </nav>

      {/* ─── Hero ─── */}
      <section className="relative pt-40 pb-32 px-6 overflow-hidden">
        {/* 背景の藍色ぼかし — 控えめに */}
        <div className="absolute top-32 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[#1B4965]/15 rounded-full blur-[150px]" />

        <div className="relative max-w-4xl mx-auto flex flex-col items-center">
          {/* 縦書きアクセント */}
          <div className="hidden sm:block absolute -left-8 top-0 tategaki text-[#C9A96E]/30 text-sm tracking-[0.5em] select-none">
            簡単に始める
          </div>

          <div className="inline-flex items-center gap-2 bg-[#1B4965]/15 border border-[#1B4965]/30 rounded-md px-4 py-1.5 mb-10 text-sm text-[#C9A96E]">
            <span className="w-1.5 h-1.5 bg-[#C9A96E] rounded-full" />
            日本語完全対応
          </div>

          <h1 className="text-center text-5xl sm:text-7xl font-bold tracking-tight leading-tight">
            OpenClawを
            <br />
            <span className="text-[#C73E1D]">一分</span>
            <span className="text-[#A8A49C]">で</span>デプロイ
          </h1>

          <p className="mt-8 text-lg sm:text-xl text-[#A8A49C] max-w-xl mx-auto leading-relaxed text-center">
            モデルを選んで、Telegramを接続して、デプロイ。
            <br />
            サーバーもSSHも不要。技術知識ゼロでOK。
          </p>

          {/* CTA */}
          <div className="mt-14 flex flex-col sm:flex-row items-center gap-4">
            <Link
              href="/login"
              className="bg-[#C73E1D] hover:bg-[#d4552f] text-[#F0EDE5] font-semibold py-3.5 px-10 rounded-md transition-all text-lg animate-shu-glow"
            >
              無料で始める
            </Link>
            <a
              href="https://github.com/openclaw/openclaw"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#A8A49C] hover:text-[#F0EDE5] font-medium py-3.5 px-8 rounded-md transition-colors border border-[#F0EDE5]/10 hover:border-[#F0EDE5]/20"
            >
              GitHub を見る
            </a>
          </div>
        </div>
      </section>

      {/* ─── Marquee（ユースケース） ─── */}
      <section className="py-10 border-y border-[#F0EDE5]/5 overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap">
          {[...useCases, ...useCases].map((item, i) => (
            <span
              key={i}
              className="mx-3 px-5 py-2 bg-[#1B4965]/10 border border-[#1B4965]/20 rounded-md text-sm text-[#A8A49C] shrink-0"
            >
              {item}
            </span>
          ))}
        </div>
      </section>

      {/* ─── 3 ステップ ─── */}
      <section className="py-32 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-20">
            <p className="text-[#C9A96E] text-sm tracking-[0.3em] uppercase mb-4">
              How it works
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold">
              たった<span className="text-[#1B4965]">三</span>つの手順で完了
            </h2>
            <p className="mt-5 text-[#A8A49C] text-lg">
              面倒なサーバー設定は一切不要。画面の指示に従うだけ。
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <StepCard
              number="一"
              label="01"
              title="モデルを選ぶ"
              description="Claude、GPT-4 など好きなAIモデルを選択。APIキーを入力するだけ。"
            />
            <StepCard
              number="二"
              label="02"
              title="Telegramを接続"
              description="BotFather でトークンを取得して貼り付け。30秒で完了。"
            />
            <StepCard
              number="三"
              label="03"
              title="デプロイ"
              description="ボタンを押すだけ。あなた専用のAIアシスタントが24時間稼働開始。"
            />
          </div>
        </div>
      </section>

      {/* ─── 特徴 ─── */}
      <section className="py-32 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-20">
            <p className="text-[#C9A96E] text-sm tracking-[0.3em] uppercase mb-4">
              Features
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold">
              なぜ<span className="text-[#C73E1D]">EasyClaw</span>？
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <FeatureCard
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              }
              title="1分でセットアップ"
              description="サーバーの構築、SSH接続、環境構築。すべてスキップ。ボタンひとつで完了。"
            />
            <FeatureCard
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                </svg>
              }
              title="完全日本語対応"
              description="UIもドキュメントもすべて日本語。英語が読めなくても問題なし。"
            />
            <FeatureCard
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              }
              title="安全・セキュア"
              description="APIキーはブラウザから直接送信。サーバーに保存されることはありません。"
            />
            <FeatureCard
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              title="完全無料"
              description="EasyClawの利用料は無料。かかるのはAI APIの利用料だけ。"
            />
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-32 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-[#1B4965]/10 border border-[#1B4965]/20 rounded-2xl p-14 sm:p-20 relative overflow-hidden">
            {/* 控えめな藍色の光 */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#1B4965]/10 rounded-full blur-[80px]" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#C73E1D]/5 rounded-full blur-[80px]" />

            <div className="relative">
              <p className="text-[#C9A96E] text-sm tracking-[0.3em] mb-6">
                はじめましょう
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold leading-snug">
                あなた専用のAIアシスタントを
                <br />
                たった<span className="text-[#C73E1D]">一分</span>で。
              </h2>
              <Link
                href="/login"
                className="inline-block mt-10 bg-[#C73E1D] hover:bg-[#d4552f] text-[#F0EDE5] font-semibold py-4 px-10 rounded-md transition-all text-lg"
              >
                無料で始める
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-[#F0EDE5]/5 py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-[#A8A49C]/60">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-[#1B4965] rounded flex items-center justify-center text-[9px] font-bold text-[#F0EDE5]">
              易
            </div>
            <span>EasyClaw</span>
          </div>
          <p>&copy; {new Date().getFullYear()} EasyClaw</p>
        </div>
      </footer>
    </div>
  );
}

/* ─── コンポーネント ─── */

function StepCard({
  number,
  label,
  title,
  description,
}: {
  number: string;
  label: string;
  title: string;
  description: string;
}) {
  return (
    <div className="group relative bg-[#1C1C1C]/60 border border-[#F0EDE5]/5 rounded-xl p-8 hover:border-[#1B4965]/30 transition-all">
      {/* 漢数字 — 大きく背景に */}
      <span className="absolute top-4 right-5 text-[#F0EDE5]/[0.03] text-7xl font-bold select-none leading-none">
        {number}
      </span>

      <span className="text-[#C9A96E] text-xs tracking-widest font-medium">
        {label}
      </span>
      <h3 className="text-xl font-bold mt-3 mb-3">{title}</h3>
      <p className="text-[#A8A49C] leading-relaxed text-sm">{description}</p>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-[#1C1C1C]/60 border border-[#F0EDE5]/5 rounded-xl p-7 hover:border-[#1B4965]/30 transition-all">
      <div className="w-10 h-10 bg-[#1B4965]/15 border border-[#1B4965]/25 rounded-lg flex items-center justify-center text-[#C9A96E] mb-5">
        {icon}
      </div>
      <h3 className="text-lg font-bold mb-2">{title}</h3>
      <p className="text-[#A8A49C] leading-relaxed text-sm">{description}</p>
    </div>
  );
}
