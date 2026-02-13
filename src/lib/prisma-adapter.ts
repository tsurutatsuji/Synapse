import { Adapter, AdapterAccount, AdapterSession, AdapterUser, VerificationToken } from "next-auth/adapters";
import { PrismaClient } from "@prisma/client";

export function PrismaAdapter(prisma: PrismaClient): Adapter {
  return {
    async createUser(data: Omit<AdapterUser, "id">) {
      const user = await prisma.user.create({
        data: {
          email: data.email,
          name: data.name ?? null,
          emailVerified: data.emailVerified ?? null,
          image: data.image ?? null,
        },
      });
      return { ...user, emailVerified: user.emailVerified } as AdapterUser;
    },

    async getUser(id: string) {
      const user = await prisma.user.findUnique({ where: { id } });
      if (!user) return null;
      return { ...user, emailVerified: user.emailVerified } as AdapterUser;
    },

    async getUserByEmail(email: string) {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) return null;
      return { ...user, emailVerified: user.emailVerified } as AdapterUser;
    },

    async getUserByAccount({ providerAccountId, provider }: Pick<AdapterAccount, "provider" | "providerAccountId">) {
      const account = await prisma.account.findUnique({
        where: { provider_providerAccountId: { provider, providerAccountId } },
        include: { user: true },
      });
      if (!account) return null;
      return { ...account.user, emailVerified: account.user.emailVerified } as AdapterUser;
    },

    async updateUser(data: Partial<AdapterUser> & Pick<AdapterUser, "id">) {
      const user = await prisma.user.update({
        where: { id: data.id },
        data: {
          name: data.name ?? undefined,
          email: data.email ?? undefined,
          emailVerified: data.emailVerified ?? undefined,
          image: data.image ?? undefined,
        },
      });
      return { ...user, emailVerified: user.emailVerified } as AdapterUser;
    },

    async deleteUser(id: string) {
      await prisma.user.delete({ where: { id } });
    },

    async linkAccount(data: AdapterAccount) {
      await prisma.account.create({
        data: {
          userId: data.userId,
          type: data.type,
          provider: data.provider,
          providerAccountId: data.providerAccountId,
          refresh_token: data.refresh_token ?? null,
          access_token: data.access_token ?? null,
          expires_at: data.expires_at ?? null,
          token_type: data.token_type ?? null,
          scope: data.scope ?? null,
          id_token: data.id_token ?? null,
          session_state: data.session_state as string ?? null,
        },
      });
    },

    async unlinkAccount({ providerAccountId, provider }: Pick<AdapterAccount, "provider" | "providerAccountId">) {
      await prisma.account.delete({
        where: { provider_providerAccountId: { provider, providerAccountId } },
      });
    },

    async createSession(data: { sessionToken: string; userId: string; expires: Date }) {
      const session = await prisma.session.create({ data });
      return session as AdapterSession;
    },

    async getSessionAndUser(sessionToken: string) {
      const session = await prisma.session.findUnique({
        where: { sessionToken },
        include: { user: true },
      });
      if (!session) return null;
      return {
        session: session as AdapterSession,
        user: { ...session.user, emailVerified: session.user.emailVerified } as AdapterUser,
      };
    },

    async updateSession(data: Partial<AdapterSession> & Pick<AdapterSession, "sessionToken">) {
      const session = await prisma.session.update({
        where: { sessionToken: data.sessionToken },
        data: { expires: data.expires ?? undefined },
      });
      return session as AdapterSession;
    },

    async deleteSession(sessionToken: string) {
      await prisma.session.delete({ where: { sessionToken } });
    },

    async createVerificationToken(data: VerificationToken) {
      const token = await prisma.verificationToken.create({ data });
      return token;
    },

    async useVerificationToken({ identifier, token }: { identifier: string; token: string }) {
      try {
        const result = await prisma.verificationToken.delete({
          where: { identifier_token: { identifier, token } },
        });
        return result;
      } catch {
        return null;
      }
    },
  };
}
