import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "EasyClaw — 1分で始めるAIエージェント";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0a0a",
          fontFamily: "serif",
        }}
      >
        {/* border card */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: 1120,
            height: 550,
            borderRadius: 24,
            background: "#111111",
            border: "1px solid rgba(240,237,229,0.06)",
          }}
        >
          {/* shuin icon */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 48,
              height: 48,
              borderRadius: 8,
              border: "2px solid rgba(199,62,29,0.6)",
              color: "rgba(199,62,29,0.8)",
              fontSize: 22,
              marginBottom: 24,
            }}
          >
            易
          </div>

          {/* title */}
          <div
            style={{
              fontSize: 72,
              fontWeight: 700,
              color: "#F0EDE5",
              letterSpacing: "-0.02em",
            }}
          >
            EasyClaw
          </div>

          {/* subtitle */}
          <div
            style={{
              fontSize: 30,
              color: "rgba(168,164,156,0.8)",
              marginTop: 16,
            }}
          >
            1分で始めるAIエージェント
          </div>

          {/* tagline */}
          <div
            style={{
              fontSize: 20,
              color: "rgba(168,164,156,0.5)",
              marginTop: 12,
            }}
          >
            プログラミング不要・LINEで動く・0円から
          </div>

          {/* CTA */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginTop: 40,
              background: "#C73E1D",
              borderRadius: 28,
              padding: "14px 48px",
              fontSize: 20,
              fontWeight: 700,
              color: "#F0EDE5",
            }}
          >
            いますぐ無料で始める
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
