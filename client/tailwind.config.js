/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        surface: { DEFAULT: "#0B0F0E", card: "#151E1A", raised: "#182019" },
        brand: { DEFAULT: "#22C55E", dark: "#16A34A", light: "#4ADE80" },
        signature: "#A3E635",
        status: {
          available: "#22C55E",
          pending: "#F59E0B",
          booked: "#3B82F6",
          rejected: "#EF4444",
          blocked: "#6B7280",
        },
      },
      fontFamily: {
        display: ["Times New Roman", "Times", "serif"],
        sans: ["Times New Roman", "Times", "serif"],
        mono: ["Times New Roman", "Times", "serif"],
      },
    },
  },
  plugins: [],
};