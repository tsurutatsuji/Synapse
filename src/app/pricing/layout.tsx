import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "料金プラン",
  description:
    "EasyClawは0円から。フリープランでも1日50メッセージまでAIを使えます。プレミアムならメッセージ無制限＆Japan Skill Pack付き。",
  openGraph: {
    title: "料金プラン | EasyClaw",
    description:
      "0円からスタート。プレミアムならメッセージ無制限＆Japan Skill Pack付き。",
  },
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
