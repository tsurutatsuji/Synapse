import Link from "next/link";
import Image from "next/image";
import SnsShareButtons from "@/components/SnsShareButtons";

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

const pains = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    text: "LINEで使えるAIが欲しいけど、作り方がわからない",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    text: "むずかしい設定や英語の画面は使いたくない",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
      </svg>
    ),
    text: "全部日本語で説明してほしい",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    text: "個人情報やパスワードがちゃんと守られるか心配",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    text: "お金をかけずに試してみたい",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
    text: "いつも使っているLINEで気軽に使いたい",
  },
];

const benefits = [
  {
    title: "画面どおりで、すぐ起動",
    description: "画面の案内に従うだけ。プログラミングもむずかしい知識もいりません。",
    highlight: "すぐ使える",
  },
  {
    title: "0円から、リスクなし",
    description: "無料のAIが最初から使えます。お金は一切かかりません。気に入ったらアップグレード。",
    highlight: "¥0スタート",
  },
  {
    title: "LINEでそのまま操作",
    description: "いつものLINEに話しかけるだけ。新しいアプリのダウンロードは不要です。",
    highlight: "LINE対応",
  },
  {
    title: "あなたの情報を安全に守る",
    description: "パスワードやAPIキーは暗号化して保存。外部に漏れない仕組みが最初から入っています。",
    highlight: "安心安全",
  },
  {
    title: "24時間あなたの代わりに",
    description: "一度つくれば、あなたが寝ている間もAIボットがLINEで対応してくれます。",
    highlight: "24時間対応",
  },
  {
    title: "日本の生活に直結するスキル",
    description: "楽天・Amazon価格比較、レシート読み取り、翻訳、確定申告サポートなど。",
    highlight: "日本特化",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#F0EDE5] washi-texture">
      {/* ─── Navigation ─── */}
      <nav className="fixed top-0 w-full z-50 bg-[#0a0a0a]/60 backdrop-blur-2xl border-b border-[#F0EDE5]/[0.04]">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="EasyClaw" width={36} height={36} className="drop-shadow-lg" />
            <span className="text-lg font-bold tracking-widest font-serif-jp">
              EasyClaw
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/pricing" className="hidden sm:block text-sm text-[#A8A49C]/50 hover:text-[#F0EDE5] transition-all duration-500">
              料金
            </Link>
            <Link href="/skills" className="hidden sm:block text-sm text-[#A8A49C]/50 hover:text-[#F0EDE5] transition-all duration-500">
              できること
            </Link>
            <Link href="/guide" className="hidden sm:block text-sm text-[#A8A49C]/50 hover:text-[#F0EDE5] transition-all duration-500">
              使い方ガイド
            </Link>
            <Link
              href="/login"
              className="text-[#A8A49C] hover:text-[#F0EDE5] text-sm py-2 px-5 rounded-full transition-all duration-500 border border-[#F0EDE5]/[0.06] hover:border-[#F0EDE5]/[0.15] hover:bg-[#F0EDE5]/[0.04]"
            >
              ログイン
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── Hero ─── */}
      <section className="relative pt-52 pb-48 px-6 overflow-hidden">
        <div className="absolute inset-0 asanoha" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[#1B4965]/[0.06] rounded-full blur-[250px]" />
        <div className="absolute top-60 left-1/4 w-[300px] h-[300px] bg-[#C73E1D]/[0.03] rounded-full blur-[200px]" />

        <div className="relative max-w-5xl mx-auto flex flex-col items-center">
          <div className="hidden lg:block absolute -left-16 top-8 tategaki text-[#C9A96E]/[0.12] text-sm tracking-[1em] select-none font-serif-jp">
            誰でも使える
          </div>

          <div className="inline-flex items-center gap-2 glass rounded-full px-5 py-2 mb-16 text-xs text-[#A8A49C] tracking-widest">
            <span className="w-1.5 h-1.5 bg-[#C9A96E] rounded-full" />
            無料ではじめられる
          </div>

          <h1 className="text-center font-serif-jp">
            <span className="block text-5xl sm:text-7xl lg:text-[5.5rem] font-bold tracking-tight leading-[1.1]">
              LINEで使える
            </span>
            <span className="block text-5xl sm:text-7xl lg:text-[5.5rem] font-bold tracking-tight leading-[1.1] mt-2">
              <span className="text-[#C73E1D]">AIアシスタント</span>を
            </span>
            <span className="block text-5xl sm:text-7xl lg:text-[5.5rem] font-bold tracking-tight leading-[1.1] mt-2">
              かんたんに。
            </span>
          </h1>

          <div className="mt-10 h-px w-12 bg-gradient-to-r from-transparent via-[#C9A96E]/40 to-transparent" />

          <p className="mt-10 text-lg sm:text-xl text-[#A8A49C]/80 max-w-lg mx-auto leading-[2] text-center">
            むずかしい知識は一切不要。
            <br />
            画面に従うだけで、
            <span className="text-[#F0EDE5]">
              あなただけのAIボット
            </span>
            が
            <br />
            LINEで動き出します。
          </p>

          <div className="mt-16 flex flex-col items-center gap-4">
            <Link
              href="/login"
              className="group relative bg-[#C73E1D] hover:bg-[#d4552f] text-[#F0EDE5] font-semibold py-4 px-14 rounded-full transition-all duration-500 text-lg animate-shu-glow"
            >
              いますぐ無料で始める
            </Link>
            <span className="text-xs text-[#A8A49C]/40 tracking-wide">
              クレジットカード不要・登録は30秒
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

      {/* ─── EasyClawとは ─── */}
      <section className="py-32 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[#C9A96E]/60 text-xs tracking-[0.5em] mb-6 font-serif-jp">
              EasyClawとは
            </p>
            <h2 className="text-3xl sm:text-5xl font-bold font-serif-jp tracking-tight">
              AIボットを、<br className="sm:hidden" />誰でもつくれる
            </h2>
          </div>

          <div className="glass rounded-2xl p-10 space-y-6 text-center">
            <p className="text-[#A8A49C]/70 leading-[2] text-base">
              EasyClawは、<span className="text-[#F0EDE5] font-bold">LINEで使えるAIアシスタント</span>を
              かんたんに作れるサービスです。
            </p>
            <p className="text-[#A8A49C]/70 leading-[2] text-base">
              ChatGPTのように賢いAIが、
              あなたのLINEのお友だちとして動きます。
              <br />
              質問に答えたり、文章を書いたり、翻訳したり。
            </p>
            <div className="h-px w-16 mx-auto bg-gradient-to-r from-transparent via-[#C9A96E]/20 to-transparent" />
            <p className="text-sm text-[#A8A49C]/50 leading-relaxed">
              技術的には<a href="https://github.com/anthropics/openclaw" target="_blank" rel="noopener noreferrer" className="text-[#C9A96E] underline decoration-[#C9A96E]/30">OpenClaw</a>というオープンソースのAIを使っています。
              <br />
              EasyClawはその面倒な設定を全部自動でやってくれるサービスです。
            </p>
          </div>
        </div>
      </section>

      {/* ─── こんな悩みありませんか？ ─── */}
      <section className="py-48 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-20">
            <p className="text-[#C9A96E]/60 text-xs tracking-[0.5em] mb-6 font-serif-jp">
              お悩み
            </p>
            <h2 className="text-3xl sm:text-5xl font-bold font-serif-jp tracking-tight">
              こんな悩み、<br className="sm:hidden" />ありませんか？
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {pains.map((pain, i) => (
              <div
                key={i}
                className="glass rounded-2xl p-6 flex items-start gap-4 hover:bg-[#F0EDE5]/[0.03] transition-all duration-500"
              >
                <div className="w-10 h-10 rounded-full bg-[#C73E1D]/5 border border-[#C73E1D]/10 flex items-center justify-center text-[#C73E1D]/60 shrink-0">
                  {pain.icon}
                </div>
                <p className="text-sm text-[#A8A49C]/70 leading-relaxed pt-2">
                  {pain.text}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center mt-16">
            <p className="text-lg text-[#C9A96E]/60 font-serif-jp">
              EasyClawなら、<span className="text-[#C9A96E]">ぜんぶ</span>解決します。
            </p>
          </div>
        </div>
      </section>

      {/* ─── メリット ─── */}
      <section className="py-48 px-6 relative">
        <div className="absolute inset-0 seigaiha" />
        <div className="relative max-w-4xl mx-auto">
          <div className="text-center mb-20">
            <p className="text-[#C9A96E]/60 text-xs tracking-[0.5em] mb-6 font-serif-jp">
              メリット
            </p>
            <h2 className="text-3xl sm:text-5xl font-bold font-serif-jp tracking-tight">
              選ばれる<br className="sm:hidden" />6つの理由
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {benefits.map((benefit) => (
              <div
                key={benefit.title}
                className="glass rounded-2xl p-8 hover:bg-[#F0EDE5]/[0.05] transition-all duration-700"
              >
                <span className="inline-block text-xs px-3 py-1 rounded-full bg-[#C73E1D]/10 text-[#C73E1D] border border-[#C73E1D]/20 mb-5">
                  {benefit.highlight}
                </span>
                <h3 className="text-lg font-bold mb-3 font-serif-jp tracking-wide">
                  {benefit.title}
                </h3>
                <p className="text-[#A8A49C]/60 leading-[1.9] text-sm">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
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
              description="無料のAIがおすすめ。選ぶだけ、1秒で終わります。"
            />
            <StepCard
              num="02"
              title="LINEとつなげる"
              description="画面の案内どおりに進めるだけ。コピー＆ペーストで完了します。"
            />
            <StepCard
              num="03"
              title="ボタンを押す"
              description="「AIボットを起動する」ボタンを押すだけ。LINEに話しかけてみてください。"
            />
          </div>
        </div>
      </section>

      {/* ─── 料金プラン概要 ─── */}
      <section className="py-48 px-6 relative">
        <div className="absolute inset-0 seigaiha" />
        <div className="relative max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[#C9A96E]/60 text-xs tracking-[0.5em] mb-6 font-serif-jp">
              料金
            </p>
            <h2 className="text-3xl sm:text-5xl font-bold font-serif-jp tracking-tight">
              0円からはじめる
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="glass rounded-2xl p-8 text-center">
              <h3 className="text-xl font-bold font-serif-jp mb-2">フリー</h3>
              <p className="text-4xl font-bold mb-1">¥0</p>
              <p className="text-xs text-[#A8A49C]/40 mb-6">永久無料</p>
              <ul className="space-y-2 text-sm text-[#A8A49C]/60 text-left">
                <li className="flex items-center gap-2">
                  <span className="text-[#C9A96E]">&#10003;</span> 1日50メッセージ
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#C9A96E]">&#10003;</span> 無料AI（Gemini Flash）
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#C9A96E]">&#10003;</span> LINE連携
                </li>
              </ul>
            </div>
            <div className="glass rounded-2xl p-8 text-center relative">
              <h3 className="text-xl font-bold font-serif-jp mb-2">プレミアム</h3>
              <p className="text-4xl font-bold mb-1">¥1,980</p>
              <p className="text-xs text-[#A8A49C]/40 mb-6">/ 月</p>
              <ul className="space-y-2 text-sm text-[#A8A49C]/60 text-left">
                <li className="flex items-center gap-2">
                  <span className="text-[#C9A96E]">&#10003;</span> メッセージ無制限
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#C9A96E]">&#10003;</span> より賢いAI（Claude / GPT）
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#C9A96E]">&#10003;</span> 日本向け便利機能つき
                </li>
              </ul>
            </div>
          </div>

          <div className="text-center mt-8">
            <Link href="/pricing" className="text-sm text-[#C73E1D] hover:text-[#d4552f] transition-all duration-500">
              プランの詳細を見る →
            </Link>
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-48 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl sm:text-5xl font-bold font-serif-jp tracking-tight leading-snug">
            あなたのAIボットが、
            <br />
            <span className="text-[#C73E1D]">今日</span>動き出す。
          </h2>
          <div className="mt-8 h-px w-12 mx-auto bg-gradient-to-r from-transparent via-[#C9A96E]/30 to-transparent" />
          <p className="mt-8 text-[#A8A49C]/60 text-lg leading-relaxed">
            登録は30秒。クレジットカード不要。
            <br />
            無料のAIで、すぐに試せます。
          </p>
          <Link
            href="/login"
            className="inline-block mt-12 bg-[#C73E1D] hover:bg-[#d4552f] text-[#F0EDE5] font-semibold py-4 px-14 rounded-full transition-all duration-500 text-lg"
          >
            いますぐ無料で始める
          </Link>

          <div className="mt-16 flex flex-col items-center gap-3">
            <p className="text-xs text-[#A8A49C]/30">
              友だちにも教えてあげませんか？
            </p>
            <SnsShareButtons />
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-[#F0EDE5]/[0.03] py-14 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 text-sm text-[#A8A49C]/30">
            <div className="flex items-center gap-2">
              <Image src="/logo.png" alt="EasyClaw" width={24} height={24} />
              <span className="font-serif-jp tracking-widest">EasyClaw</span>
            </div>
            <div className="flex items-center gap-6">
              <Link href="/pricing" className="hover:text-[#F0EDE5]/60 transition-all duration-500">料金</Link>
              <Link href="/skills" className="hover:text-[#F0EDE5]/60 transition-all duration-500">できること</Link>
              <Link href="/guide" className="hover:text-[#F0EDE5]/60 transition-all duration-500">使い方ガイド</Link>
            </div>
          </div>
          <div className="mt-8 flex flex-col items-center gap-4">
            <SnsShareButtons />
            <p className="text-xs text-[#A8A49C]/20">
              &copy; {new Date().getFullYear()} EasyClaw
            </p>
          </div>
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
