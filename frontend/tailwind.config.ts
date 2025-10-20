import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}",
    "./src/styles/**/*.{css}",
  ],
  theme: {
    extend: {
      colors: {
        "gabi-blue": "#006CFF",
        // Secondary brand accent switched to orange for blue→orange gradients
        "gabi-orange": "#FF7A00",
        "gabi-red": "#FF2D2D",
        "gabi-dark": "#0F172A",
        "gabi-gray": "#334155",
      },
      boxShadow: {
        glow: "0 20px 60px rgba(0, 108, 255, 0.25)",
      },
      fontFamily: {
        display: ["var(--font-bebas)", "sans-serif"],
        body: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        "3xl": "1.5rem",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
