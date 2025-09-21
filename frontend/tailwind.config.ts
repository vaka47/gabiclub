import type { Config } from "tailwindcss";


export default {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/styles/**/*.{css}",

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}",

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

        gabi: {
          blue: "#006CFF",
          dark: "#0B1F3A",
          red: "#FF2D2D",
          gray: "#1F2933",
        },
      },
      fontFamily: {
        display: ["var(--font-bebas)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
      },
      boxShadow: {
        glow: "0 20px 60px rgba(0, 108, 255, 0.25)",
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

} satisfies Config;

};

export default config;

