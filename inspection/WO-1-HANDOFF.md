# Work Order 1 — Handoff

| | |
|---|---|
| Work order | [WO-1-foundation.md](./WO-1-foundation.md) |
| Written by | Development agent (Claude) |
| Status | **In progress.** WO1-01 is done. The other tasks have not started. |

This file is updated as each task lands. It is complete only when every task below is marked.

## Task status

| Task | Status | Commit |
|---|---|---|
| WO1-01 Repository and tooling | Done | `WO1-01: …` |
| WO1-02 App mode switch and data layer | Not done | |
| WO1-03 Real date | Not done | |
| WO1-04 Data model | Not done | |
| WO1-05 Security rules | Not done | |
| WO1-06 Sign-in and invitations | Not done | |
| WO1-07 Add clients, and import them from Excel | Not done | |
| WO1-08 Compliance calendar from real profiles | Not done | |
| WO1-09 Replace the fake "File now" | Not done | |
| WO1-10 Document requests and real uploads | Not done | |
| WO1-11 Audit log | Not done | |
| WO1-12 Live-mode screens and empty states | Not done | |
| WO1-13 Referral share behind a switch | Not done | |
| WO1-14 Legal pages and consent | Not done | |
| WO1-15 Tests, seed data, documents and handoff | Not done | |

## Commands

```bash
npm install            # also installs functions/ dependencies (postinstall)

npm run dev:demo       # demo mode, http://localhost:5185
npm run build:demo     # demo build → dist-demo/

npm run emulators      # terminal 1: Auth 9099, Firestore 8080, Storage 9199, Functions 5001, UI http://127.0.0.1:4000
npm run seed           # terminal 2: wipes the emulators, loads the logins in scripts/SEED-USERS.md
npm run dev            # live mode, http://localhost:5186, connected to the emulators
npm run build          # live build → dist/ (needs VITE_FIREBASE_* in .env to run outside the emulators)

npm test               # unit tests (Vitest)
npm run test:rules     # security-rules tests; starts and stops the emulators itself
```

Prerequisites: Node 22 and Java 21 or newer (for the Firestore and Storage emulators).

## Test results

| Suite | Files | Tests | Passing |
|---|---|---|---|
| `npm test` | 1 | 4 | 4 |
| `npm run test:rules` | 1 | 3 | 3 |

The rules suite is only a harness check so far: it proves the tests reach the emulators and load
`firestore.rules` and `storage.rules`. The access-matrix cases are WO1-05.

## Deviations from the work order

### WO1-01

1. **No separate baseline commit.** The repository already had git history when WO-1 began
   (`d5a0a55` Initial CleanBook application, `a8c58a3` the Hisaabo reference policy). Ground rule 1
   forbids rewriting history, so the baseline is `a8c58a3`, and the WO-1 task commits follow it.
2. **`src/lib/mode.js` arrived with WO1-01, not WO1-02.** The `dev` and `dev:demo` scripts needed
   the mode switch to exist. The data layer itself is WO1-02.
3. **The demo build writes to `dist-demo/`.** That way the demo and live builds don't overwrite each
   other. The live build stays in `dist/`, which Firebase Hosting serves.
4. **The live dev server uses port 5186.** The demo keeps 5185, as documented in the README, so both
   can run side by side.
5. **The `seed` script is a first slice.** It loads two firms with one principal each, in the
   current `users/{uid}` shape. WO1-15 extends it once the WO1-04 data model exists.
6. **`postinstall` installs `functions/` dependencies**, so the Functions emulator loads the existing
   invitation functions on a fresh clone.
7. **`@firebase/rules-unit-testing` is on 5.x.** Version 6 requires the `firebase` 13 SDK, and the
   app uses `firebase` 12. Upgrading the SDK is outside WO1-01.

## Decisions and reasons

- **Emulator config needs no `.env`.** On the dev server, live mode always uses the offline
  `demo-cleanbook` project and the emulator ports from `firebase.json`, so a fresh clone runs
  without credentials. `VITE_USE_EMULATORS=true|false` overrides that either way.
- **A live build with no Firebase settings shows a "Firebase is not configured" screen.** Before
  this, a missing configuration silently fell back to the demo. That fallback could make sample data
  look like a real practice.
- **`npm run seed` wipes the emulators before loading**, so every run gives the same state. It only
  uses emulator-only endpoints, so it can't touch a real project.

## Known issues and decisions for the owner

- The Functions emulator warns that `firebase-functions` 6 is outdated. Upgrading is a breaking
  change and isn't needed for WO-1, so it is unchanged.
- The browser requests `/favicon.ico`, which doesn't exist, so it logs a 404. This was already the
  case before WO-1.
