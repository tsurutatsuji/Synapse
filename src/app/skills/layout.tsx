import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Japan Skill Pack",
  description:
    "楽天・Amazon価格比較、JR予約、レシートOCR、確定申告など、日本の生活に直結するAIスキルを搭載。",
  openGraph: {
    title: "Japan Skill Pack | EasyClaw",
    description:
      "楽天・Amazon価格比較、JR予約、レシートOCRなど、日本特化のAIスキル集。",
  },
};

export default function SkillsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
