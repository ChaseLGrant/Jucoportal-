import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#0a0c10",
          900: "#0f1219",
          800: "#161a24",
          700: "#1f2533",
          600: "#2c3444",
          500: "#3d4759",
        },
        chalk: {
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#64748b",
        },
        accent: {
          DEFAULT: "#ff5a1f",
          hover: "#e64a12",
          soft: "#fff1eb",
        },
        field: {
          DEFAULT: "#16a34a",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-sans)", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 3px rgba(15,18,25,0.08), 0 1px 2px rgba(15,18,25,0.04)",
        cardhover: "0 12px 32px -8px rgba(15,18,25,0.18), 0 4px 10px rgba(15,18,25,0.06)",
        pop: "0 20px 60px -12px rgba(15,18,25,0.28)",
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.125rem",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s cubic-bezier(0.16,1,0.3,1) both",
        "fade-in": "fade-in 0.4s ease both",
      },
    },
  },
  plugins: [],
};

export default config;
