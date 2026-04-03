import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./features/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fdf8ef",
          100: "#f8ecd2",
          200: "#f0d6a1",
          300: "#e5b96b",
          400: "#d99942",
          500: "#cb7c2b",
          600: "#b26122",
          700: "#8f491d",
          800: "#743c1d",
          900: "#60331b"
        }
      },
      boxShadow: {
        glow: "0 24px 80px rgba(203, 124, 43, 0.18)"
      }
    }
  },
  plugins: []
};

export default config;
