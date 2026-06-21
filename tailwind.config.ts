import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./server-actions/**/*.{ts,tsx}"
  ],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        "2xl": "1440px"
      }
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))"
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))"
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))"
        },
        brand: {
          DEFAULT: "hsl(var(--brand))",
          foreground: "hsl(var(--brand-foreground))",
          hover: "hsl(var(--brand-hover))"
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
          lime: "hsl(var(--accent-lime))"
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))"
        },
        status: {
          available: "hsl(var(--status-available))",
          booked: "hsl(var(--status-booked))",
          pending: "hsl(var(--status-pending))",
          completed: "hsl(var(--status-completed))",
          cancelled: "hsl(var(--status-cancelled))",
          blocked: "hsl(var(--status-blocked))"
        }
      },
      fontFamily: {
        display: ["Clash Display", "Space Grotesk", "sans-serif"],
        sans: ["Satoshi", "General Sans", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"]
      },
      boxShadow: {
        soft: "0 18px 50px -28px hsl(var(--foreground) / 0.35)",
        card: "0 8px 30px -24px hsl(var(--foreground) / 0.45)"
      },
      backgroundImage: {
        "pitch-lines": "linear-gradient(90deg, hsl(var(--border) / 0.5) 1px, transparent 1px), linear-gradient(hsl(var(--border) / 0.5) 1px, transparent 1px)"
      }
    }
  },
  plugins: []
};

export default config;
