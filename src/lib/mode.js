// Which of the two builds this is — fixed at build time by vite.config.js.
//   demo: the sales demo on the sample practice in src/data. Session-only actions.
//   live: the real application on Firebase. No sample data in the bundle.

export const APP_MODE = import.meta.env.VITE_APP_MODE
export const IS_DEMO = APP_MODE === 'demo'
