import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./client/index.html", "./client/src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        // New custom colors
        coral: {
          DEFAULT: "#FF6B6B",
          50: "#FFEDED",
          100: "#FFDEDE",
          200: "#FFC0C0",
          300: "#FFA2A2",
          400: "#FF8484",
          500: "#FF6B6B",
          600: "#FF3D3D",
          700: "#FF0F0F",
          800: "#E00000",
          900: "#B20000",
        },
        teal: {
          DEFAULT: "#14B8A6",
          50: "#9BF4EA",
          100: "#87F1E5",
          200: "#60ECDC",
          300: "#38E6D3",
          400: "#1BD6C2",
          500: "#14B8A6",
          600: "#0F887C",
          700: "#0A5952",
          800: "#052A28",
          900: "#000000",
        },
        amber: {
          DEFAULT: "#F59E0B",
          50: "#FCE4BB",
          100: "#FBDCA8",
          200: "#FACD82",
          300: "#F8BD5C",
          400: "#F7AE35",
          500: "#F59E0B",
          600: "#C47F08",
          700: "#935F06",
          800: "#624004",
          900: "#312002",
        },
        purple: {
          DEFAULT: "#6366F1",
          50: "#FFFFFF",
          100: "#F9F9FE",
          200: "#D2D3FB",
          300: "#AAADF8",
          400: "#8387F5",
          500: "#6366F1",
          600: "#2F33EC",
          700: "#1317D1",
          800: "#0E119F",
          900: "#090B6D",
        },
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        "pulse-shadow": {
          "0%, 100%": { 
            boxShadow: "0 0 0 0 rgba(99, 102, 241, 0.4)"
          },
          "50%": { 
            boxShadow: "0 0 0 15px rgba(99, 102, 241, 0)"
          },
        },
        "float": {
          "0%, 100%": { 
            transform: "translateY(0)" 
          },
          "50%": { 
            transform: "translateY(-10px)" 
          },
        },
        "bounce-subtle": {
          "0%, 100%": {
            transform: "translateY(0)",
            animationTimingFunction: "cubic-bezier(0.8, 0, 1, 1)"
          },
          "50%": {
            transform: "translateY(-5px)",
            animationTimingFunction: "cubic-bezier(0, 0, 0.2, 1)"
          }
        },
        "gradient-shift": {
          "0%": {
            backgroundPosition: "0% 50%"
          },
          "50%": {
            backgroundPosition: "100% 50%"
          },
          "100%": {
            backgroundPosition: "0% 50%"
          }
        },
        "ripple": {
          "0%": {
            transform: "scale(0)",
            opacity: "1"
          },
          "100%": {
            transform: "scale(4)",
            opacity: "0"
          }
        },
        "spin-slow": {
          "0%": {
            transform: "rotate(0deg)"
          },
          "100%": {
            transform: "rotate(360deg)"
          }
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-shadow": "pulse-shadow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float": "float 3s ease-in-out infinite",
        "bounce-subtle": "bounce-subtle 2s infinite",
        "gradient-shift": "gradient-shift 4s ease infinite",
        "ripple": "ripple 0.7s ease-out",
        "spin-slow": "spin-slow 8s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;
