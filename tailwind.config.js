/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
	],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)"],
      },
      colors: {
        border: "hsl(var(--border-brand))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--bg))",
        foreground: "hsl(var(--foreground))",
        surface: "hsl(var(--surface))",
        fg: {
          DEFAULT: "hsl(var(--fg))",
          strong: "hsl(var(--fg-strong))",
          muted: "hsl(var(--fg-muted))",
        },
        accent: {
          1: "hsl(var(--accent-1))",
          2: "hsl(var(--accent-2))",
        },
        info: "hsl(var(--info))",
        primary: {
          DEFAULT: "hsl(var(--fg-strong))",
          foreground: "hsl(var(--bg))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
      },
      borderRadius: {
        lg: "12px",
        md: "10px",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        s1: "0 1px 2px rgba(0,0,0,.04)",
        s2: "0 2px 8px rgba(0,0,0,.06)",
        s3: "0 8px 24px rgba(0,0,0,.08)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
