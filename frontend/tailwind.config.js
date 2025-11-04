module.exports = {
  purge: ["./src/**/*.{html,ts}"],
  darkMode: "class", // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#e0f3ff",
          100: "#b3e0ff",
          200: "#80cfff",
          300: "#4dbfff",
          400: "#26b0ff",
          500: "#00a1f7", // Hơi nhạt hơn #007ACC
          600: "#008ee6", // Hơi nhạt hơn #007ACC
          700: "#007ACC", // Màu gốc của bạn
          800: "#0069b3",
          900: "#005a99",
          light: "#3395d6", // Biến thể sáng hơn
          dark: "#0069b3", // Tương đương 800
          DEFAULT: "#007ACC",
        },
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [require("@tailwindcss/line-clamp")],
};
