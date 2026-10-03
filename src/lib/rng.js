// Deterministic pseudo-random numbers. The whole demo dataset is generated, so
// a seeded generator is what keeps a client's numbers identical on every reload
// (and identical on the laptop you demo from).
export function mulberry(seed) {
  let a = seed >>> 0
  return function () {
    a += 0x6D2B79F5
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function hash(str) {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

// A generator keyed by a stable string, e.g. rngFor('CL-04:2026-08').
export const rngFor = (key) => mulberry(hash(key))

export const pick = (r, arr) => arr[Math.floor(r() * arr.length) % arr.length]
export const between = (r, lo, hi) => lo + r() * (hi - lo)
export const iBetween = (r, lo, hi) => Math.floor(between(r, lo, hi + 1))
export const chance = (r, p) => r() < p
