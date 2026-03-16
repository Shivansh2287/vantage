import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#534AB7",
        "primary-hover": "#3C3489",
        "accent-green": "#1D9E75",
        "soft-purple": "#EEEDFE",
        "soft-purple-text": "#3C3489",
        "soft-green": "#E1F5EE",
        "soft-green-text": "#085041",
        "soft-amber": "#FAEEDA",
        "soft-amber-text": "#633806",
        "soft-coral": "#FAECE7",
        "soft-coral-text": "#712B13",
        neutral: "#F8F8F6",
        border: "#E8E8E4",
        "text-primary": "#1A1A1A",
        "text-secondary": "#6B6B67",
        "text-tertiary": "#9B9B97",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      borderRadius: {
        standard: "8px",
        card: "12px",
        pill: "20px",
      },
    },
  },
  plugins: [],
};

export default config;
