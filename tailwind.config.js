/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "Inter",
          "Pretendard",
          "system-ui",
          "sans-serif",
        ],
      },
      colors: {
        ink: {
          900: "#111418",
          700: "#2a2f37",
          500: "#5b626d",
          300: "#9aa1ad",
          100: "#e6e8ec",
          50: "#f3f4f7",
        },
        accent: {
          DEFAULT: "#3a6df0",
          soft: "#eaf0fe",
        },
        sticker: "#ffd84a",
      },
      boxShadow: {
        card: "0 1px 2px rgba(17, 20, 24, 0.04), 0 1px 8px rgba(17, 20, 24, 0.06)",
        cardHover: "0 2px 4px rgba(17, 20, 24, 0.06), 0 4px 16px rgba(17, 20, 24, 0.08)",
      },
      borderRadius: {
        card: "12px",
      },
    },
  },
  plugins: [],
};
