import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ダッシュボード",
  description:
    "AIモデルの選択からLINE連携まで、画面の案内に従うだけでセットアップ完了。",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
