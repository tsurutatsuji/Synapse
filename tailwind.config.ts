import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ob: {
          primary: "#1e1e1e",
          secondary: "#252525",
          tertiary: "#2b2b2b",
          hover: "#333333",
          active: "#3a3a3a",
          accent: "#7c3aed",
          "accent-hover": "#6d28d9",
          "accent-glow": "#a78bfa",
          "accent-muted": "rgba(124, 58, 237, 0.15)",
          "text-normal": "#dcddde",
          "text-muted": "#999999",
          "text-faint": "#666666",
          border: "#333333",
          "border-hover": "#484848",
        },
      },
      boxShadow: {
        "ob-sm": "0 1px 3px rgba(0, 0, 0, 0.3)",
        "ob-md": "0 2px 8px rgba(0, 0, 0, 0.4)",
        "ob-lg": "0 4px 16px rgba(0, 0, 0, 0.5)",
        "ob-glow": "0 0 12px rgba(124, 58, 237, 0.3)",
      },
      borderRadius: {
        ob: "6px",
      },
    },
  },
  plugins: [],
};
export default config;
