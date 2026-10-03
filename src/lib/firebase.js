// Firebase is intentionally inert until the six VITE_FIREBASE_* values exist
// in a local .env file. The demo still runs entirely in local session state.
// Once configured, this is the single place to initialise Auth, Firestore and
// Storage without exposing credentials in source control.

import { initializeApp, getApps } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import { getFunctions } from 'firebase/functions'

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

export const firebaseEnabled = Object.values(config).every(Boolean)
const app = firebaseEnabled ? (getApps()[0] || initializeApp(config)) : null

export const firebase = app ? {
  app,
  auth: getAuth(app),
  db: getFirestore(app),
  storage: getStorage(app),
  functions: getFunctions(app),
} : null
