import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// One codebase, two builds, chosen at build time:
//   live — the real application on Firebase (the local emulators in development)
//   demo — the sales demo on fixed sample data, with no Firebase at all
// `--mode demo` selects the demo. Otherwise VITE_APP_MODE decides, default live.
export function resolveAppMode(mode, env = {}) {
  const appMode = mode === 'demo' ? 'demo' : env.VITE_APP_MODE || 'live'
  if (appMode !== 'demo' && appMode !== 'live') {
    throw new Error('VITE_APP_MODE must be "demo" or "live", not "' + appMode + '"')
  }
  return appMode
}

export default defineConfig(({ mode }) => {
  const appMode = resolveAppMode(mode, loadEnv(mode, process.cwd(), 'VITE_'))
  const demo = appMode === 'demo'
  return {
    plugins: [react()],
    // Replaced at build time, so code for the other mode can be dropped.
    define: { 'import.meta.env.VITE_APP_MODE': JSON.stringify(appMode) },
    server: { port: demo ? 5185 : 5186 },
    preview: { port: demo ? 4185 : 4186 },
    build: { outDir: demo ? 'dist-demo' : 'dist' },
  }
})
