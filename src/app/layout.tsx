import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Workflow Creator - ノードベースワークフローエディタ",
  description:
    "ファイルベースのAIエージェントノードを接続してワークフローを構築するビジュアルエディタ。Claude Code API不使用。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased">{children}</body>
    </html>
  );
}
