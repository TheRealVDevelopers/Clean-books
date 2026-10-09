import { createContext, useContext } from 'react'

// Who is signed in. The repository provides it: the demo has nobody to sign
// in, and live mode uses Firebase Authentication (src/repo/firebase-auth.jsx).
export const AuthContext = createContext(null)

export const useAuth = () => useContext(AuthContext)
