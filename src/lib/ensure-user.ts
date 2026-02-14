import { prisma } from "@/lib/prisma";

/**
 * JWT認証ではDBにユーザーレコードが自動作成されない。
 * API呼び出し時にユーザーが存在しなければ作成する。
 */
export async function ensureUser(email: string) {
  let user = await prisma.user.findUnique({
    where: { email },
    include: { config: true, subscription: true },
  });

  if (user) return user;

  try {
    return await prisma.user.create({
      data: { email, name: email },
      include: { config: true, subscription: true },
    });
  } catch {
    // レース条件: 別リクエストが先に作成した場合
    user = await prisma.user.findUnique({
      where: { email },
      include: { config: true, subscription: true },
    });
    if (user) return user;
    throw new Error("ユーザーの作成に失敗しました");
  }
}
