import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EasyClaw — 1分でOpenClawをデプロイ",
  description:
    "技術知識ゼロでもOpenClawを簡単にデプロイ。日本人向けのかんたんセットアップツール。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@400;700;900&display=swap"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
