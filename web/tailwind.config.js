/**
 * Colours are declared as CSS variables so the whole interface can be
 * re-themed by the student at runtime. A neurodiversity tool that ships one
 * fixed appearance has already failed a portion of its users.
 */
const v = (name) => `rgb(var(${name}) / <alpha-value>)`;

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ground: v("--c-ground"),
        surface: v("--c-surface"),
        raised: v("--c-raised"),
        ink: v("--c-ink"),
        muted: v("--c-muted"),
        faint: v("--c-faint"),
        line: v("--c-line"),
        pine: v("--c-pine"),
        // Reserved. Exactly one element on screen may ever use this colour:
        // the step you are on right now.
        lit: v("--c-lit"),
      },
      fontFamily: {
        sans: ["Atkinson Hyperlegible", "system-ui", "sans-serif"],
        display: ["Newsreader", "Georgia", "serif"],
        mono: ["IBM Plex Mono", "ui-monospace", "monospace"],
      },
      maxWidth: { reading: "36rem", page: "60rem" },
      // 10px. The old 6 was small enough that cards read as boxes drawn
      // rather than objects placed; larger would start to look playful,
      // which this is not.
      borderRadius: { card: "0.625rem" },
      transitionTimingFunction: { calm: "cubic-bezier(0.22, 0.61, 0.36, 1)" },
    },
  },
  plugins: [],
};
