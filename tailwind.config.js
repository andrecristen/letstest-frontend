/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#101418",
        shale: "#1b2430",
        mist: "#eef2f5",
        sand: "#f6f1eb",
        paper: "#fbfaf8",
        stone: "#e7e0d8",
        ocean: "#2f6f8f",
        ember: "#e76f51",
        citron: "#f2c14e",
        pine: "#1b4332",
      },
      fontFamily: {
        sans: ["Spline Sans", "sans-serif"],
        display: ["Space Grotesk", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      boxShadow: {
        soft: "0 20px 60px -40px rgba(16, 20, 24, 0.55)",
        lift: "0 18px 45px -30px rgba(16, 20, 24, 0.6)",
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
  purge: {
    options: {
      safelist: [
        'bg-blue-500',
        'bg-green-700',
        'bg-red-500'
      ],
    }
  }
}
