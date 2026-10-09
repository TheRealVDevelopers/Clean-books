import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'
import { useRepo } from '../repo/index.js'

const Ctx = createContext(null)
export const useApp = () => useContext(Ctx)

const KEY = 'cleanbook.v1'
const load = () => {
  try { return JSON.parse(localStorage.getItem(KEY)) || {} } catch { return {} }
}

// Screen state — theme, who is at the keyboard, the command bar, toasts — plus
// the session actions of the repository in use. The repository decides what
// an action does: the demo keeps it for the session, live mode saves it or
// says that it cannot yet.
export function AppProvider({ children }) {
  const { STAFF, staffById, CURRENT_PERIOD, useSession } = useRepo()
  const saved = load()
  const [theme, setTheme] = useState(saved.theme || 'light')
  const [who, setWho] = useState(saved.who || STAFF[0]?.id)
  const [period, setPeriod] = useState(CURRENT_PERIOD)
  const [cmdOpen, setCmdOpen] = useState(false)
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify({ theme, who })) } catch { /* private mode */ }
  }, [theme, who])

  const toast = useCallback((title, detail, tone = 'ok') => {
    const id = 'T-' + Math.random().toString(36).slice(2, 8)
    setToasts((t) => [...t, { id, title, detail, tone }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200)
  }, [])

  // Live mode replaces who/setWho/whoInfo with the signed-in user.
  const session = useSession({ who, toast, staffById })

  const value = useMemo(() => ({
    theme,
    toggleTheme: () => setTheme((t) => (t === 'light' ? 'dark' : 'light')),
    who, setWho, whoInfo: staffById[who], staff: STAFF,
    period, setPeriod,
    cmdOpen, setCmdOpen,
    toasts, toast,
    ...session,
  }), [theme, who, staffById, STAFF, period, cmdOpen, toasts, toast, session])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
