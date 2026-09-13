/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#09090B",
        panel: "#111113",
        "panel-hover": "#18181B",
        border: "#27272A",
        "border-light": "#3F3F46",
        primary: "#FAFAFA",
        secondary: "#A1A1AA",
        muted: "#71717A",
        accent: {
          DEFAULT: "#06B6D4",
          light: "#22D3EE",
          dark: "#0891B2",
          glow: "rgba(6, 182, 212, 0.15)",
        },
        success: {
          DEFAULT: "#10B981",
          glow: "rgba(16, 185, 129, 0.15)",
        },
        warning: {
          DEFAULT: "#F59E0B",
          glow: "rgba(245, 158, 11, 0.15)",
        },
        error: {
          DEFAULT: "#EF4444",
          glow: "rgba(239, 68, 68, 0.15)",
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'glow-cyan': '0 0 20px -5px rgba(6, 182, 212, 0.25)',
        'panel': '0 4px 20px -2px rgba(0, 0, 0, 0.5)',
      }
    },
  },
  plugins: [],
}
