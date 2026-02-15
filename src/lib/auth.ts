import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

// ビルド時ではなく、ランタイムでのみチェック（next build は NODE_ENV=production で実行される）
if (
  typeof globalThis !== "undefined" &&
  !process.env.NEXT_PHASE &&
  process.env.NODE_ENV === "production" &&
  (!process.env.NEXTAUTH_SECRET || process.env.NEXTAUTH_SECRET === "change-me-in-production")
) {
  throw new Error(
    "NEXTAUTH_SECRET が未設定またはデフォルト値のままです。" +
    "`openssl rand -hex 32` で生成した安全な値を設定してください。"
  );
}

export const authOptions: NextAuthOptions = {
  providers: [
    // Google OAuth のみ（メールだけのログインは安全ではないため削除）
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            authorization: {
              params: {
                prompt: "select_account",
                access_type: "offline",
                response_type: "code",
              },
            },
          }),
        ]
      : []),
  ],
  session: {
    strategy: "jwt",
    // セッションの有効期限を 24 時間に制限
    maxAge: 24 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        (session.user as { id?: string }).id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};
