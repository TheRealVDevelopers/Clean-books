# Application Architecture

## High-level design

```text
CA / Auditor Application        Client Business Application
        |                                  |
        +--------- Shared domain ----------+
                          |
          useRepo() — the data-access layer (src/repo)
              |                          |
   demo build: src/data          live build: Firestore
   (session-only actions)        (Firebase Auth, emulators in development)

Production target:
React clients -> Firebase Auth -> Firestore/Storage -> Cloud Functions
                                            -> approved external integrations
```

## Front-end structure

```text
src/
  App.jsx                 Main routing and application provider
  layout/                 CA practice application shell
  pages/                  Practice-side screens
  apps/owner/             Client business application
    panels/               Today, operations, people, money, CA,
                          voice invoice and E-Way Bill
  components/             Shared UI components
  repo/                   Data-access layer: demo and Firestore repositories
  data/                   Seeded demo domain records (demo build only)
  lib/                    Store, build mode, Firebase initializer, dates and formatting
```

## Application boundaries

### Practice side

Routes under the main shell include dashboard, clients, compliance workspaces, documents, assistant, work inbox, integrations, access, revenue and reporting.

### Client side

`/app/:id` renders a separate owner application without the practice sidebar. Branding and operations change according to the selected client and business vertical.

### Two builds, one codebase

The build mode is fixed at build time: `npm run build:demo` or `npm run build` (live). Screens read
data only through `useRepo()`. `src/repo/index.js` loads one repository with a dynamic `import()`:

- **Demo** (`src/repo/demo.jsx`) wraps the sample practice in `src/data/`. Actions such as filing,
  reminders, uploads and invoices are kept in session state (`src/repo/demo-session.js`) and are
  cleared by "Reset demo".
- **Live** (`src/repo/firestore.jsx`) reads the signed-in user's firm, its users and its clients from
  Firestore. It provides empty values for data CleanBook does not store yet. An action that is not
  backed by Firestore yet says so and changes nothing.

`src/repo/contract.js` lists every name a repository provides, and a unit test holds both
implementations to it. Another test checks the import boundaries: only the demo repository imports
`src/data`, and only the live side imports Firebase. As a result, the live bundle carries no sample
data and the demo bundle carries no Firebase code.

Screens that run only on sample data are compiled into the demo build alone: the GST, ITC, TDS,
direct-tax, notices, revenue-share, assistant, integrations and client-applications screens, and the
owner app's tabs other than My CA. Every route is code-split.

### Shared store

`src/lib/store.jsx` holds screen state: theme, the signed-in user, the command bar and toasts. It
also exposes the session actions of the repository in use.

## Production data model proposal

```text
firms/{firmId}
  users/{userId}
  clients/{clientId}
    members/{memberId}
    documents/{documentId}
    transactions/{transactionId}
    invoices/{invoiceId}
    ewayBills/{ewayBillId}
    filings/{filingId}
    tasks/{taskId}
    auditEvents/{eventId}
  referralAgreements/{agreementId}
  payouts/{payoutId}
```

Every record should include `firmId`, `clientId` where applicable, creation/update timestamps, actor identity and lifecycle status.

## Role model

- Platform administrator
- Firm principal
- Firm manager
- Firm staff
- Client owner
- Client manager
- Client employee/driver
- Read-only reviewer

Authorization must be enforced by backend security rules, not only by hidden interface elements.

## Integration architecture

External integrations should run through trusted backend functions. Browser code must never hold GST portal credentials, private provider secrets or unrestricted service keys.

## Audit design

Production statutory and financial actions require an append-only audit record containing actor, timestamp, source, previous status, new status, approval evidence and external response identifier.

