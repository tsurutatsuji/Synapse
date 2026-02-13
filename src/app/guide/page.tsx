import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "LINE連携ガイド",
  description:
    "LINE Developersの設定からWebhook接続まで、画像つきでやさしく解説。はじめてでも迷いません。",
  openGraph: {
    title: "LINE連携ガイド | EasyClaw",
    description:
      "LINE Developersの設定からWebhook接続まで、画像つきでやさしく解説。",
  },
};

const steps = [
  {
    title: "LINE Developersにログイン",
    description: "Googleアカウントでかんたんにログインできます。",
    url: "https://developers.line.biz/",
    detail: "「ログイン」ボタンを押して、ふだん使っているGoogleアカウントでログインしてください。",
  },
  {
    title: "新しいプロバイダーを作る",
    description: "あなたのサービスの名前を入力します。",
    detail: "ログイン後、「プロバイダー」→「作成」をクリック。名前は何でもOKです（例：「マイAI」）。",
  },
  {
    title: "Messaging APIチャネルを作る",
    description: "LINEボットの「部屋」を作ります。",
    detail: "プロバイダーの中で「チャネル作成」→「Messaging API」を選びます。チャネル名（例：「AIアシスタント」）と説明を入力して作成。",
  },
  {
    title: "チャネルシークレットをコピー",
    description: "「チャネル基本設定」タブにあります。",
    detail: "作成したチャネルを開き、「チャネル基本設定」タブの下のほうにある「チャネルシークレット」をコピーしてください。",
  },
  {
    title: "アクセストークンを発行してコピー",
    description: "「Messaging API設定」タブにあります。",
    detail: "「Messaging API設定」タブの一番下にある「チャネルアクセストークン（長期）」の「発行」ボタンを押して、表示されたトークンをコピーしてください。",
  },
  {
    title: "EasyClawに貼り付ける",
    description: "コピーした2つをダッシュボードに貼り付けるだけ。",
    detail: "EasyClawのダッシュボードに戻って、「LINEのトークン」と「LINEのシークレット」にそれぞれ貼り付けてください。",
  },
  {
    title: "Webhook URLを設定",
    description: "AIを起動した後に表示されるURLを貼り付けます。",
    detail: "「Messaging API設定」タブの「Webhook URL」に、EasyClawで表示されるURLを貼り付けて「検証」→「利用」をオンにしてください。",
  },
];

export default function GuidePage() {
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
        <div className="text-center mb-20">
          <p className="text-[#C9A96E]/50 text-xs tracking-[0.5em] mb-4 font-serif-jp">ガイド</p>
          <h1 className="text-3xl font-bold font-serif-jp tracking-tight">LINE連携の手順</h1>
          <p className="text-[#A8A49C]/50 mt-4 text-sm">はじめてでも大丈夫。ひとつずつ進めましょう。</p>
        </div>

        {/* Steps */}
        <div className="space-y-6">
          {steps.map((step, i) => (
            <div key={i} className="glass rounded-2xl p-8 hover:bg-[#F0EDE5]/[0.03] transition-all duration-500">
              <div className="flex items-start gap-5">
                <span className="shrink-0 w-8 h-8 rounded-full bg-[#C9A96E]/10 border border-[#C9A96E]/20 flex items-center justify-center text-sm text-[#C9A96E]/60 font-serif-jp mt-0.5">
                  {i + 1}
                </span>
                <div>
                  <h3 className="text-lg font-bold font-serif-jp tracking-wide">{step.title}</h3>
                  <p className="text-sm text-[#C9A96E]/50 mt-1">{step.description}</p>
                  <p className="text-sm text-[#A8A49C]/50 mt-3 leading-[1.9]">{step.detail}</p>
                  {step.url && (
                    <a
                      href={step.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 mt-4 text-sm text-[#C73E1D] hover:text-[#d4552f] transition-all duration-500"
                    >
                      サイトを開く
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <Link href="/dashboard" className="inline-block bg-[#C73E1D] hover:bg-[#d4552f] text-[#F0EDE5] font-semibold py-3.5 px-10 rounded-full transition-all duration-500">
            ダッシュボードに戻る
          </Link>
        </div>
      </main>
    </div>
  );
}
