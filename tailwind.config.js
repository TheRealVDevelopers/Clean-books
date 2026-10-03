/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  // The app themes via a data-theme attribute, not the OS preference. Without
  // this, any `dark:` class silently keys off prefers-color-scheme instead and
  // can paint a dark panel while the text tokens are still light-theme.
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        // Theme-aware surfaces (driven by CSS vars in index.css)
        bg:    "rgb(var(--bg) / <alpha-value>)",
        card:  "rgb(var(--card) / <alpha-value>)",
        soft:  "rgb(var(--soft) / <alpha-value>)",
        line:  "rgb(var(--line) / <alpha-value>)",
        ink:   "rgb(var(--ink) / <alpha-value>)",
        mute:  "rgb(var(--mute) / <alpha-value>)",
        faint: "rgb(var(--faint) / <alpha-value>)",
        // Fixed brand + semantic scales
        // CleanBook: a calm, auditable teal rather than a generic SaaS indigo.
        // Teal communicates clarity and progress; navy remains the authority colour.
        brand: {
          50:"#F0FDFA",100:"#CCFBF1",200:"#99F6E4",300:"#5EEAD4",400:"#2DD4BF",
          500:"#14B8A6",600:"#0F9488",700:"#0F766E",800:"#115E59",900:"#134E4A",
        },
        ok:   { 50:"#ECFDF5",100:"#D1FAE5",300:"#6EE7B7",500:"#10B981",600:"#059669",700:"#047857" },
        warn: { 50:"#FFFBEB",100:"#FEF3C7",300:"#FCD34D",500:"#F59E0B",600:"#D97706",700:"#B45309" },
        bad:  { 50:"#FEF2F2",100:"#FEE2E2",300:"#FCA5A5",500:"#EF4444",600:"#DC2626",700:"#B91C1C" },
        info: { 50:"#ECFEFF",100:"#CFFAFE",300:"#67E8F9",500:"#06B6D4",600:"#0891B2",700:"#0E7490" },
      },
      fontFamily: {
        sans: ["Inter","ui-sans-serif","system-ui","Segoe UI","Roboto","sans-serif"],
        mono: ["ui-monospace","SFMono-Regular","Menlo","Consolas","monospace"],
      },
      boxShadow: {
        card: "0 1px 2px rgb(15 23 42 / 0.04), 0 1px 3px rgb(15 23 42 / 0.06)",
        pop:  "0 10px 30px -10px rgb(15 23 42 / 0.25)",
      },
      keyframes: {
        ping2: { "0%":{transform:"scale(1)",opacity:"0.55"}, "80%,100%":{transform:"scale(2.4)",opacity:"0"} },
        slidein:{ from:{opacity:"0",transform:"translateY(6px)"}, to:{opacity:"1",transform:"none"} },
      },
      animation: {
        ping2: "ping2 2.2s cubic-bezier(0,0,0.2,1) infinite",
        slidein: "slidein .25s ease-out both",
      },
    },
  },
  plugins: [],
}
