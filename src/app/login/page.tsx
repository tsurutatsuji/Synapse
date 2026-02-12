"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = () => {
    // TODO: Clerk or Supabase Auth の Google OAuth に置き換え
    setLoading(true);
    setTimeout(() => {
      localStorage.setItem("easyclaw_user", JSON.stringify({ provider: "google", email: "user@gmail.com" }));
      router.push("/dashboard");
    }, 500);
  };

  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    // TODO: Clerk or Supabase Auth のメール認証に置き換え
    setLoading(true);
    setTimeout(() => {
      localStorage.setItem("easyclaw_user", JSON.stringify({ provider: "email", email }));
      router.push("/dashboard");
    }, 500);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link href="/" className="text-sm text-blue-600 hover:underline">
            &larr; トップに戻る
          </Link>
          <h1 className="mt-4 text-3xl font-bold text-slate-900">
            ログイン
          </h1>
          <p className="mt-2 text-slate-500">
            アカウントを作成またはログインしてください
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 space-y-6">
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white border border-slate-300 rounded-lg py-3 px-4 text-slate-700 font-medium hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Googleでログイン
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-slate-400">または</span>
            </div>
          </div>

          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                メールアドレス
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full border border-slate-300 rounded-lg py-3 px-4 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? "処理中..." : "メールで登録・ログイン"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-400">
          ※ 現在はデモモードです。本番環境では Clerk または Supabase Auth を使用します。
        </p>
      </div>
    </div>
  );
}
