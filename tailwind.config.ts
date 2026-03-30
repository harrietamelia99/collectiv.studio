import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: "#f2edeb",
        burgundy: "#250d18",
        /** Matches `globals.css` --cc-divider (section hairlines, accordions using border-divider) */
        divider: "#250d18",
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "monospace"],
      },
      fontSize: {
        /** Page title */
        "cc-h1": ["clamp(1.95rem, 4.8vw, 3.15rem)", { lineHeight: "0.96", letterSpacing: "-0.045em" }],
        /** Major section heading */
        "cc-h2": ["clamp(1.48rem, 3.5vw, 2.42rem)", { lineHeight: "0.98", letterSpacing: "-0.038em" }],
        /** Subsection / card group */
        "cc-h3": ["clamp(1.22rem, 2.35vw, 1.72rem)", { lineHeight: "1.06", letterSpacing: "-0.032em" }],
        /** Card title / compact display */
        "cc-h4": ["clamp(1.05rem, 1.7vw, 1.32rem)", { lineHeight: "1.12", letterSpacing: "-0.026em" }],
      },
      borderRadius: {
        "cc-card": "var(--cc-card-radius)",
      },
      borderWidth: {
        /** Matches `globals.css` --cc-stroke (site-wide divider thickness) */
        cc: "var(--cc-stroke)",
      },
      boxShadow: {
        soft: "var(--cc-soft)",
        nav: "var(--cc-nav)",
        lift: "var(--cc-lift)",
      },
      transitionTimingFunction: {
        smooth: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
    },
  },
  plugins: [],
};
export default config;
