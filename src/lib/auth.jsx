import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { firebase, firebaseEnabled } from './firebase.js'

const AuthContext = createContext(null)

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(firebaseEnabled)

  useEffect(() => {
    if (!firebaseEnabled) return undefined
    return onAuthStateChanged(firebase.auth, async (nextUser) => {
      setUser(nextUser)
      if (!nextUser) {
        setProfile(null)
        setLoading(false)
        return
      }
      const snapshot = await getDoc(doc(firebase.db, 'users', nextUser.uid))
      setProfile(snapshot.exists() ? snapshot.data() : null)
      setLoading(false)
    })
  }, [])

  const value = useMemo(() => ({
    enabled: firebaseEnabled,
    demoMode: !firebaseEnabled,
    user,
    profile,
    loading,
    signIn: (email, password) => signInWithEmailAndPassword(firebase.auth, email, password),
    signInWithGoogle: () => signInWithPopup(firebase.auth, new GoogleAuthProvider()),
    resetPassword: (email) => sendPasswordResetEmail(firebase.auth, email),
    signOut: () => signOut(firebase.auth),
  }), [user, profile, loading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
