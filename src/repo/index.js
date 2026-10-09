// The data-access layer. Screens read the practice through useRepo() and never
// import src/data or Firebase themselves, so the same screens run on either
// implementation:
//   demo.jsx      — the sample practice in src/data; changes last one session
//   firestore.jsx — the signed-in user's firm, from Firebase
// Each one provides the names in contract.js, and the signed-in user (useAuth).

import { createContext, useContext } from 'react'

export const RepoContext = createContext(null)

export const useRepo = () => useContext(RepoContext)

// Exactly one implementation is loaded. The mode test is written out here
// rather than imported from lib/mode.js on purpose: the bundler only leaves
// the other import() out of the build when the condition is a constant inside
// this module. That is what keeps sample data out of the live bundle and
// Firebase out of the demo bundle.
export const loadRepo = () =>
  import.meta.env.VITE_APP_MODE === 'demo' ? import('./demo.jsx') : import('./firestore.jsx')
