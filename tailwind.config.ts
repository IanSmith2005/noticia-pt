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
        accent: {
          DEFAULT: "#2563eb",
          light: "#3b82f6",
          dark: "#1d4ed8",
        },
        surface: "#f8f7f4",
        navy: "#1e293b",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        reading: ["Georgia", "serif"],
      },
    },
  },
  plugins: [],
  darkMode: "class",
};

export default config;
