import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ログイン",
  description:
    "EasyClawにログインして、あなた専用のAIアシスタントをセットアップしましょう。",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
