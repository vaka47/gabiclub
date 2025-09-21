import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/styles/**/*.{css}",
  ],
  theme: {
    extend: {
      colors: {
        "gabi-blue": "#006CFF",
        "gabi-red": "#FF2D2D",
        "gabi-dark": "#0F172A",
        "gabi-gray": "#334155",
      },
      boxShadow: {
        glow: "0 10px 30px rgba(0,108,255,0.25)",
      },
      fontFamily: {
        body: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        "3xl": "1.5rem",
      },
    },
  },
  plugins: [],
} satisfies Config;
