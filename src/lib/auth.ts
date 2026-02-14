import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "./prisma-adapter";
import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
  // アダプタは Google OAuth 用（Credentials とは別管理）
  adapter: PrismaAdapter(prisma),
  providers: [
    // Google OAuth（環境変数がある場合のみ有効）
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
    // メールログイン（デモ / 開発用）
    CredentialsProvider({
      name: "メールアドレス",
      credentials: {
        email: { label: "メールアドレス", type: "email" },
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;
        const email = credentials.email.trim().toLowerCase();
        if (!email) return null;

        try {
          // ユーザーがいなければ作成
          let user = await prisma.user.findUnique({ where: { email } });
          if (!user) {
            user = await prisma.user.create({ data: { email } });
          }
          return { id: user.id, email: user.email, name: user.name ?? email };
        } catch (e) {
          console.error("[auth] authorize error:", e);
          return null;
        }
      },
    }),
  ],
  // JWT を使う（CredentialsProvider はDB session と互換性がないため必須）
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account }) {
      // CredentialsProvider の場合、authorize が user を返せば OK
      if (account?.provider === "credentials") {
        return !!user;
      }
      return true;
    },
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
