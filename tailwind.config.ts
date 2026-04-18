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
          50: "#faf4ee",
          100: "#f7ecd9",
          200: "#e2d4bc",
          300: "#cbb797",
          400: "#9d90c8",
          500: "#8a7bb4",
          600: "#6f6292",
          700: "#23324f",
          800: "#182540",
          900: "#0d1730"
        }
      },
      boxShadow: {
        glow: "0 18px 44px rgba(18, 31, 53, 0.16)"
      }
    }
  },
  plugins: []
};

export default config;
