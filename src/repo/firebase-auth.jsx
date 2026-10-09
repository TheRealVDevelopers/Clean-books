// Firebase Authentication for live mode, plus the user's CleanBook profile
// (users/{uid}), which says which firm and clients they belong to.

import { useEffect, useMemo, useState } from 'react'
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { firebase, firebaseEnabled } from '../lib/firebase.js'
import { AuthContext } from '../lib/auth.jsx'

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
    demoMode: false,
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
