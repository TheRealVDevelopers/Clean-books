# Work Order 1 — Foundation and honesty fixes

| | |
|---|---|
| Issued by | Inspector (Claude) |
| Issued on | 3 October 2026 |
| For | Development agent |
| Status | **Open** |
| Next step | Development agent builds, then writes `inspection/WO-1-HANDOFF.md`. Inspector then inspects. |

---

## 1. Goal

Turn CleanBook from a demo into an application a real CA firm can start using with real
clients, **without losing the demo**, which is still the main sales tool.

When this work order is done:

- A CA firm can sign up, invite its staff, and add clients one by one or from Excel.
- The compliance calendar is generated from those real client profiles, using today's real date.
- The CA can raise document requests. The client owner can sign in, upload real files, and the CA can review them.
- Every action is saved and logged. One firm can never see another firm's data. One client can never see another client's data.
- The existing demo still works as it does today, for sales meetings.

## 2. Not in this work order (do not build)

GST portal or GSP integration · e-way bill / e-invoice generation · WhatsApp Business API ·
an email-sending service · OCR · AI assistant · changes to voice invoice · Tally import or
export · bank statement import · trade operations modules (transport, gym, etc.) ·
subscription billing or payments · referral payouts · document upload links that work
without signing in.

If a task seems to need one of these, stop and record it in the handoff file instead of building it.

## 3. Ground rules

1. **Git first.** This folder is not a git repository yet. Before changing anything:
   - `git init`
   - add a `.gitignore` covering `node_modules/`, `dist/`, `.env`, `.env.*` (keep `.env.example`), Firebase debug logs and emulator export data
   - commit the current state unchanged as **`Baseline: demo prototype before WO-1`**
   - then make **one commit per task**, message starting with the task ID (e.g. `WO1-05: Firestore and Storage security rules`)
   - never squash, amend or rewrite history. The inspector reviews the diff of each task commit.
2. **Keep the demo.** One codebase, two modes chosen at build time with `VITE_APP_MODE=demo|live`.
   Demo mode must look and behave as today, except for the changes listed in WO1-09, WO1-10, WO1-12 and WO1-13.
   Live mode must not include any demo data in its bundle.
3. **Emulator first.** Build and test against the Firebase Emulator Suite (Auth, Firestore,
   Storage, and Functions only if you use them). Use the project id `demo-cleanbook`
   (the `demo-` prefix keeps the emulators offline). Do not create or connect to a real
   Firebase project. No credentials or secrets in the repository.
4. **Security lives in the rules.** Every access restriction must be enforced by Firestore and
   Storage security rules. Hiding a button or a route is not a restriction.
5. **No fake success.** In live mode, no screen may say something happened (filed, sent,
   uploaded, approved) unless it really happened and was saved.
6. **Match the existing code.** React function components, Tailwind classes, the existing
   components in `src/components/ui.jsx` and `bits.jsx`, `lucide-react` icons, and the brand in `BRAND.md`.
7. **When unsure, pick the safer option** and record the decision and the reason in the handoff file.
8. **Do not move the project folder.** It is inside OneDrive. That is the owner's decision (see the note at the end).

---

## 4. Tasks

Do them in this order. Each task has acceptance criteria. The inspector will check every one.

### WO1-01 · Repository and tooling

- Git setup as in ground rule 1.
- npm scripts:
  - `dev` — live mode against emulators
  - `dev:demo` — demo mode (today's behaviour)
  - `build` — live production build
  - `build:demo` — demo production build
  - `emulators` — start the Firebase emulators
  - `seed` — load test data into the emulators (see WO1-15)
  - `test` — unit tests (Vitest)
  - `test:rules` — security rules tests (`@firebase/rules-unit-testing` against the emulators)
- Add `firebase.json`, `.firebaserc` (project `demo-cleanbook`), `firestore.rules`,
  `firestore.indexes.json`, `storage.rules`.

**Acceptance**
- [ ] Git history starts with the untouched baseline commit, then one commit per task.
- [ ] On a fresh clone: `npm install`, then `npm run emulators` plus `npm run dev` opens live mode connected to the emulators.
- [ ] `npm run dev:demo` shows the current demo with the same data and screens.

### WO1-02 · App mode switch and data layer

Today 26 files in `src/pages`, `src/apps` and `src/layout` import sample data straight from `src/data/`.

- Add `src/lib/mode.js` exporting `IS_DEMO` (from `VITE_APP_MODE`).
- Add a data-access layer, e.g. `src/repo/`, that every page uses instead of importing
  `src/data/*` directly. It needs two implementations:
  - `demo` — wraps the existing `src/data/` modules, with the same behaviour as today
  - `firestore` — reads and writes the live data
- Load the demo implementation with a dynamic `import()` so the live build excludes it.
- Code-split routes with `React.lazy`. Today the build is a single 1 MB JavaScript file.

**Acceptance**
- [ ] No file in `src/pages`, `src/apps` or `src/layout` imports from `src/data/`.
- [ ] Searching the live build output (`dist/`) for `Ramanathan`, `Sri Balaji` and `Iron Temple` finds nothing.
- [ ] The demo build still contains them and works.
- [ ] The live build shows no Vite large-chunk warning.

### WO1-03 · Real date

The date is fixed at 10 Sep 2026 in `src/data/practice.js:45`, and hard-coded in at least:
`Clients.jsx:25`, `Dashboard.jsx:49`, `Notices.jsx:12`, `Tds.jsx:29`, `OwnerApp.jsx:100`,
`EWayBill.jsx:8`, `MyCa.jsx:23`, `NotBuilt.jsx:86`, `VoiceInvoice.jsx:91`.

- Add one `today()` helper. Every date calculation and display uses it.
- Live mode: the real current date in the Asia/Kolkata time zone. Demo mode: keeps 10 Sep 2026.
- Work out the current filing period, quarter and financial year from that date.

**Acceptance**
- [ ] Outside demo data and the helper, a search for `2026-09-10` and `10 Sep` finds nothing.
- [ ] In live mode the calendar opens on the current month.
- [ ] Unit tests cover the financial-year and quarter edges: 31 Mar → 1 Apr, 30 Jun → 1 Jul, 31 Dec → 1 Jan.

### WO1-04 · Data model

Suggested Firestore structure. You may change its shape, but the access rules in WO1-05 must hold.
Record any change in the handoff file and in `review-documents/04-ARCHITECTURE.md`.

```
users/{uid}                                      name, email, phone, consents
firms/{firmId}                                   name, frn, address, city, state
firms/{firmId}/members/{uid}                     role: principal | manager | staff, active
firms/{firmId}/clients/{clientId}                client profile (WO1-07), assignedTo, status
firms/{firmId}/clients/{clientId}/private/notes  internal notes, firm members only
firms/{firmId}/clients/{clientId}/members/{uid}  role: owner | manager | employee, active
firms/{firmId}/clients/{clientId}/docRequests/{requestId}
firms/{firmId}/clients/{clientId}/docRequests/{requestId}/files/{fileId}   metadata; the file itself is in Storage
firms/{firmId}/clients/{clientId}/filings/{obligationKey}                  status, ackNumber, filedOn, filedBy
firms/{firmId}/auditEvents/{eventId}             append-only
invites/{inviteId}                               firmId, clientId?, role, email or phone, invitedBy, expiresAt, usedAt, usedBy
config/dueDates                                  due-date overrides, platform admins only
platformAdmins/{uid}
```

- Every document carries `createdAt`, `createdBy`, `updatedAt` and `updatedBy`, using server timestamps.
- Users must never be able to grant themselves access. Membership is created only by accepting a valid invite, or by creating a new firm (which makes you its principal).
- Note in the README that a real project must use the Firestore location `asia-south1` (Mumbai).

**Acceptance**
- [ ] The architecture document matches the code.
- [ ] Timestamps are server-generated, not taken from the browser clock.

### WO1-05 · Security rules ⚠ blocking task

This is the most important task. **If any of these tests fail, the whole work order fails,
whatever else passes.**

Access matrix:

| Data | Principal | Manager | Staff | Client owner | Client manager | Client employee | Signed out |
|---|---|---|---|---|---|---|---|
| Firm profile | read, edit | read | read | — | — | — | — |
| Firm members and firm invites | manage | read | read | — | — | — | — |
| Client profiles (own firm) | create, edit, archive | create, edit, archive | read | read own client only | read own client only | — | — |
| Client internal notes | read, edit | read, edit | read, edit | — | — | — | — |
| Client members and client invites | manage | manage | read | read own client | — | — | — |
| Document requests | create, edit | create, edit | create, edit | read own client; upload files | read own client; upload files | — | — |
| Filings status | edit | edit | edit | read own client | read own client | — | — |
| Audit events | read; create | read; create | create | create for own client only | create for own client only | — | — |
| Due-date overrides | read | read | read | — | — | — | — |

- Client employees get no access in WO-1. Their access comes with the trade modules later.
- Nobody may update or delete an audit event. An event must name the signed-in user as its actor, and its time must be the server time.
- Only platform admins may write due-date overrides.
- Invites can be read only by the invited email or phone. They are single use, expire after 7 days, and cannot be accepted by anyone else.
- Storage path: `firms/{firmId}/clients/{clientId}/requests/{requestId}/{fileName}`.
  - Read and write access: members of that firm, plus that client's owner and manager.
  - Maximum size: 20 MB.
  - Allowed types: PDF, JPEG, PNG, HEIC, WebP, XLSX, XLS, CSV.
  - Clients cannot delete files after upload; firm principals and managers can.

**Acceptance: `npm run test:rules` passes, with at least these cases:**
- [ ] 1. A signed-out user cannot read or write anything.
- [ ] 2. A member of firm A cannot read firm B's profile, clients, document requests, filings, files or audit events.
- [ ] 3. The owner of client A1 cannot read client A2 in the same firm.
- [ ] 4. A client owner cannot read firm members, the audit log or internal notes.
- [ ] 5. A client owner cannot change their own role or add themselves to another client.
- [ ] 6. Staff cannot invite members or change roles.
- [ ] 7. Nobody, including the principal, can update or delete an audit event.
- [ ] 8. An audit event whose actor is not the signed-in user is rejected.
- [ ] 9. An invite cannot be accepted twice, after it expires, or by a different email or phone.
- [ ] 10. In Storage, client A1 cannot read A2's files; a 21 MB file is rejected; a `.exe` file is rejected.
- [ ] 11. The client employee role is denied everything.
- [ ] 12. A non-admin cannot write `config/dueDates`.

### WO1-06 · Sign-in and invitations

- CA side: email + password, and Google sign-in. Email must be verified before the dashboard opens.
- Client side: phone number with OTP (+91), with email as a fallback.
- Firm signup: create an account → create the firm (name, ICAI firm registration number optional, city, state) → the creator becomes principal.
- Invites:
  - the principal invites staff (email and role)
  - a principal or manager invites a client owner (phone or email) from the client page
- No email or WhatsApp sending in WO-1. Show the invite link with a **Copy** button and a WhatsApp click-to-chat (`wa.me`) button with prefilled text. The screen must say "Share this link", never "Invite sent".
- Sign-out, a session that survives a reload, and a clear screen when the user's access has been removed.
- Remove the "switch staff member" selector in live mode. It stays in demo mode.
- Where users land after sign-in:
  - firm members → the practice dashboard
  - client users → `/app/:clientId` for their own client only
  - any other client id → a "No access" screen (the rules must deny the data as well)

**Acceptance**
- [ ] The inspector can create a firm, invite a staff member, accept the invite in a second browser profile, and see the firm.
- [ ] An owner invite accepted with phone OTP (emulator) lands only on that owner's client app.
- [ ] Changing the URL to another client's id shows "No access".

### WO1-07 · Add clients, and import them from Excel

Profile fields. These drive the compliance engine, so take the field names from `src/data/clients.js`.

- Legal name; short name.
- Constitution: Proprietorship, Partnership, LLP, Private Limited, Public Limited, HUF, Trust, Society.
- PAN.
- GST status: Regular, QRMP, Composition or Unregistered. GSTIN if registered; the state is derived from the GSTIN.
- E-invoice applicable; TDS applicable, with sections.
- PF, ESI, and professional tax (with state).
- Tax audit applicable; company with ROC filings.
- Trade / vertical; assigned staff member; owner name, phone and email.

Validation:
- **Hard errors:**
  - PAN format `AAAAA9999A`
  - GSTIN 15 characters with a valid check digit
  - GSTIN characters 3–12 must equal the PAN
  - the GSTIN state code must exist
- **Warnings only** for business-rule doubts, e.g. QRMP selected for a client whose turnover band is above ₹5 Cr.
- **Duplicates:** the same GSTIN or PAN in the same firm is blocked, with a link to the existing client.

Excel import:
- A downloadable template in `.xlsx` and `.csv`.
- Upload → preview table with errors shown per row → import the valid rows only → summary such as "195 imported, 5 skipped", with the reason for each skipped row.
- Up to 1,000 rows.
- If you use SheetJS, install it from the official SheetJS CDN tarball, **not** the npm package `xlsx@0.18.5`, which has known vulnerabilities.

Clients are archived, never hard-deleted.

**Acceptance**
- [ ] Unit tests for PAN and GSTIN validation, including check-digit failures, with valid and invalid samples.
- [ ] A 200-row file with 5 bad rows imports 195 clients and reports the 5 with reasons.
- [ ] Editing and archiving a client both work and both are audited.

### WO1-08 · Compliance calendar from real profiles

- Reuse the rule logic in `src/data/compliance.js`, separated from the demo-only parts (`LEDGER`, `OVERRIDES`, seeded random numbers).
- Live mode: generate obligations for the previous, current and next month, plus the current quarter, from each client's profile. Status comes from `filings`; the default is "Not started". No amounts are shown unless they come from stored data.
- Due-date overrides (the government often extends due dates):
  - store them in `config/dueDates`, each with form, period, new due date, reason and notification reference
  - an override replaces the default rule
  - the calendar shows an "Extended" badge with the reason
- A simple screen, for platform admins only, to add and edit overrides.

**Acceptance: unit tests prove at least the following:**
- [ ] Monthly Regular client, Karnataka, period Sep 2026: GSTR-1 due 11 Oct 2026, GSTR-3B due 20 Oct 2026.
- [ ] QRMP client, Karnataka, Q2 FY 2026-27: GSTR-1 quarterly due 13 Oct 2026, GSTR-3B quarterly due 22 Oct 2026, PMT-06 due on the 25th for the first two months of the quarter.
- [ ] Composition client: CMP-08 for Q2 due 18 Oct 2026.
- [ ] TDS deposit: due the 7th of the next month, except March, which is due 30 April.
- [ ] An override changes the due date and shows the badge.

### WO1-09 · Replace the fake "File now"

Today `fileReturn` in `src/lib/store.jsx:66` invents a random ARN and shows "filed".

- Live mode: "File now" becomes **"Mark as filed"**. It requires:
  - an acknowledgement number (ARN, challan or acknowledgement; required; 5–30 letters and digits)
  - a filing date (not in the future)
  - optional proof file upload
- It saves to `filings` and writes an audit event.
- "Reopen" requires a reason and is audited. "Mark ready" is saved and audited.
- Demo mode keeps the current behaviour, but the message must read "Demo: no return was filed".

**Acceptance**
- [ ] No live-mode code path generates an acknowledgement number.
- [ ] The status survives a page refresh and shows in another browser.
- [ ] The audit log shows who did it and when.

### WO1-10 · Document requests and real uploads

- The CA creates a request with: client, what is needed, period, number of files expected, due date, an optional linked obligation, and a note.
- The owner sees it in the **My CA** tab with an **Upload** button:
  - camera photo, image, PDF or Excel
  - several files at once
  - a progress bar, and retry on failure
- Files are stored as described in WO1-05, with their metadata saved.
- Request status: Open → Partly received → Received → Accepted, or Returned (with a reason the owner sees).
- CA side: the Documents page and the client page list requests with status and age in days. Files open or download through short-lived links.
- Reminder in live mode: opens WhatsApp click-to-chat (`wa.me`) with a prefilled message and logs "Reminder opened in WhatsApp by <name>". The message must not say "sent".
- Demo mode: change the reminder message to "Demo: no message was sent".

**Acceptance**
- [ ] The owner uploads a 5 MB PDF and 3 photos. The CA sees them in another browser after a refresh.
- [ ] A 25 MB file is rejected with a clear message.
- [ ] A returned request shows its reason to the owner.
- [ ] Every step writes an audit event.

### WO1-11 · Audit log

- Every create or change of firm members, invites, clients, filings, document requests and files writes an append-only event with:
  - actor id, name and role
  - action
  - what changed (target and a short before/after summary)
  - client id where relevant
  - server timestamp
- Principals and managers can view it in the Work inbox, filtered by client, user and date.

**Acceptance**
- [ ] Rules tests 7 and 8 pass.
- [ ] The inspector performs 10 different actions and finds 10 matching events.

### WO1-12 · Live-mode screens and empty states

- **Live navigation shows only working pages:** Dashboard, Calendar, Clients, Client detail, Documents, Work inbox, Team, Settings, Users & access.
- **Hide in live mode (remove from navigation and routes):** GST workspace, ITC vs 2B, TDS & payroll, Direct tax, Notices, Revenue share, Assistant, Integrations, Client apps. For Reports, keep only a CSV export of clients and obligations.
- **Live dashboard:**
  - show: due in the next 7 days, overdue, open document requests, and clients with missing profile details
  - do not show: turnover, tax payable, revenue share, "hours saved" or capture-rate tiles, because there is no data behind them
- **Empty states:** every page needs a designed state for a new firm with zero clients, offering "Add your first client" and "Import from Excel".
- **Owner app in live mode:** only the **My CA** tab. The other tabs return with the trade modules.
- **Demo mode:** add a permanent, clearly visible **"Demo data"** badge to both the practice shell and the owner app shell.

**Acceptance**
- [ ] A new firm sees no sample data anywhere.
- [ ] No number on any live screen is made up; each comes from stored data.

### WO1-13 · Referral share behind a switch

The recurring 20% referral share is waiting on a legal / ICAI opinion.

- Add a feature flag `VITE_FLAG_REFERRAL_SHARE`, **off by default in both modes**.
- When the flag is off, hide:
  - the Revenue share page and its navigation link
  - the dashboard "Your 20% share" tile
  - the share figures on the "no app yet" owner page (`NotBuilt.jsx`)
  - the monthly fee chips on the dashboard client board
  - any wording about commission or TDS section 194H
- When the flag is on (demo only), show today's content.

**Acceptance**
- [ ] With the default settings, neither build shows any referral-share figure or wording.

### WO1-14 · Legal pages and consent

- Pages for Terms of Service, Privacy Policy and the DPDP notice. The placeholder text must be marked **"DRAFT — needs legal review"**.
- Link them from sign-up. Sign-up must record consent (document version and timestamp) on the user record.
- When creating a firm, the principal accepts a data-processing agreement. Store its version and timestamp.

**Acceptance**
- [ ] Sign-up cannot be completed without accepting.
- [ ] The consent is stored with its version and time.

### WO1-15 · Tests, seed data, documents and handoff

- `npm test` and `npm run test:rules` pass.
- `npm run build` and `npm run build:demo` both succeed without warnings.
- `npm run seed` loads the emulators with:
  - 2 firms, each with a principal, a manager and a staff member
  - 3 clients per firm, each with an owner
  - a few document requests and filings
  - write the seed users' test logins in `scripts/SEED-USERS.md` (emulator-only test accounts)
- Update `README.md` and `review-documents/03`, `04`, `05` and `09` to describe live mode and demo mode.
- Write **`inspection/WO-1-HANDOFF.md`** containing:
  - every task ID marked Done, Partly done or Not done
  - every deviation from this work order, and why
  - the exact commands to install, start the emulators, seed, run and test
  - a summary of the test output (number of tests, number passing)
  - known issues and anything that needs the owner's decision

---

## 5. How the inspector will check

1. Read the git history from the baseline commit and review every task commit's diff.
2. Run `npm install`, both builds, `npm test` and `npm run test:rules`.
3. Start the emulators, run the seed, and use the app as:
   - a principal
   - a staff member
   - the owners of two different clients
   - a signed-out visitor

   This includes trying to reach other firms' and other clients' data by URL and through direct database calls.
4. Check that the demo build is unchanged except for the badge, the flag and the "Demo:" messages.
5. Write `inspection/WO-1-INSPECTION.md` with pass or fail for every acceptance box above, and a fix list.

## 6. Decisions the inspector made (the owner may change them)

- Firebase, developed against emulators first. A real project will use `asia-south1` (Mumbai).
- The demo is kept through a build-time mode switch rather than a separate codebase.
- Phone OTP sign-in for client owners. In production this may need Firebase's pay-as-you-go (Blaze) plan.
- The referral-share screens are off by default until the legal opinion arrives.
- **Note for the owner:** the project folder is inside OneDrive. OneDrive syncing a `.git` folder and
  `node_modules` can cause file locks and conflicts. Consider moving the project to a folder that
  OneDrive does not sync (for example `C:\dev\cleanbook`) before development starts.
