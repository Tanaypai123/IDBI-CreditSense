/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        blue: {
          50: "#E0F2F1",
          100: "#B2DFDB",
          200: "#80CBC4",
          300: "#4DB6AC",
          400: "#26A69A",
          500: "#00897B",
          600: "#00796B", // IDBI Green Primary
          700: "#00695C",
          800: "#004D40",
          900: "#002D26",
          950: "#001A16",
        },
        orange: {
          50: "#FFF3E0",
          100: "#FFE0B2",
          200: "#FFCC80",
          300: "#FFB74D",
          400: "#FFA726",
          500: "#F26C21", // IDBI Orange Accent
          600: "#E05B13",
          700: "#C44A0D",
          800: "#A83907",
          900: "#8C2E03",
        },
        brand: {
          blue: "#00796B",
          navy: "#004D40",
          gold: "#F26C21",
          green: "#00796B",
          orange: "#F26C21",
          slate: {
            50: "#F8FAFC",
            100: "#F1F5F9",
            200: "#E2E8F0",
            300: "#CBD5E1",
            400: "#94A3B8",
            500: "#64748B",
            600: "#475569",
            700: "#334155",
            800: "#1E293B",
            900: "#0F172A",
          }
        }
      },
      fontFamily: {
        sans: ['Poppins', 'Inter', 'sans-serif'],
        outfit: ['Poppins', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif'],
      },
      boxShadow: {
        'premium': '0 2px 8px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)',
        'premium-hover': '0 10px 30px rgba(0,0,0,0.04), 0 1px 8px rgba(0,0,0,0.02)',
      }
    },
  },
  plugins: [],
}
