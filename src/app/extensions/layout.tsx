import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "カスタムスキル",
  description:
    "AIに日本語で指示するだけで、あなただけのオリジナルスキルを自動生成。プレミアム限定機能。",
  openGraph: {
    title: "カスタムスキル | EasyClaw",
    description:
      "日本語で指示するだけで、オリジナルスキルを自動生成。",
  },
};

export default function ExtensionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
