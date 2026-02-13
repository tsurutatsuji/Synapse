import Link from "next/link";

const useCases = [
  "メールの要約・返信",
  "LINEでチャット",
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
    <div className="min-h-screen bg-[#111111] text-[#F0EDE5] washi-texture">
      {/* ─── Navigation ─── */}
      <nav className="fixed top-0 w-full z-50 bg-[#111111]/70 backdrop-blur-2xl border-b border-[#C9A96E]/8">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="shuin text-xs">易</div>
            <span className="text-lg font-bold tracking-widest font-serif-jp">
              EasyClaw
            </span>
          </div>
          <Link
            href="/login"
            className="bg-transparent hover:bg-[#F0EDE5]/5 text-[#C9A96E] text-sm font-medium py-2 px-5 rounded-sm transition-all border border-[#C9A96E]/30 hover:border-[#C9A96E]/60 tracking-wider"
          >
            ログイン
          </Link>
        </div>
      </nav>

      {/* ─── Hero ─── */}
      <section className="relative pt-48 pb-40 px-6 overflow-hidden">
        {/* 背景パターン — 麻の葉 */}
        <div className="absolute inset-0 asanoha opacity-40" />
        {/* 藍色のぼかし */}
        <div className="absolute top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#1B4965]/10 rounded-full blur-[200px]" />

        <div className="relative max-w-4xl mx-auto flex flex-col items-center">
          {/* 縦書きアクセント（左） */}
          <div className="hidden lg:block absolute -left-20 top-0 tategaki text-[#C9A96E]/20 text-base tracking-[0.8em] select-none font-serif-jp leading-loose">
            簡単に始める
          </div>
          {/* 縦書きアクセント（右） */}
          <div className="hidden lg:block absolute -right-20 top-12 tategaki text-[#1B4965]/20 text-base tracking-[0.8em] select-none font-serif-jp leading-loose">
            一分で完了
          </div>

          {/* バッジ */}
          <div className="inline-flex items-center gap-3 bg-[#1B4965]/8 border border-[#C9A96E]/15 rounded-sm px-5 py-2 mb-14 text-sm text-[#C9A96E] tracking-wider">
            <span className="w-1.5 h-1.5 bg-[#C9A96E] rounded-full" />
            日本語完全対応
          </div>

          {/* メインタイトル — 明朝体 */}
          <h1 className="text-center text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.15] font-serif-jp">
            <span className="text-[#A8A49C]/60 text-3xl sm:text-4xl lg:text-5xl block mb-4 tracking-[0.2em] font-normal">
              AIアシスタントを
            </span>
            <span className="text-[#C73E1D]">一分</span>
            <span className="text-[#A8A49C]/70">で</span>
            デプロイ
          </h1>

          {/* 金色のライン */}
          <div className="mt-8 h-[1px] w-16 bg-gradient-to-r from-transparent via-[#C9A96E]/60 to-transparent" />

          <p className="mt-8 text-lg sm:text-xl text-[#A8A49C] max-w-lg mx-auto leading-[1.9] text-center tracking-wide">
            モデルを選んで、LINEを接続して、デプロイ。
            <br />
            <span className="text-[#A8A49C]/60">
              サーバーもSSHも不要。技術知識ゼロでOK。
            </span>
          </p>

          {/* CTA */}
          <div className="mt-16 flex flex-col sm:flex-row items-center gap-5">
            <Link
              href="/login"
              className="group relative bg-[#C73E1D] hover:bg-[#d4552f] text-[#F0EDE5] font-semibold py-4 px-12 rounded-sm transition-all text-lg animate-shu-glow tracking-wider"
            >
              無料で始める
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-[1px] bg-[#C9A96E]/40 group-hover:w-16 transition-all duration-500" />
            </Link>
            <a
              href="https://github.com/openclaw/openclaw"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#A8A49C] hover:text-[#C9A96E] font-medium py-4 px-8 rounded-sm transition-colors border border-[#F0EDE5]/8 hover:border-[#C9A96E]/30 tracking-wider"
            >
              GitHub を見る
            </a>
          </div>
        </div>
      </section>

      {/* ─── 区切り ─── */}
      <div className="mitsu-tomoe py-2" />

      {/* ─── Marquee（ユースケース） ─── */}
      <section className="py-12 border-y border-[#C9A96E]/8 overflow-hidden seigaiha">
        <div className="flex animate-marquee whitespace-nowrap">
          {[...useCases, ...useCases].map((item, i) => (
            <span
              key={i}
              className="mx-3 px-5 py-2.5 bg-[#111111]/80 border border-[#C9A96E]/10 rounded-sm text-sm text-[#A8A49C] shrink-0 tracking-wider"
            >
              {item}
            </span>
          ))}
        </div>
      </section>

      {/* ─── 3 ステップ ─── */}
      <section className="py-40 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-24">
            <p className="text-[#C9A96E] text-xs tracking-[0.5em] uppercase mb-6 font-serif-jp">
              — 手 順 —
            </p>
            <h2 className="text-3xl sm:text-5xl font-bold font-serif-jp tracking-wide">
              たった
              <span className="text-[#1B4965]">三</span>
              つの手順
            </h2>
            <div className="mt-6 h-[1px] w-12 mx-auto bg-gradient-to-r from-transparent via-[#C9A96E]/50 to-transparent" />
            <p className="mt-6 text-[#A8A49C] text-lg tracking-wide">
              面倒なサーバー設定は一切不要
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
            <StepCard
              kanji="一"
              label="01"
              title="モデルを選ぶ"
              description="Claude、GPT-4 など好きなAIモデルを選択。APIキーを入力するだけ。"
            />
            <StepCard
              kanji="二"
              label="02"
              title="LINEを接続"
              description="LINE Developers でチャネルアクセストークンを取得して貼り付け。30秒で完了。"
            />
            <StepCard
              kanji="三"
              label="03"
              title="デプロイ"
              description="ボタンを押すだけ。あなた専用のAIアシスタントが24時間稼働開始。"
            />
          </div>
        </div>
      </section>

      {/* ─── 区切り ─── */}
      <div className="mitsu-tomoe py-2" />

      {/* ─── 特徴 ─── */}
      <section className="py-40 px-6 relative">
        <div className="absolute inset-0 asanoha opacity-20" />
        <div className="relative max-w-5xl mx-auto">
          <div className="text-center mb-24">
            <p className="text-[#C9A96E] text-xs tracking-[0.5em] uppercase mb-6 font-serif-jp">
              — 特 徴 —
            </p>
            <h2 className="text-3xl sm:text-5xl font-bold font-serif-jp tracking-wide">
              なぜ
              <span className="text-[#C73E1D]">EasyClaw</span>
              ？
            </h2>
            <div className="mt-6 h-[1px] w-12 mx-auto bg-gradient-to-r from-transparent via-[#C9A96E]/50 to-transparent" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <FeatureCard
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              }
              title="一分でセットアップ"
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
      <section className="py-40 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="relative border border-[#C9A96E]/15 rounded-sm p-16 sm:p-24 overflow-hidden">
            {/* 背景パターン */}
            <div className="absolute inset-0 seigaiha opacity-60" />
            {/* 光 */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#1B4965]/8 rounded-full blur-[100px]" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#C73E1D]/5 rounded-full blur-[100px]" />

            <div className="relative">
              <p className="text-[#C9A96E] text-xs tracking-[0.5em] mb-8 font-serif-jp">
                — はじめましょう —
              </p>
              <h2 className="text-3xl sm:text-5xl font-bold leading-snug font-serif-jp tracking-wide">
                あなた専用の
                <br />
                AIアシスタントを
                <br />
                <span className="text-[#C73E1D]">一分</span>
                <span className="text-[#A8A49C]/50">で。</span>
              </h2>
              <div className="mt-8 h-[1px] w-12 mx-auto bg-gradient-to-r from-transparent via-[#C9A96E]/50 to-transparent" />
              <Link
                href="/login"
                className="inline-block mt-12 bg-[#C73E1D] hover:bg-[#d4552f] text-[#F0EDE5] font-semibold py-4 px-12 rounded-sm transition-all text-lg tracking-wider"
              >
                無料で始める
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-[#C9A96E]/8 py-14 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-sm text-[#A8A49C]/40">
          <div className="flex items-center gap-3">
            <div className="shuin text-[9px]" style={{ width: "1.5rem", height: "1.5rem" }}>
              易
            </div>
            <span className="font-serif-jp tracking-widest">EasyClaw</span>
          </div>
          <p className="tracking-wider">&copy; {new Date().getFullYear()} EasyClaw</p>
        </div>
      </footer>
    </div>
  );
}

/* ─── コンポーネント ─── */

function StepCard({
  kanji,
  label,
  title,
  description,
}: {
  kanji: string;
  label: string;
  title: string;
  description: string;
}) {
  return (
    <div className="group relative bg-[#161616]/80 border border-[#C9A96E]/8 rounded-sm p-10 hover:border-[#C9A96E]/25 transition-all duration-500">
      {/* 漢数字 — 大きく背景に（明朝体） */}
      <span className="absolute top-3 right-5 text-[#F0EDE5]/[0.025] text-8xl font-bold select-none leading-none font-serif-jp">
        {kanji}
      </span>

      {/* 朱印風ナンバー */}
      <div className="shuin text-xs mb-6">{label}</div>

      <h3 className="text-xl font-bold mt-1 mb-4 font-serif-jp tracking-wide">
        {title}
      </h3>
      <p className="text-[#A8A49C] leading-[1.9] text-sm tracking-wide">
        {description}
      </p>

      {/* 底の金色ライン */}
      <div className="absolute bottom-0 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-[#C9A96E]/15 to-transparent group-hover:via-[#C9A96E]/35 transition-all duration-500" />
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
    <div className="group bg-[#161616]/80 border border-[#C9A96E]/8 rounded-sm p-9 hover:border-[#C9A96E]/25 transition-all duration-500 relative">
      <div className="w-10 h-10 bg-[#1B4965]/10 border border-[#1B4965]/20 rounded-sm flex items-center justify-center text-[#C9A96E] mb-6">
        {icon}
      </div>
      <h3 className="text-lg font-bold mb-3 font-serif-jp tracking-wide">
        {title}
      </h3>
      <p className="text-[#A8A49C] leading-[1.9] text-sm tracking-wide">
        {description}
      </p>

      {/* 底の金色ライン */}
      <div className="absolute bottom-0 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-[#C9A96E]/10 to-transparent group-hover:via-[#C9A96E]/30 transition-all duration-500" />
    </div>
  );
}
