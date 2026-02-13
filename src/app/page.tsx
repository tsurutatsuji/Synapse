import Link from "next/link";

const useCases = [
  "メールの要約・返信",
  "LINEでAIとチャット",
  "書類の自動翻訳",
  "議事録の作成",
  "お問い合わせ対応",
  "スケジュール管理",
  "情報のリサーチ",
  "契約書の下書き",
  "SNS投稿の作成",
  "請求書の作成",
  "プレゼン資料の作成",
  "データの整理",
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#F0EDE5] washi-texture">
      {/* ─── Navigation ─── */}
      <nav className="fixed top-0 w-full z-50 bg-[#0a0a0a]/60 backdrop-blur-2xl border-b border-[#F0EDE5]/[0.04]">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="shuin text-[10px]">易</div>
            <span className="text-lg font-bold tracking-widest font-serif-jp">
              EasyClaw
            </span>
          </div>
          <Link
            href="/login"
            className="text-[#A8A49C] hover:text-[#F0EDE5] text-sm py-2 px-5 rounded-full transition-all duration-500 border border-[#F0EDE5]/[0.06] hover:border-[#F0EDE5]/[0.15] hover:bg-[#F0EDE5]/[0.04]"
          >
            ログイン
          </Link>
        </div>
      </nav>

      {/* ─── Hero ─── */}
      <section className="relative pt-52 pb-48 px-6 overflow-hidden">
        {/* 背景 — ほぼ見えない麻の葉 */}
        <div className="absolute inset-0 asanoha" />
        {/* 光の演出 */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[#1B4965]/[0.06] rounded-full blur-[250px]" />
        <div className="absolute top-60 left-1/4 w-[300px] h-[300px] bg-[#C73E1D]/[0.03] rounded-full blur-[200px]" />

        <div className="relative max-w-5xl mx-auto flex flex-col items-center">
          {/* 縦書きアクセント */}
          <div className="hidden lg:block absolute -left-16 top-8 tategaki text-[#C9A96E]/[0.12] text-sm tracking-[1em] select-none font-serif-jp">
            かんたん
          </div>

          {/* バッジ */}
          <div className="inline-flex items-center gap-2 glass rounded-full px-5 py-2 mb-16 text-xs text-[#A8A49C] tracking-widest">
            <span className="w-1.5 h-1.5 bg-[#C9A96E] rounded-full" />
            日本語でかんたん
          </div>

          {/* メインタイトル — 超巨大・Apple風 */}
          <h1 className="text-center font-serif-jp">
            <span className="block text-5xl sm:text-7xl lg:text-[5.5rem] font-bold tracking-tight leading-[1.1]">
              あなた専用の
            </span>
            <span className="block text-5xl sm:text-7xl lg:text-[5.5rem] font-bold tracking-tight leading-[1.1] mt-2">
              <span className="text-[#C73E1D]">AI</span>アシスタント。
            </span>
          </h1>

          {/* 金色の極細ライン */}
          <div className="mt-10 h-px w-12 bg-gradient-to-r from-transparent via-[#C9A96E]/40 to-transparent" />

          <p className="mt-10 text-lg sm:text-xl text-[#A8A49C]/80 max-w-md mx-auto leading-[2] text-center">
            LINEで話しかけるだけで、
            <br />
            AIがあなたの仕事をお手伝い。
            <br />
            <span className="text-[#A8A49C]/50">
              むずかしい設定は一切ありません。
            </span>
          </p>

          {/* CTA — 1つだけ、際立たせる */}
          <div className="mt-16 flex flex-col items-center gap-4">
            <Link
              href="/login"
              className="group relative bg-[#C73E1D] hover:bg-[#d4552f] text-[#F0EDE5] font-semibold py-4 px-14 rounded-full transition-all duration-500 text-lg animate-shu-glow"
            >
              無料ではじめる
            </Link>
            <span className="text-xs text-[#A8A49C]/40 tracking-wide">
              クレジットカード不要
            </span>
          </div>
        </div>
      </section>

      {/* ─── Marquee ─── */}
      <section className="py-10 border-y border-[#F0EDE5]/[0.03] overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap">
          {[...useCases, ...useCases].map((item, i) => (
            <span
              key={i}
              className="mx-3 px-5 py-2 glass rounded-full text-sm text-[#A8A49C]/60 shrink-0"
            >
              {item}
            </span>
          ))}
        </div>
      </section>

      {/* ─── 3 ステップ ─── */}
      <section className="py-48 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-28">
            <p className="text-[#C9A96E]/60 text-xs tracking-[0.5em] mb-6 font-serif-jp">
              使い方
            </p>
            <h2 className="text-3xl sm:text-5xl font-bold font-serif-jp tracking-tight">
              かんたん3ステップ
            </h2>
            <p className="mt-6 text-[#A8A49C]/60 text-lg">
              むずかしい知識は必要ありません。
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <StepCard
              num="01"
              title="AIを選ぶ"
              description="使いたいAIを選びます。おすすめも表示されるので迷いません。"
            />
            <StepCard
              num="02"
              title="LINEとつなげる"
              description="ふだん使っているLINEと連携します。画面の案内どおりに進むだけ。"
            />
            <StepCard
              num="03"
              title="完成！"
              description="ボタンを押したら準備完了。LINEからAIに話しかけてみましょう。"
            />
          </div>
        </div>
      </section>

      {/* ─── 特徴 ─── */}
      <section className="py-48 px-6 relative">
        <div className="absolute inset-0 seigaiha" />
        <div className="relative max-w-4xl mx-auto">
          <div className="text-center mb-28">
            <p className="text-[#C9A96E]/60 text-xs tracking-[0.5em] mb-6 font-serif-jp">
              特徴
            </p>
            <h2 className="text-3xl sm:text-5xl font-bold font-serif-jp tracking-tight">
              選ばれる理由
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FeatureCard
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              }
              title="かんたん設定"
              description="サーバーやプログラミングの知識は不要。画面の案内に従うだけで、すぐ使えます。"
            />
            <FeatureCard
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                </svg>
              }
              title="すべて日本語"
              description="画面も説明もすべて日本語。英語がわからなくても大丈夫です。"
            />
            <FeatureCard
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              }
              title="あんしん・安全"
              description="あなたの情報はしっかり守られます。第三者に渡ることはありません。"
            />
            <FeatureCard
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              title="無料ではじめられる"
              description="EasyClawの利用は無料。まずはお試しで気軽にはじめられます。"
            />
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-48 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl sm:text-5xl font-bold font-serif-jp tracking-tight leading-snug">
            まずは、
            <br />
            <span className="text-[#C73E1D]">無料</span>で試してみませんか？
          </h2>
          <div className="mt-8 h-px w-12 mx-auto bg-gradient-to-r from-transparent via-[#C9A96E]/30 to-transparent" />
          <p className="mt-8 text-[#A8A49C]/60 text-lg leading-relaxed">
            アカウント登録は30秒。
            <br />
            いつでもかんたんに解約できます。
          </p>
          <Link
            href="/login"
            className="inline-block mt-12 bg-[#C73E1D] hover:bg-[#d4552f] text-[#F0EDE5] font-semibold py-4 px-14 rounded-full transition-all duration-500 text-lg"
          >
            無料ではじめる
          </Link>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-[#F0EDE5]/[0.03] py-14 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-sm text-[#A8A49C]/30">
          <div className="flex items-center gap-3">
            <div className="shuin text-[8px]" style={{ width: "1.2rem", height: "1.2rem", borderWidth: "1px" }}>
              易
            </div>
            <span className="font-serif-jp tracking-widest">EasyClaw</span>
          </div>
          <p>&copy; {new Date().getFullYear()} EasyClaw</p>
        </div>
      </footer>
    </div>
  );
}

/* ─── コンポーネント ─── */

function StepCard({
  num,
  title,
  description,
}: {
  num: string;
  title: string;
  description: string;
}) {
  return (
    <div className="group glass rounded-2xl p-10 hover:bg-[#F0EDE5]/[0.05] transition-all duration-700 text-center">
      {/* ナンバー */}
      <span className="text-[#C9A96E]/30 text-xs tracking-[0.3em] font-serif-jp">
        {num}
      </span>

      <h3 className="text-xl font-bold mt-4 mb-4 font-serif-jp tracking-wide">
        {title}
      </h3>
      <p className="text-[#A8A49C]/60 leading-[1.9] text-sm">
        {description}
      </p>
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
    <div className="group glass rounded-2xl p-10 hover:bg-[#F0EDE5]/[0.05] transition-all duration-700">
      <div className="w-10 h-10 rounded-full bg-[#F0EDE5]/[0.04] border border-[#F0EDE5]/[0.06] flex items-center justify-center text-[#C9A96E]/70 mb-6">
        {icon}
      </div>
      <h3 className="text-lg font-bold mb-3 font-serif-jp tracking-wide">
        {title}
      </h3>
      <p className="text-[#A8A49C]/60 leading-[1.9] text-sm">
        {description}
      </p>
    </div>
  );
}
