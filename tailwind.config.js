/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: "#0A0A0A",
          raised: "#111111",
          overlay: "#1A1A1A",
        },
        fg: {
          DEFAULT: "#E8E8E8",
          muted: "#888888",
        },
        border: {
          DEFAULT: "#2A2A2A",
        },
        accent: "#0055FF",
        bubble: {
          own: "#0055FF",
          other: "#1A1A1A",
        },
      },
      fontSize: {
        xxs: "0.625rem",
      },
      fontFamily: {
        sans: ["'Space Grotesk Variable'", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono Variable'", "monospace"],
      },
    },
  },
  plugins: [],
};
