// Firebase is used by live mode only; the demo never initialises it.
//
// A development server talks to the local emulators under the offline
// `demo-cleanbook` project, so no real project or credential is needed to
// build CleanBook. A production build reads the six VITE_FIREBASE_* values
// from a local .env file; without them the app says so rather than quietly
// showing sample data.

import { initializeApp, getApps } from 'firebase/app'
import { getAuth, connectAuthEmulator } from 'firebase/auth'
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'
import { getStorage, connectStorageEmulator } from 'firebase/storage'
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions'
import { IS_DEMO } from './mode.js'

// Must match "emulators" in firebase.json.
const EMULATOR_PROJECT = 'demo-cleanbook'
const EMULATOR_HOST = import.meta.env.VITE_EMULATOR_HOST || '127.0.0.1'
const EMULATOR_PORTS = { auth: 9099, firestore: 8080, storage: 9199, functions: 5001 }

// Emulators by default on the dev server; VITE_USE_EMULATORS overrides either way.
export const usingEmulators = !IS_DEMO &&
  (import.meta.env.VITE_USE_EMULATORS
    ? import.meta.env.VITE_USE_EMULATORS === 'true'
    : import.meta.env.DEV)

const config = usingEmulators
  ? {
      apiKey: 'demo-api-key',
      authDomain: EMULATOR_PROJECT + '.firebaseapp.com',
      projectId: EMULATOR_PROJECT,
      storageBucket: EMULATOR_PROJECT + '.appspot.com',
      messagingSenderId: '0',
      appId: 'demo-app',
    }
  : {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
    }

export const firebaseEnabled = !IS_DEMO && Object.values(config).every(Boolean)

function connect(app) {
  const services = {
    app,
    auth: getAuth(app),
    db: getFirestore(app),
    storage: getStorage(app),
    functions: getFunctions(app),
  }
  if (usingEmulators) {
    connectAuthEmulator(services.auth, 'http://' + EMULATOR_HOST + ':' + EMULATOR_PORTS.auth)
    connectFirestoreEmulator(services.db, EMULATOR_HOST, EMULATOR_PORTS.firestore)
    connectStorageEmulator(services.storage, EMULATOR_HOST, EMULATOR_PORTS.storage)
    connectFunctionsEmulator(services.functions, EMULATOR_HOST, EMULATOR_PORTS.functions)
  }
  return services
}

export const firebase = firebaseEnabled ? connect(getApps()[0] || initializeApp(config)) : null
