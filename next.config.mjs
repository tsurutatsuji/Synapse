/** @type {import('next').NextConfig} */
const nextConfig = {
  // セキュリティヘッダー
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // クリックジャッキング防止
          { key: "X-Frame-Options", value: "DENY" },
          // MIME タイプスニッフィング防止
          { key: "X-Content-Type-Options", value: "nosniff" },
          // XSS 保護（レガシーブラウザ向け）
          { key: "X-XSS-Protection", value: "1; mode=block" },
          // リファラー情報の漏洩を制限
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // HTTPS 強制（1年間）
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
          // iframe 埋め込み・カメラ・マイク等の制限
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          // Content Security Policy
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: https:",
              "connect-src 'self'",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
