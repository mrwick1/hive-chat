/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        chatscreen: "rgba(17, 25, 40, 0.75)",
        // searchBar: "rgba(17, 25, 40, 0.50)",
        searchBar: "#2E333D",
        // background: "rgba(17, 25, 40, 0.78)",
        background: "#2E333D",
        chatscreen2: "#202329",
        bgBlacker: "#131313",
        textSub: "#9e9e9e",
        sendBtn: "#f59e0b",
        addUserBDFH: "rgba(46, 51, 61, 0.1)",
      },
      fontSize: {
        xxs: "0.625rem",
      },
    },
  },
  plugins: [],
};
