import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        blush: "#f8e7ea",
        rose: "#e8b4bc",
        sand: "#f4efe8",
        mocha: "#5f4b53",
        cream: "#fff8f5"
      },
      boxShadow: {
        soft: "0 12px 30px rgba(95, 75, 83, 0.12)"
      }
    }
  },
  darkMode: "class",
  plugins: []
};

export default config;
