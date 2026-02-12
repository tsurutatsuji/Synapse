import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <main className="max-w-2xl w-full text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 tracking-tight">
            日本人向け OpenClaw
            <br />
            簡単スタート
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed">
            AIエージェントを使った自動化を、誰でも簡単に始められるダッシュボードです。
            <br />
            難しい設定は一切不要。画面の指示に従うだけでOK。
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <p className="text-blue-800 text-xl font-semibold">
            技術ゼロでも1分で始められます
          </p>
          <p className="text-blue-600 text-sm mt-2">
            必要なのはAPIキーとBotトークンだけ。あとはボタンを押すだけ。
          </p>
        </div>

        <Link
          href="/login"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white text-xl font-bold py-4 px-12 rounded-full transition-colors shadow-lg hover:shadow-xl"
        >
          今すぐ始める
        </Link>

        <div className="pt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
          <div className="bg-white rounded-lg p-5 shadow-sm border border-slate-200">
            <div className="text-2xl mb-2">1️⃣</div>
            <h3 className="font-bold text-slate-800">ログイン</h3>
            <p className="text-sm text-slate-500 mt-1">
              Googleアカウントまたはメールで簡単登録
            </p>
          </div>
          <div className="bg-white rounded-lg p-5 shadow-sm border border-slate-200">
            <div className="text-2xl mb-2">2️⃣</div>
            <h3 className="font-bold text-slate-800">キー入力</h3>
            <p className="text-sm text-slate-500 mt-1">
              Claude APIキーとTelegram Botトークンを入力
            </p>
          </div>
          <div className="bg-white rounded-lg p-5 shadow-sm border border-slate-200">
            <div className="text-2xl mb-2">3️⃣</div>
            <h3 className="font-bold text-slate-800">デプロイ</h3>
            <p className="text-sm text-slate-500 mt-1">
              ボタンひとつで自動セットアップ完了
            </p>
          </div>
        </div>
      </main>

      <footer className="mt-16 pb-8 text-center text-sm text-slate-400">
        OpenClaw 日本語ダッシュボード &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}
