import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary:          "rgb(var(--primary-rgb) / <alpha-value>)",
        "primary-dark":   "rgb(var(--primary-dark-rgb) / <alpha-value>)",
        accent:           "rgb(var(--accent-rgb) / <alpha-value>)",
        success:          "rgb(var(--success-rgb) / <alpha-value>)",
        warning:          "rgb(var(--warning-rgb) / <alpha-value>)",
        dark:             "rgb(var(--dark-rgb) / <alpha-value>)",
        light:            "rgb(var(--light-rgb) / <alpha-value>)",
      },
    },
  },
  plugins: [],
};
export default config;
