/**
 * Beam Design Language — Panda CSS preset.
 *
 * Wires the Sunbeam color palette (warm yellows + sunbeam orange + flame),
 * typography (Ysabeau Infant + Monaspace Argon), text styles, semantic light/dark
 * tokens, breakpoints, radii, shadows, and global body styles into a Panda
 * preset that consumers compose via `panda.config.ts`.
 *
 * @example
 * ```ts
 * // panda.config.ts
 * import { defineConfig } from "@pandacss/dev";
 * import { beamPreset } from "@sunbeam/beam-ui/preset";
 *
 * export default defineConfig({
 *   preflight: true,
 *   presets: [beamPreset],
 *   include: ["./src/**\/*.{ts,tsx}"],
 *   outdir: "styled-system",
 * });
 * ```
 *
 * @module
 */
import { definePreset, type Preset } from "@pandacss/dev";

/**
 * Beam Design Language Panda CSS Preset
 *
 * Usage in consumer's panda.config.ts:
 * ```ts
 * import { beamPreset } from "@sunbeam/beam-ui/preset"
 *
 * export default defineConfig({
 *   presets: [beamPreset],
 *   // ...
 * })
 * ```
 */
/**
 * Beam spacing scale — token N = N×4px. Used for both `spacing` and `sizes`
 * tokens so bare numeric values (`width: "10"`, `p: "4"`) resolve identically
 * across every CSS property, matching Panda's default-preset convention.
 */
const spacingScale = {
  0: { value: "0px" },
  0.25: { value: "1px" },
  0.5: { value: "2px" },
  0.75: { value: "3px" },
  1: { value: "4px" },
  1.25: { value: "5px" },
  1.5: { value: "6px" },
  1.75: { value: "7px" },
  2: { value: "8px" },
  2.25: { value: "9px" },
  2.5: { value: "10px" },
  3: { value: "12px" },
  3.5: { value: "14px" },
  4: { value: "16px" },
  4.5: { value: "18px" },
  5: { value: "20px" },
  5.5: { value: "22px" },
  6: { value: "24px" },
  7: { value: "28px" },
  7.5: { value: "30px" },
  8: { value: "32px" },
  9: { value: "36px" },
  10: { value: "40px" },
  12: { value: "48px" },
  14: { value: "56px" },
  15: { value: "60px" },
  16: { value: "64px" },
  20: { value: "80px" },
  24: { value: "96px" },
  25: { value: "100px" },
  28: { value: "112px" },
  30: { value: "120px" },
  32: { value: "128px" },
  36: { value: "144px" },
  40: { value: "160px" },
  44: { value: "176px" },
  45: { value: "180px" },
  48: { value: "192px" },
  50: { value: "200px" },
  52: { value: "208px" },
  56: { value: "224px" },
  60: { value: "240px" },
  64: { value: "256px" },
  65: { value: "260px" },
  72: { value: "288px" },
  74: { value: "296px" },
  75: { value: "300px" },
  80: { value: "320px" },
  96: { value: "384px" },
} as const;

export const beamPreset: Preset = definePreset({
  name: "beam",
  conditions: {
    extend: {
      dark: "[data-theme=dark] &",
      light: "[data-theme=light] &",
    },
  },

  theme: {
    breakpoints: {
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
    },
    extend: {
      tokens: {
        colors: {
          // Primary
          "sunbeam.orange": { value: "#fa520f" },
          "sunbeam.flame": { value: "#fb6424" },
          "beam.orange": { value: "#ff8105" },

          // Secondary / Sunshine scale
          "sunshine.900": { value: "#ff8a00" },
          "sunshine.700": { value: "#ffa110" },
          "sunshine.500": { value: "#ffb83e" },
          "sunshine.300": { value: "#ffd06a" },
          "sunshine.50": { value: "rgba(255,161,16,0.50)" },
          "sunshine.35": { value: "rgba(255,161,16,0.35)" },
          "sunshine.25": { value: "rgba(255,161,16,0.25)" },
          "beam.gold": { value: "#ffe295" },
          "bright.yellow": { value: "#ffd900" },

          // Surfaces
          "warm.ivory": { value: "#fffaeb" },
          cream: { value: "#fff0c2" },
          "sunbeam.black": { value: "#1f1f1f" },
          white: { value: "#ffffff" },
          "card.dark": { value: "#2a2a2a" },
          "code.activePill": { value: "#404040" },
          "code.text": { value: "#d4d4d8" },
          "code.success": { value: "#4ade80" },

          // Syntax highlighting
          "syn.keyword": { value: "#c084fc" },
          "syn.fn": { value: "#93c5fd" },
          "syn.string": { value: "#86efac" },
          "syn.prop": { value: "#fdba74" },
          "syn.number": { value: "#fb923c" },
          "syn.builtin": { value: "#fde047" },

          // Borders
          "border.warm": { value: "rgba(127, 99, 21, 0.15)" },
          "border.warmSubtle": { value: "rgba(127, 99, 21, 0.08)" },
          "border.warmDark": { value: "rgba(255, 161, 16, 0.15)" },

          // Exact-alpha tokens (one token per recurring alpha so component
          // source never hardcodes rgba values)
          "accent.06": { value: "rgba(250,82,15,0.06)" },
          "accent.08": { value: "rgba(250,82,15,0.08)" },
          "accent.10": { value: "rgba(250,82,15,0.10)" },
          "accent.12": { value: "rgba(250,82,15,0.12)" },
          "accent.15": { value: "rgba(250,82,15,0.15)" },
          "accent.20": { value: "rgba(250,82,15,0.20)" },
          "accent.30": { value: "rgba(250,82,15,0.30)" },
          "accent.40": { value: "rgba(250,82,15,0.40)" },
          "chrome.03": { value: "rgba(255,255,255,0.03)" },
          "chrome.05": { value: "rgba(255,255,255,0.05)" },
          "chrome.06": { value: "rgba(255,255,255,0.06)" },
          "chrome.10": { value: "rgba(255,255,255,0.10)" },
          "chrome.30": { value: "rgba(255,255,255,0.30)" },
          "chrome.35": { value: "rgba(255,255,255,0.35)" },
          "chrome.40": { value: "rgba(255,255,255,0.40)" },
          "chrome.50": { value: "rgba(255,255,255,0.50)" },
          "chrome.60": { value: "rgba(255,255,255,0.60)" },
          "chrome.70": { value: "rgba(255,255,255,0.70)" },
          "chrome.90": { value: "rgba(255,255,255,0.90)" },
          "warm.04": { value: "rgba(127,99,21,0.04)" },
          "warm.10": { value: "rgba(127,99,21,0.10)" },
          "warm.25": { value: "rgba(127,99,21,0.25)" },
          "warm.30": { value: "rgba(127,99,21,0.30)" },
          "warm.40": { value: "rgba(127,99,21,0.40)" },
          "creamA.30": { value: "rgba(255,240,194,0.30)" },
          "ivory.30": { value: "rgba(255,250,235,0.30)" },
          "ivory.50": { value: "rgba(255,250,235,0.50)" },
          "scrim.45": { value: "rgba(31,31,31,0.45)" },
          "scrim.50": { value: "rgba(31,31,31,0.50)" },
          "scrim.55": { value: "rgba(31,31,31,0.55)" },
          "scrim.60": { value: "rgba(31,31,31,0.60)" },
          "scrim.85": { value: "rgba(31,31,31,0.85)" },
          "grid.06": { value: "rgba(128,128,128,0.06)" },
          "grid.15": { value: "rgba(128,128,128,0.15)" },
          "grid.20": { value: "rgba(128,128,128,0.20)" },
          "diff.add.bg": { value: "rgba(46,160,67,0.15)" },
          "diff.add.emphasis": { value: "rgba(46,160,67,0.2)" },
          "diff.del.bg": { value: "rgba(248,81,73,0.15)" },
          "diff.del.emphasis": { value: "rgba(248,81,73,0.2)" },
          // Diff-gutter neutral slate (line-number backgrounds/borders)
          "slate.05": { value: "rgba(130,130,160,0.05)" },
          "slate.08": { value: "rgba(130,130,160,0.08)" },
          "slate.10": { value: "rgba(130,130,160,0.10)" },
          "slate.15": { value: "rgba(130,130,160,0.15)" },
        },
        fonts: {
          heading: {
            value: "'Ysabeau Infant', Arial, ui-sans-serif, system-ui, sans-serif",
          },
          body: {
            value: "'Ysabeau Infant', Arial, ui-sans-serif, system-ui, sans-serif",
          },
          mono: {
            value: "'Monaspace Argon', 'SF Mono', 'Fira Code', monospace",
          },
        },
        fontWeights: {
          display: { value: "431" },
          heading: { value: "575" },
          body: { value: "647" },
          button: { value: "791" },
        },
        shadows: {
          golden: {
            value:
              "-3px 5px 13px rgba(127,99,21,0.15), -11px 21px 32px rgba(127,99,21,0.11), -21px 43px 53px rgba(127,99,21,0.08), -43px 85px 80px rgba(127,99,21,0.05)",
          },
          goldenDark: {
            value:
              "-3px 5px 13px rgba(127,99,21,0.12), -11px 21px 32px rgba(127,99,21,0.09), -21px 43px 53px rgba(127,99,21,0.06), -43px 85px 80px rgba(127,99,21,0.04)",
          },
          nav: { value: "0 3px 13px rgba(127,99,21,0.08)" },
          code: { value: "0 7px 20px -7px rgba(0,0,0,0.5)" },
          // Focus rings — ordered by prominence; colors reference the accent alpha scale
          "focusRing.sm": { value: "0 0 0 2px {colors.accent.15}" },
          "focusRing.md": { value: "0 0 0 3px {colors.accent.20}" },
          "focusRing.lg": { value: "0 0 0 2px {colors.accent.30}" },
          "focusRing.xl": { value: "0 0 0 3px {colors.accent.30}" },
          "focusRing.2xl": { value: "0 0 0 2px {colors.accent.40}" },
          // Control thumbs / flyout surfaces
          thumb: { value: "0 1px 3px rgba(0,0,0,0.15)" },
          thumbSoft: { value: "0 1px 3px rgba(0,0,0,0.12)" },
          drawer: { value: "4px 0 20px rgba(0,0,0,0.15)" },
          pop: { value: "0 8px 24px rgba(0,0,0,0.12)" },
        },
        fontSizes: {
          // UI utility sizes
          "2xs": { value: "0.625rem" }, // 10px — badges, pills, filter counts
          xs: { value: "0.75rem" }, // 12px — meta lines, stats, timestamps
          // Typography scale (matches Type Scale in foundations/typography)
          sm: { value: "0.875rem" }, // 14px — Caption (weight 647 / line 1.43)
          md: { value: "1rem" }, // 16px — Body (weight 647 / line 1.50)
          lg: { value: "1.125rem" }, // 18px — UI emphasis
          xl: { value: "1.25rem" }, // 20px — UI emphasis
          "2xl": { value: "1.5rem" }, // 24px — Title (weight 575 / line 1.33)
          "3xl": { value: "2rem" }, // 32px — Sub-heading (weight 575 / line 1.15)
          "4xl": { value: "3rem" }, // 48px — Sub-heading Large (weight 431 / line 0.95)
          "5xl": { value: "3.5rem" }, // 56px — Section (weight 431 / line 0.95)
          "6xl": { value: "5.125rem" }, // 82px — Display (weight 431 / line 1.0 / ls -2.05px)
          // Numeric pixel sizes (same numeric convention as the spacing scale)
          "9": { value: "9px" },
          "8": { value: "8px" },
          "9.5": { value: "9.5px" },
          "10.5": { value: "10.5px" },
          "11": { value: "11px" },
          "13": { value: "13px" },
          "13.5": { value: "13.5px" },
          "15": { value: "15px" },
          "36": { value: "36px" },
          "40": { value: "40px" },
        },
        radii: {
          sm: { value: "2px" },
          md: { value: "4px" },
          lg: { value: "12px" },
          full: { value: "9999px" },
        },
        spacing: spacingScale,
        // Width/height resolve against `sizes`; mirror the spacing scale so
        // numeric sizing tokens behave exactly like numeric spacing tokens.
        // The extra entries are layout max-widths (sizes-only, not spacing).
        sizes: {
          ...spacingScale,
          "90": { value: "360px" },
          "95": { value: "380px" },
          "100": { value: "400px" },
          "120": { value: "480px" },
          "125": { value: "500px" },
          "140": { value: "560px" },
          "150": { value: "600px" },
          "160": { value: "640px" },
          "180": { value: "720px" },
          "220": { value: "880px" },
          "225": { value: "900px" },
          "300": { value: "1200px" },
          "360": { value: "1440px" },
        },
        lineHeights: {
          none: { value: "1" },
          tight: { value: "1.25" },
          snug: { value: "1.375" },
          normal: { value: "1.5" },
          relaxed: { value: "1.625" },
          loose: { value: "2" },
        },
      },
      textStyles: {
        display: {
          value: {
            fontSize: "5.125rem",
            fontWeight: "431",
            lineHeight: "1.0",
            letterSpacing: "-2.05px",
            fontFamily: "heading",
          },
        },
        section: {
          value: {
            fontSize: "3.5rem",
            fontWeight: "431",
            lineHeight: "0.95",
            fontFamily: "heading",
          },
        },
        "sub-heading-lg": {
          value: {
            fontSize: "3rem",
            fontWeight: "431",
            lineHeight: "0.95",
            fontFamily: "heading",
          },
        },
        "sub-heading": {
          value: {
            fontSize: "2rem",
            fontWeight: "575",
            lineHeight: "1.15",
            fontFamily: "heading",
          },
        },
        title: {
          value: {
            fontSize: "1.5rem",
            fontWeight: "575",
            lineHeight: "1.33",
            fontFamily: "heading",
          },
        },
        body: {
          value: {
            fontSize: "1rem",
            fontWeight: "647",
            lineHeight: "1.50",
            fontFamily: "body",
          },
        },
        caption: {
          value: {
            fontSize: "0.875rem",
            fontWeight: "647",
            lineHeight: "1.43",
            fontFamily: "body",
          },
        },
        emphasis: {
          value: {
            fontSize: "1.125rem",
            fontWeight: "791",
            lineHeight: "1.4",
            fontFamily: "heading",
          },
        },
        "strong-title": {
          value: {
            fontSize: "1.5rem",
            fontWeight: "791",
            lineHeight: "1.33",
            fontFamily: "heading",
          },
        },
        label: {
          value: {
            fontSize: "0.75rem",
            fontWeight: "791",
            lineHeight: "1.5",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            fontFamily: "body",
          },
        },
      },
      semanticTokens: {
        shadows: {
          code: {
            value: {
              base: "0 10px 30px -10px rgba(0,0,0,0.5)",
              _dark: "0 14px 40px -6px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,161,16,0.08)",
            },
          },
        },
        colors: {
          "bg.page": {
            value: {
              base: "{colors.warm.ivory}",
              _dark: "{colors.sunbeam.black}",
            },
          },
          "bg.card": {
            value: { base: "{colors.cream}", _dark: "{colors.card.dark}" },
          },
          "bg.nav": {
            value: {
              base: "rgba(255,250,235,0.92)",
              _dark: "rgba(31,31,31,0.92)",
            },
          },
          "text.primary": {
            value: { base: "{colors.sunbeam.black}", _dark: "#ffffff" },
          },
          "text.secondary": {
            value: { base: "hsl(0,0%,24%)", _dark: "rgba(255,255,255,0.7)" },
          },
          "text.muted": {
            value: { base: "#7f6315", _dark: "rgba(255,255,255,0.4)" },
          },
          "border.default": {
            value: {
              base: "{colors.border.warm}",
              _dark: "{colors.border.warmDark}",
            },
          },
          "border.subtle": {
            value: {
              base: "{colors.border.warmSubtle}",
              _dark: "rgba(255,161,16,0.08)",
            },
          },
          accent: {
            value: {
              base: "{colors.sunbeam.orange}",
              _dark: "{colors.sunbeam.orange}",
            },
          },
          sectionLabel: {
            value: {
              base: "{colors.sunbeam.orange}",
              _dark: "{colors.sunshine.700}",
            },
          },
        },
      },
    },
  },

  globalCss: {
    body: {
      fontFamily: "body",
      fontWeight: "body",
      bg: "bg.page",
      color: "text.primary",
      lineHeight: "1.5",
      WebkitFontSmoothing: "antialiased",
    },
    "@keyframes beam-fadeIn": {
      "0%": { opacity: "0" },
      "100%": { opacity: "1" },
    },
    "@keyframes beam-modalIn": {
      "0%": { transform: "translateY(8px) scale(0.98)", opacity: "0" },
      "100%": { transform: "translateY(0) scale(1)", opacity: "1" },
    },
  },
});
