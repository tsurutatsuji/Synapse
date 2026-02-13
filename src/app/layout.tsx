import type { Metadata } from "next";
import Providers from "@/components/Providers";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://easyclaw.jp";
const siteName = "EasyClaw";
const defaultTitle = "EasyClaw — あなた専用のAIアシスタント";
const defaultDescription =
  "LINEで話しかけるだけで、AIがあなたの仕事をお手伝い。むずかしい設定は一切ありません。0円からスタート。";

export const metadata: Metadata = {
  title: {
    default: defaultTitle,
    template: "%s | EasyClaw",
  },
  description: defaultDescription,
  metadataBase: new URL(siteUrl),
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: siteUrl,
    siteName,
    title: defaultTitle,
    description: defaultDescription,
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: defaultDescription,
  },
  icons: {
    icon: "/favicon.ico",
  },
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
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
