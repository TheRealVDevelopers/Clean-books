# Local Setup and Demo Guide

## Prerequisites

- Node.js compatible with Vite 8.
- npm.
- A modern browser.

## Install and run

```bash
npm install
npm run dev
```

Open the local address shown by Vite. The current development setup commonly uses:

```text
http://localhost:5185
```

## Production build

```bash
npm run build
npm run preview
```

The deployable static output is written to `dist/`.

## Firebase configuration

Copy `.env.example` to `.env` and provide the Firebase Web App values:

```text
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
```

Providing these values only initializes Firebase. The current workflows still use the demo store until repository actions are connected to Firestore and Storage.

## Suggested review walkthrough

1. Open `/` and inspect practice deadlines and blockers.
2. Open `/clients` and select Sri Balaji Transports.
3. Open `/app/CL-02` to enter Balaji FleetDesk.
4. Review the simplified Today screen and Fleet operations.
5. Open Voice bill, use the sample command and create the demo invoice.
6. Open E-Way Bill, review validations and prepare the demo record.
7. Open Money and capture a demo purchase.
8. Open My CA and send a requested document.
9. Return to `/documents` and `/inbox` to observe the CA-side workflow.
10. Review `/revenue`, `/integrations` and `/access`.

## Useful routes

| Route | Purpose |
|---|---|
| `/#/` | Practice dashboard |
| `/#/clients` | Client portfolio |
| `/#/clients/CL-02` | Transport client profile |
| `/#/app/CL-02` | Balaji FleetDesk client application |
| `/#/documents` | Document workflow |
| `/#/inbox` | CA work inbox |
| `/#/assistant` | CA Assistant preview |
| `/#/revenue` | Referral revenue demonstration |
| `/#/integrations` | Integration plan |
| `/#/access` | Access model |

## Demo reset

Use **Reset demo** from the practice application to clear session actions and return to the original demonstration state.

