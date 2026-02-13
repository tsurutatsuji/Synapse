import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "VPS比較ガイド",
  description:
    "XServer・ConoHa・さくらなど、日本のVPSを月額・スペック・使いやすさで徹底比較。AI運用に最適な1台が見つかります。",
  openGraph: {
    title: "VPS比較ガイド | EasyClaw",
    description:
      "日本のVPSを月額・スペック・使いやすさで徹底比較。AI運用に最適な1台が見つかります。",
  },
};

const vpsProviders = [
  {
    name: "XServer VPS",
    price: "月額 830円〜",
    freeTrial: "10日間無料",
    specs: "2GB RAM / 3vCPU / 50GB SSD",
    pros: ["国内最速クラス", "10日間無料お試し", "日本語サポート充実"],
    url: "https://www.xserver.ne.jp/vps/",
    recommended: true,
    badge: "おすすめ",
  },
  {
    name: "ConoHa VPS",
    price: "月額 751円〜",
    freeTrial: "なし（時間課金あり）",
    specs: "1GB RAM / 2vCPU / 100GB SSD",
    pros: ["時間課金で無駄なし", "かんたん操作パネル", "学割あり"],
    url: "https://www.conoha.jp/vps/",
    recommended: false,
    badge: "コスパ◎",
  },
  {
    name: "さくらの VPS",
    price: "月額 643円〜",
    freeTrial: "2週間無料",
    specs: "512MB RAM / 1vCPU / 25GB SSD",
    pros: ["2週間無料お試し", "老舗の安定感", "豊富なドキュメント"],
    url: "https://vps.sakura.ad.jp/",
    recommended: false,
    badge: "安定",
  },
  {
    name: "カゴヤ CLOUD VPS",
    price: "月額 550円〜",
    freeTrial: "なし",
    specs: "1GB RAM / 1vCPU / 25GB SSD",
    pros: ["業界最安クラス", "日額課金対応", "京都データセンター"],
    url: "https://www.kagoya.jp/cloud/vps/",
    recommended: false,
    badge: "最安",
  },
];

const localOptions = [
  {
    name: "ローカル（Mac / Windows）",
    price: "無料",
    description: "お使いのパソコンで直接動かします。費用はかかりませんが、パソコンを閉じるとAIも止まります。",
    steps: [
      "ターミナル（Mac）またはPowerShell（Windows）を開く",
      "EasyClawダッシュボードの手順に従ってセットアップ",
      "npm run start で起動",
    ],
  },
  {
    name: "WSL2（Windows）",
    description: "WindowsでLinux環境を動かす方法です。無料でVPSに近い体験ができます。",
    price: "無料",
    steps: [
      "PowerShellを管理者で開き: wsl --install",
      "再起動後、Ubuntuを起動",
      "EasyClawダッシュボードの手順に従ってセットアップ",
    ],
  },
];

export default function VpsGuidePage() {
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
          <p className="text-[#C9A96E]/50 text-xs tracking-[0.5em] mb-4 font-serif-jp">サーバー選び</p>
          <h1 className="text-3xl sm:text-4xl font-bold font-serif-jp tracking-tight">
            VPS比較ガイド
          </h1>
          <p className="text-[#A8A49C]/50 mt-4 text-sm max-w-md mx-auto leading-relaxed">
            AIを24時間動かすにはサーバー（VPS）が必要です。<br />
            まずは無料のローカル環境で試して、本格利用にはVPSがおすすめです。
          </p>
        </div>

        {/* ─── VPS 比較表 ─── */}
        <section className="mb-24">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 rounded-full bg-[#C73E1D]/10 border border-[#C73E1D]/20 flex items-center justify-center">
              <svg className="w-4 h-4 text-[#C73E1D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2" />
              </svg>
            </div>
            <h2 className="text-xl font-bold font-serif-jp">VPSプロバイダー比較</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {vpsProviders.map((vps) => (
              <div
                key={vps.name}
                className={`glass rounded-2xl p-8 hover:bg-[#F0EDE5]/[0.03] transition-all duration-500 relative ${
                  vps.recommended ? "ring-1 ring-[#C73E1D]/30" : ""
                }`}
              >
                {/* Badge */}
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-xs px-3 py-1 rounded-full ${
                    vps.recommended
                      ? "bg-[#C73E1D]/10 text-[#C73E1D] border border-[#C73E1D]/20"
                      : "bg-[#C9A96E]/10 text-[#C9A96E]/70 border border-[#C9A96E]/20"
                  }`}>
                    {vps.badge}
                  </span>
                  {vps.freeTrial !== "なし" && vps.freeTrial !== "なし（時間課金あり）" && (
                    <span className="text-xs text-[#06C755]">{vps.freeTrial}</span>
                  )}
                </div>

                <h3 className="text-lg font-bold font-serif-jp mb-2">{vps.name}</h3>
                <p className="text-2xl font-bold text-[#C9A96E] mb-1">{vps.price}</p>
                <p className="text-xs text-[#A8A49C]/40 mb-5">{vps.specs}</p>

                <ul className="space-y-2 mb-6">
                  {vps.pros.map((pro) => (
                    <li key={pro} className="flex items-center gap-2 text-sm text-[#A8A49C]/60">
                      <svg className="w-3.5 h-3.5 text-[#C9A96E]/60 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {pro}
                    </li>
                  ))}
                </ul>

                <a
                  href={vps.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`block text-center py-3 rounded-full text-sm font-semibold transition-all duration-500 ${
                    vps.recommended
                      ? "bg-[#C73E1D] hover:bg-[#d4552f] text-[#F0EDE5]"
                      : "border border-[#F0EDE5]/[0.08] hover:border-[#F0EDE5]/[0.15] text-[#A8A49C] hover:text-[#F0EDE5]"
                  }`}
                >
                  公式サイトを見る →
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* ─── ローカル / WSL2 ─── */}
        <section className="mb-24">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 rounded-full bg-[#C9A96E]/10 border border-[#C9A96E]/20 flex items-center justify-center">
              <svg className="w-4 h-4 text-[#C9A96E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold font-serif-jp">無料で試す（ローカル環境）</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {localOptions.map((opt) => (
              <div key={opt.name} className="glass rounded-2xl p-8 hover:bg-[#F0EDE5]/[0.03] transition-all duration-500">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs px-3 py-1 rounded-full bg-[#06C755]/10 text-[#06C755] border border-[#06C755]/20">
                    無料
                  </span>
                </div>
                <h3 className="text-lg font-bold font-serif-jp mb-2">{opt.name}</h3>
                <p className="text-sm text-[#A8A49C]/50 mb-5 leading-relaxed">{opt.description}</p>

                <div className="space-y-3">
                  {opt.steps.map((step, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="shrink-0 w-5 h-5 rounded-full bg-[#C9A96E]/10 border border-[#C9A96E]/20 flex items-center justify-center text-[10px] text-[#C9A96E]/60 mt-0.5">
                        {i + 1}
                      </span>
                      <p className="text-sm text-[#A8A49C]/60">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── 判断フロー ─── */}
        <section className="mb-20">
          <div className="glass rounded-2xl p-8 sm:p-10">
            <h3 className="text-lg font-bold font-serif-jp mb-6">どれを選べばいい？</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 rounded-xl bg-[#F0EDE5]/[0.02]">
                <span className="text-lg">🔰</span>
                <div>
                  <p className="font-bold text-sm mb-1">まずは試したい → ローカル（無料）</p>
                  <p className="text-xs text-[#A8A49C]/40">お使いのパソコンで無料で試せます。パソコンを閉じるとAIも止まります。</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 rounded-xl bg-[#F0EDE5]/[0.02]">
                <span className="text-lg">🏠</span>
                <div>
                  <p className="font-bold text-sm mb-1">24時間使いたい → VPS</p>
                  <p className="text-xs text-[#A8A49C]/40">月額600〜900円で、寝ている間もAIが動き続けます。LINEでいつでも使えます。</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 rounded-xl bg-[#F0EDE5]/[0.02]">
                <span className="text-lg">⭐</span>
                <div>
                  <p className="font-bold text-sm mb-1">迷ったら → XServer VPS</p>
                  <p className="text-xs text-[#A8A49C]/40">10日間無料で試せて、速度も安定性も国内トップクラスです。</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <div className="text-center">
          <Link href="/dashboard" className="inline-block bg-[#C73E1D] hover:bg-[#d4552f] text-[#F0EDE5] font-semibold py-3.5 px-10 rounded-full transition-all duration-500">
            セットアップに進む
          </Link>
        </div>
      </main>
    </div>
  );
}
