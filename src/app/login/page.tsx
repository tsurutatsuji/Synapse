"use client";

import { Suspense, useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

type Tab = "login" | "signup";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const { status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialTab = searchParams.get("tab") === "signup" ? "signup" : "login";
  const [tab, setTab] = useState<Tab>(initialTab);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [googleAvailable, setGoogleAvailable] = useState(true);

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      await signIn("google", { callbackUrl: "/dashboard" });
    } catch {
      setError(
        "Googleログインは現在準備中です。メールアドレスでお試しください。"
      );
      setGoogleAvailable(false);
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email: trimmed,
      redirect: false,
    });

    if (result?.error) {
      setError(
        tab === "login"
          ? "ログインに失敗しました。メールアドレスを確認してください。"
          : "登録に失敗しました。もう一度お試しください。"
      );
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  const isLogin = tab === "login";

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[#1B4965]/[0.05] rounded-full blur-[200px]" />

      <div className="relative z-10 w-full max-w-sm space-y-8">
        {/* Back + Logo */}
        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-[#A8A49C]/60 hover:text-[#F0EDE5] transition-colors duration-300 mb-10"
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
                strokeWidth={1.5}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            トップにもどる
          </Link>
          <div className="flex items-center justify-center mb-4">
            <Image
              src="/logo.png"
              alt="EasyClaw"
              width={48}
              height={48}
              className="drop-shadow-lg"
            />
          </div>
          <h1 className="text-2xl font-bold text-[#F0EDE5] font-serif-jp tracking-wide">
            EasyClaw
          </h1>
          <p className="mt-2 text-sm text-[#A8A49C]/60">
            OpenClawをかんたんに、すぐ使える。
          </p>
        </div>

        {/* Tab Switch */}
        <div className="flex rounded-full bg-[#F0EDE5]/[0.04] border border-[#F0EDE5]/[0.06] p-1">
          <button
            type="button"
            onClick={() => {
              setTab("login");
              setError("");
            }}
            className={`flex-1 py-2.5 text-sm font-medium rounded-full transition-colors duration-300 ${
              isLogin
                ? "bg-[#F0EDE5]/[0.1] text-[#F0EDE5]"
                : "text-[#A8A49C]/50 hover:text-[#A8A49C]"
            }`}
          >
            ログイン
          </button>
          <button
            type="button"
            onClick={() => {
              setTab("signup");
              setError("");
            }}
            className={`flex-1 py-2.5 text-sm font-medium rounded-full transition-colors duration-300 ${
              !isLogin
                ? "bg-[#F0EDE5]/[0.1] text-[#F0EDE5]"
                : "text-[#A8A49C]/50 hover:text-[#A8A49C]"
            }`}
          >
            新規登録
          </button>
        </div>

        {/* Form Card */}
        <div className="glass-strong rounded-2xl p-8 space-y-6">
          {error && (
            <div className="rounded-xl p-3 bg-[#C73E1D]/10 border border-[#C73E1D]/20">
              <p className="text-sm text-[#C73E1D]">{error}</p>
            </div>
          )}

          {/* Google */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading || !googleAvailable}
            className="w-full flex items-center justify-center gap-3 bg-[#F0EDE5] text-[#0a0a0a] font-medium rounded-full py-3.5 px-4 hover:bg-[#F0EDE5]/90 transition-colors duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
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
            {isLogin ? "Googleでログイン" : "Googleで登録"}
          </button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#F0EDE5]/[0.06]" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 bg-[#151515] text-[#A8A49C]/40 text-xs tracking-widest">
                または
              </span>
            </div>
          </div>

          {/* Email */}
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm text-[#A8A49C]/60 mb-2"
              >
                メールアドレス
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full bg-[#F0EDE5]/[0.04] border border-[#F0EDE5]/[0.08] rounded-xl py-3.5 px-4 text-[#F0EDE5] placeholder:text-[#A8A49C]/25 focus:outline-none focus:ring-2 focus:ring-[#C9A96E]/30 focus:border-[#C9A96E]/30"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#C73E1D] hover:bg-[#d4552f] text-[#F0EDE5] font-semibold py-3.5 px-4 rounded-full transition-colors duration-300 disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4"
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
                  少々お待ちください...
                </span>
              ) : isLogin ? (
                "メールでログイン"
              ) : (
                "メールで無料登録"
              )}
            </button>
          </form>
        </div>

        {/* Bottom text */}
        <p className="text-center text-xs text-[#A8A49C]/30">
          {isLogin ? (
            <>
              アカウントをお持ちでない方は{" "}
              <button
                type="button"
                onClick={() => setTab("signup")}
                className="text-[#C9A96E]/60 hover:text-[#C9A96E] transition-colors duration-300"
              >
                新規登録
              </button>
            </>
          ) : (
            <>
              すでにアカウントをお持ちの方は{" "}
              <button
                type="button"
                onClick={() => setTab("login")}
                className="text-[#C9A96E]/60 hover:text-[#C9A96E] transition-colors duration-300"
              >
                ログイン
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
