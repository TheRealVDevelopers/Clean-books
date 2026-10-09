// Guards the line between the two builds: sample data reaches screens only
// through the demo repository, and Firebase only through the live one.

import { readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, relative, resolve, sep } from 'node:path'
import { describe, it, expect } from 'vitest'

const SRC = resolve(__dirname, '../../src')

function files(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) return files(path)
    return /\.(js|jsx)$/.test(name) && !/\.test\.jsx?$/.test(name) ? [path] : []
  })
}

// Every module each source file imports, statically or with import().
const IMPORTS = files(SRC).map((file) => {
  const code = readFileSync(file, 'utf8')
  const specs = [...code.matchAll(/(?:from\s+|import\s*\(\s*|import\s+)['"]([^'"]+)['"]/g)].map((m) => m[1])
  return {
    file: relative(SRC, file).split(sep).join('/'),
    targets: specs.map((s) => (s.startsWith('.') ? relative(SRC, resolve(dirname(file), s)).split(sep).join('/') : s)),
  }
})

const importersOf = (test) => IMPORTS.filter((m) => m.targets.some(test)).map((m) => m.file).sort()

describe('import boundaries', () => {
  it('finds the source files', () => {
    expect(IMPORTS.length).toBeGreaterThan(50)
  })

  it('no screen imports the sample data', () => {
    const screens = importersOf((t) => t.startsWith('data/'))
      .filter((f) => /^(pages|apps|layout|components)\//.test(f))
    expect(screens).toEqual([])
  })

  it('only the demo repository imports the sample data', () => {
    const outside = importersOf((t) => t.startsWith('data/')).filter((f) => !f.startsWith('data/'))
    expect(outside).toEqual(['repo/demo-session.js', 'repo/demo.jsx'])
  })

  it('only the live side imports Firebase', () => {
    expect(importersOf((t) => t === 'firebase' || t.startsWith('firebase/'))).toEqual([
      'lib/firebase.js', 'lib/foundation.js', 'repo/firebase-auth.jsx', 'repo/firestore.jsx',
    ])
    expect(importersOf((t) => t === 'lib/firebase.js' || t === 'lib/foundation.js')).toEqual([
      'lib/foundation.js', 'repo/firebase-auth.jsx', 'repo/firestore.jsx',
    ])
  })
})
