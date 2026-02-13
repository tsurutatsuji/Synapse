"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = () => {
    setLoading(true);
    setTimeout(() => {
      localStorage.setItem(
        "easyclaw_user",
        JSON.stringify({ provider: "google", email: "user@gmail.com" })
      );
      router.push("/dashboard");
    }, 500);
  };

  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setTimeout(() => {
      localStorage.setItem(
        "easyclaw_user",
        JSON.stringify({ provider: "email", email })
      );
      router.push("/dashboard");
    }, 500);
  };

  return (
    <div className="min-h-screen bg-[#141414] flex flex-col items-center justify-center px-4 relative overflow-hidden washi-texture">
      {/* 控えめな藍色の光 */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-[#1B4965]/10 rounded-full blur-[120px]" />

      <div className="relative w-full max-w-md space-y-8">
        {/* Back + Logo */}
        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-[#A8A49C] hover:text-[#C9A96E] transition-colors mb-10"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            トップに戻る
          </Link>
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-[#1B4965] rounded-lg flex items-center justify-center text-xl font-bold text-[#F0EDE5]">
              易
            </div>
          </div>
          <h1 className="text-3xl font-bold text-[#F0EDE5]">ログイン</h1>
          <p className="mt-3 text-[#A8A49C]">
            アカウントを作成またはログインしてください
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-[#1C1C1C]/60 border border-[#F0EDE5]/5 rounded-xl p-8 space-y-6">
          {/* Google */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-[#F0EDE5] text-[#1C1C1C] font-medium rounded-lg py-3.5 px-4 hover:bg-[#F0EDE5]/90 transition-colors disabled:opacity-50"
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

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#F0EDE5]/10" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-[#1C1C1C] text-[#A8A49C]">または</span>
            </div>
          </div>

          {/* Email */}
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-[#A8A49C] mb-2"
              >
                メールアドレス
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full bg-[#F0EDE5]/5 border border-[#F0EDE5]/10 rounded-lg py-3.5 px-4 text-[#F0EDE5] placeholder:text-[#A8A49C]/40 focus:outline-none focus:ring-2 focus:ring-[#1B4965] focus:border-transparent transition-all"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#C73E1D] hover:bg-[#d4552f] text-[#F0EDE5] font-semibold py-3.5 px-4 rounded-lg transition-all disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  処理中...
                </span>
              ) : (
                "メールで登録・ログイン"
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-[#A8A49C]/40">
          ※ 現在はデモモードです。本番環境では Clerk または Supabase Auth
          を使用します。
        </p>
      </div>
    </div>
  );
}
