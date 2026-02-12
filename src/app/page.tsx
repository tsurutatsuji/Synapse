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
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-sm font-bold">
              E
            </div>
            <span className="text-lg font-bold">EasyClaw</span>
          </div>
          <Link
            href="/login"
            className="bg-white/10 hover:bg-white/20 text-white text-sm font-medium py-2 px-5 rounded-full transition-all border border-white/10"
          >
            ログイン
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/50 via-transparent to-transparent" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px]" />

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 mb-8 text-sm text-indigo-300">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            日本語完全対応
          </div>

          <h1 className="text-5xl sm:text-7xl font-bold tracking-tight leading-tight">
            OpenClawを
            <br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              1分でデプロイ
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            モデルを選んで、Telegramを接続して、デプロイ。
            <br />
            サーバーもSSHも不要。技術知識ゼロでOK。
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login"
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3.5 px-8 rounded-full transition-all text-lg shadow-lg shadow-indigo-600/25 hover:shadow-indigo-500/40 animate-pulse-glow"
            >
              無料で始める
            </Link>
            <a
              href="https://github.com/openclaw/openclaw"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-white font-medium py-3.5 px-8 rounded-full transition-colors border border-white/10 hover:border-white/20"
            >
              GitHub を見る
            </a>
          </div>
        </div>
      </section>

      {/* Marquee - Use Cases */}
      <section className="py-12 border-y border-white/5 overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap">
          {[...useCases, ...useCases].map((item, i) => (
            <span
              key={i}
              className="mx-4 px-5 py-2 bg-white/5 border border-white/10 rounded-full text-sm text-slate-300 shrink-0"
            >
              {item}
            </span>
          ))}
        </div>
      </section>

      {/* 3 Steps */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold">
              たった
              <span className="text-indigo-400">3ステップ</span>
              で完了
            </h2>
            <p className="mt-4 text-slate-400 text-lg">
              面倒なサーバー設定は一切不要。画面の指示に従うだけ。
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <StepCard
              number="01"
              title="モデルを選ぶ"
              description="Claude、GPT-4など好きなAIモデルを選択。APIキーを入力するだけ。"
              gradient="from-blue-500 to-indigo-600"
            />
            <StepCard
              number="02"
              title="Telegramを接続"
              description="BotFatherでトークンを取得して貼り付け。30秒で完了。"
              gradient="from-indigo-500 to-purple-600"
            />
            <StepCard
              number="03"
              title="デプロイ"
              description="ボタンを押すだけ。あなた専用のAIアシスタントが24時間稼働開始。"
              gradient="from-purple-500 to-pink-600"
            />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6 bg-white/[0.02]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold">
              なぜ
              <span className="text-indigo-400">EasyClaw</span>
              ？
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <FeatureCard
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              }
              title="1分でセットアップ"
              description="サーバーの構築、SSH接続、環境構築。すべてスキップ。ボタンひとつで完了。"
            />
            <FeatureCard
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                </svg>
              }
              title="完全日本語対応"
              description="UIもドキュメントもすべて日本語。英語が読めなくても問題なし。"
            />
            <FeatureCard
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              }
              title="安全・セキュア"
              description="APIキーはブラウザから直接送信。サーバーに保存されることはありません。"
            />
            <FeatureCard
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              title="完全無料"
              description="EasyClawの利用料は無料。かかるのはAI APIの利用料だけ。"
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-gradient-to-br from-indigo-950/80 to-purple-950/80 border border-indigo-500/20 rounded-3xl p-12 sm:p-16 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-[80px]" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/10 rounded-full blur-[80px]" />
            <div className="relative">
              <h2 className="text-3xl sm:text-4xl font-bold">
                今すぐ始めよう
              </h2>
              <p className="mt-4 text-slate-400 text-lg">
                あなた専用のAIアシスタントを、たった1分で。
              </p>
              <Link
                href="/login"
                className="inline-block mt-8 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-4 px-10 rounded-full transition-all text-lg shadow-lg shadow-indigo-600/25"
              >
                無料で始める
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded flex items-center justify-center text-[10px] font-bold text-white">
              E
            </div>
            <span>EasyClaw</span>
          </div>
          <p>&copy; {new Date().getFullYear()} EasyClaw. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function StepCard({
  number,
  title,
  description,
  gradient,
}: {
  number: string;
  title: string;
  description: string;
  gradient: string;
}) {
  return (
    <div className="group relative bg-white/[0.03] border border-white/10 rounded-2xl p-8 hover:border-indigo-500/30 transition-all hover:bg-white/[0.05]">
      <div
        className={`inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br ${gradient} rounded-xl text-white font-bold text-lg mb-5`}
      >
        {number}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-slate-400 leading-relaxed">{description}</p>
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
    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-7 hover:border-indigo-500/30 transition-all hover:bg-white/[0.05]">
      <div className="w-11 h-11 bg-indigo-600/20 border border-indigo-500/30 rounded-xl flex items-center justify-center text-indigo-400 mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-bold mb-2">{title}</h3>
      <p className="text-slate-400 leading-relaxed text-sm">{description}</p>
    </div>
  );
}
