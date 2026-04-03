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
          50: "#f6f2ff",
          100: "#ede5ff",
          200: "#d9c7ff",
          300: "#b894ff",
          400: "#9b63ff",
          500: "#8141ff",
          600: "#6926f0",
          700: "#501ab8",
          800: "#30114f",
          900: "#14081f"
        }
      },
      boxShadow: {
        glow: "0 30px 90px rgba(129, 65, 255, 0.28)"
      }
    }
  },
  plugins: []
};

export default config;
