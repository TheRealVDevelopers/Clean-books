# Work Order 1 — Handoff

| | |
|---|---|
| Work order | [WO-1-foundation.md](./WO-1-foundation.md) |
| Written by | Development agent (Claude) |
| Status | **In progress.** WO1-01 and WO1-02 are done. The other tasks have not started. |

This file is updated as each task lands. It is complete only when every task below is marked.

## Task status

| Task | Status | Commit |
|---|---|---|
| WO1-01 Repository and tooling | Done | `WO1-01: Repository and tooling` |
| WO1-02 App mode switch and data layer | Done | `WO1-02: App mode switch and data layer` |
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
| `npm test` | 3 | 18 | 18 |
| `npm run test:rules` | 1 | 3 | 3 |

The rules suite is only a harness check so far: it proves the tests reach the emulators and load
`firestore.rules` and `storage.rules`. The access-matrix cases are WO1-05.

## How WO1-02 was verified

- **The demo is unchanged.** Before any WO-1 change, I recorded the visible text of 253 demo screen
  states: every route, every tab and segmented filter, all twelve owner apps with each of their tabs,
  and the two-sided flow from the README (send CL-02's two items, then 14 open documents become 12).
  The same recording after WO1-01 and again after WO1-02 is identical, with no page errors.
- **The live build has no sample data.** Searching `dist/` for `Ramanathan`, `Sri Balaji` and
  `Iron Temple` finds nothing. `dist-demo/` contains all three.
- **The demo build has no Firebase code.** Searching `dist-demo/` for Firebase endpoints finds nothing.
- **Neither build shows the large-chunk warning.** The largest live chunk is the Firestore SDK
  (464 kB). The largest demo chunk is the charting library (365 kB).
- **No screen imports `src/data`.** `tests/unit/import-boundaries.test.js` checks this, and also
  that only `src/repo/demo*` imports the sample data and only the live side imports Firebase.
- **Both repositories have the same shape.** `src/repo/contract.test.jsx` holds the demo and live
  repositories, and their session actions, to the list in `src/repo/contract.js`.
- **Live mode works against the emulators.** With the emulators and seed running, I signed in as
  `principal.a@cleanbook.test`. Every screen in the live navigation rendered without errors for the
  seeded firm, which has no clients.

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

### WO1-02

1. **Part of WO1-12 was pulled forward: demo-only screens are not in the live build.** These screens
   are GST, ITC vs 2B, TDS & payroll, Direct tax, Notices, Revenue share, Assistant, Integrations and
   Client applications. In the owner app, every tab except My CA is demo-only too. Their routes,
   navigation links and command-bar shortcuts exist only in the demo build. `Gst.jsx` and `Tds.jsx`
   hard-code sample client names in their text, so leaving these screens out was the only way to meet
   WO1-02's "no demo names in `dist/`" check. The rest of WO1-12 is still open: the live dashboard,
   empty states, Reports trimmed to CSV, and the "Demo data" badge.
2. **Sample text in shared screens moved into `src/data`.**
   - The Settings portal-connection list is now `PORTALS` in `src/data/practice.js`, because it named
     sample clients.
   - The Users & access role cards now take their names from the staff list instead of hard-coding
     them.
   - The owner-app footer takes the firm's name from the repository.
3. **Referral-share content appears only where there is revenue data.** This covers the sidebar tile,
   the dashboard tile and button, the Settings agreement card and the Reports statement. The demo has
   revenue data, so it looks the same as before. Live mode has none, so these items don't appear.
   WO1-13 still adds the `VITE_FLAG_REFERRAL_SHARE` switch on top.
4. **Live actions never fake success.** Each session action that live mode can't save yet shows a
   "Not available yet … Nothing was changed" warning and changes nothing. This covers filing, mark
   ready, reminders, uploads, purchase review, tasks, invoices, E-Way Bills and trips. The real
   writes are WO1-09, WO1-10 and WO1-11. The demo keeps its session-only behaviour; the "Demo: …"
   wording for those messages is still to do under WO1-09 and WO1-10.
5. **The demo build excludes Firebase**, just as the live build excludes the sample data.
   `src/lib/auth.jsx` is now only a context. The Firebase sign-in provider lives in
   `src/repo/firebase-auth.jsx`. The Setup and invitation writes go through the repository.

## Decisions and reasons

- **The build-mode test is written out where code is gated.** `src/repo/index.js`, `App.jsx` and
  `OwnerApp.jsx` test `import.meta.env.VITE_APP_MODE === 'demo'` directly instead of importing
  `IS_DEMO`. I checked this in a small experiment: with the imported constant, Vite 8 drops the dead
  code but still writes the demo-only chunk file into `dist/`. With the test inside the module, it
  writes nothing. Everywhere else uses `IS_DEMO`.
- **Screens read data through a hook, `useRepo()`, with the same names the old imports had**
  (`CLIENTS`, `LEDGER`, `practiceKpis`, …). The diff in each screen is mostly the import line plus one
  destructuring line. The live repository can update screens as Firestore data changes.
- **`src/lib/derive.js` is now `makeDerive(dataset)`.** Each repository builds its own aggregates.
  Aggregates leave out clients that have no month-end figures yet instead of failing on them. All
  demo clients have figures, so the demo is unaffected.
- **Shared vocabulary left `src/data`.** The status colour maps are now in `src/lib/status.js`, and
  the obligation queries are in `src/lib/obligations.js`, which both repositories use. WO1-08 can
  build on that.
- **`ScreenBoundary` contains a screen that can't render.** That covers both a screen needing data the
  practice doesn't have yet and a screen chunk that failed to download. Either shows a message inside
  the shell, and the rest of the app keeps working.
- **Firebase is split into chunks by service, and the icon library is one chunk.** That keeps both
  builds under the size warning without one file per icon.

- **Emulator config needs no `.env`.** On the dev server, live mode always uses the offline
  `demo-cleanbook` project and the emulator ports from `firebase.json`, so a fresh clone runs
  without credentials. `VITE_USE_EMULATORS=true|false` overrides that either way.
- **A live build with no Firebase settings shows a "Firebase is not configured" screen.** Before
  this, a missing configuration silently fell back to the demo. That fallback could make sample data
  look like a real practice.
- **`npm run seed` wipes the emulators before loading**, so every run gives the same state. It only
  uses emulator-only endpoints, so it can't touch a real project.

## Known issues and decisions for the owner

Live mode after WO1-02 (all scheduled in later tasks):

- **Some screens can't show a real client yet.** Once a client exists (today only through the existing
  Firm & Onboarding page), Clients, Client detail, Documents, Team and Reports show "This screen could
  not be shown". They read fields only the sample clients have: ledger figures, Real V status and the
  assigned staff member. → WO1-07 and WO1-12.
- **My CA reads sample-only fields.** In the owner app, My CA shows the same message for a live
  client. → WO1-10 rebuilds it.
- **Fixed sample dates still appear in live mode.** For example, the dashboard says "10 September,
  Thursday". → WO1-03.
- **Some live figures show 0 or NaN instead of being removed.** The dashboard turnover, tax-payable and
  automation tiles show 0; Team capacity and average readiness show NaN. → WO1-12.
- **The "Signed in as" menu still lists the firm's users in live mode.** Choosing one does nothing.
  → WO1-06.
- **The live repository reads every user in the firm.** It's needed for the staff list, and the
  current rules also allow it for client users. → WO1-05 tightens the rules.
- **Owner decision: the demo's Firm & Onboarding page still says "Preview — configure Firebase to
  save".** I kept it so the demo stays unchanged, but configuring Firebase no longer applies to the
  demo build. Please decide whether to reword it.

From WO1-01:

- The Functions emulator warns that `firebase-functions` 6 is outdated. Upgrading is a breaking
  change and isn't needed for WO-1, so it is unchanged.
- The browser requests `/favicon.ico`, which doesn't exist, so it logs a 404. This was already the
  case before WO-1.
