/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "rgb(var(--color-ink) / <alpha-value>)",
        shale: "rgb(var(--color-shale) / <alpha-value>)",
        mist: "rgb(var(--color-mist) / <alpha-value>)",
        sand: "rgb(var(--color-sand) / <alpha-value>)",
        paper: "rgb(var(--color-paper) / <alpha-value>)",
        stone: "rgb(var(--color-stone) / <alpha-value>)",
        "ink-fixed": "#101418",
        "sand-fixed": "#f6f1eb",
        "shale-fixed": "#1b2430",
        "paper-fixed": "#fbfaf8",
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
        soft: "0 20px 60px -40px rgb(var(--color-ink) / 0.35)",
        lift: "0 18px 45px -30px rgb(var(--color-ink) / 0.4)",
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
