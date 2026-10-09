import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App.jsx'
import { loadRepo } from './repo/index.js'
import './index.css'

// The repository (demo or live) is loaded first; everything else reads from it.
loadRepo().then(({ RepoProvider }) => {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <HashRouter>
        <RepoProvider><App /></RepoProvider>
      </HashRouter>
    </React.StrictMode>
  )
})
