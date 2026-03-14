/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["'Inter'", "system-ui", "sans-serif"],
      },
      colors: {
        brand: {
          50:  "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          800: "#166534",
          900: "#14532d",
        },
        urgent: {
          50:  "#fff1f2",
          100: "#ffe4e6",
          200: "#fecdd3",
          300: "#fda4af",
          400: "#fb7185",
          500: "#f43f5e",
          600: "#e11d48",
          700: "#be123c",
          800: "#9f1239",
          900: "#881337",
        },
        surface: {
          DEFAULT: "#0f1117",
          card:    "#1a1d27",
          input:   "#23263a",
          border:  "#2e3150",
        },
      },
      backdropBlur: {
        xs: "2px",
      },
      animation: {
        "fade-in":   "fadeIn .35s ease both",
        "slide-up":  "slideUp .4s cubic-bezier(0.16,1,0.3,1) both",
        "pulse-red": "pulseRed 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn:   { "0%": { opacity: 0 }, "100%": { opacity: 1 } },
        slideUp:  { "0%": { opacity: 0, transform: "translateY(24px)" }, "100%": { opacity: 1, transform: "translateY(0)" } },
        pulseRed: {
          "0%,100%": { boxShadow: "0 0 0 0 rgba(244,63,94,0)" },
          "50%":     { boxShadow: "0 0 0 6px rgba(244,63,94,0.25)" },
        },
      },
    },
  },
  plugins: [],
};
