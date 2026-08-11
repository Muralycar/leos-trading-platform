import type { Config } from "tailwindcss";

// Tokens transcribed 1:1 from Handoff/design_handoff_leos_trading/design-system.md
// and source/styles.css :root custom properties. Do not change values without
// updating the handoff doc — these are the approved brand tokens.
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          0: "#0b0c0e",
          1: "#141619",
          2: "#1b1e22",
          3: "#24282d",
        },
        line: "rgba(255,255,255,.09)",
        "line-strong": "rgba(255,255,255,.16)",
        text: {
          0: "oklch(0.96 0.003 90)",
          1: "oklch(0.72 0.01 90)",
          2: "oklch(0.52 0.01 90)",
        },
        brass: {
          DEFAULT: "oklch(0.74 0.11 78)",
          dim: "oklch(0.52 0.08 78)",
          glow: "oklch(0.86 0.09 85)",
        },
        // New black/industrial-yellow/white system — additive only. `brass`
        // above is untouched and keeps driving every page not yet migrated
        // to this palette (Products, Search, Brands, Sourcing, Export,
        // About, admin). Deliberately a punchier, more saturated hue than
        // `warn` so the brand accent never reads as a stock-warning color
        // or vice versa. Hex, not oklch() — this codebase has a known
        // Tailwind v3 bug where opacity-modifier syntax (bg-yellow/40)
        // silently no-ops on oklch()-defined tokens; hex keeps it working.
        yellow: {
          DEFAULT: "#f7b500",
          dim: "#b98a00",
          glow: "#ffcb3d",
        },
        // Light-section tokens for the new system's white/off-white blocks
        // (Categories, Inventory, Brands). `bg`/`text`/`line` above remain
        // the dark-mode scale used everywhere else.
        paper: {
          0: "#f7f6f3",
          1: "#ffffff",
          2: "#edebe6",
        },
        ink: {
          0: "#15171a",
          1: "#4b4f56",
          2: "#8a8f97",
        },
        "paper-line": "rgba(15,17,20,.10)",
        "paper-line-strong": "rgba(15,17,20,.18)",
        safety: "oklch(0.68 0.17 45)",
        ok: "oklch(0.68 0.13 150)",
        warn: "oklch(0.75 0.15 85)",
      },
      fontFamily: {
        display: ["var(--font-barlow-condensed)", "sans-serif"],
        sans: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-plex-mono)", "monospace"],
      },
      borderRadius: {
        s: "3px",
        m: "5px",
      },
      maxWidth: {
        container: "1280px",
      },
      fontSize: {
        h1: "clamp(40px, 6vw, 76px)",
        h2: "clamp(30px, 4vw, 48px)",
        h3: "20px",
      },
    },
  },
  plugins: [],
};

export default config;
