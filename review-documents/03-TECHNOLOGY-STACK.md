# Technology Stack

## Front end

| Technology | Version | Purpose |
|---|---:|---|
| React | 19.2.8 | Component-based user interface |
| React DOM | 19.2.8 | Browser rendering |
| React Router DOM | 7.18.2 | Client-side routes and navigation |
| Vite | 8.2.0 | Development server and production build |
| Tailwind CSS | 3.4.19 | Utility-first styling |
| Recharts | 3.10.1 | Dashboard charts |
| Lucide React | 1.28.0 | Interface icons |
| PostCSS | 8.5.25 | CSS processing |
| Autoprefixer | 10.5.4 | Browser-compatible CSS prefixes |

## Prepared backend stack

| Technology | Status | Intended purpose |
|---|---|---|
| Firebase Authentication | Initializer prepared | User sign-in and identity |
| Cloud Firestore | Initializer prepared | Firms, clients, tasks, filings and transactions |
| Firebase Storage | Initializer prepared | Receipts, PDFs, statements and notices |
| Firebase Security Rules | Not implemented | Tenant and role-based data isolation |
| Cloud Functions | Planned | Secure automation, notifications and integrations |

Firebase SDK version: `12.19.0`.

## Current data approach

- Demo master data is stored in JavaScript modules under `src/data/`.
- User actions are stored in React state in `src/lib/store.jsx`.
- Theme and selected practice user are stored in browser `localStorage`.
- Action records disappear on a new browser session or demo reset.
- No production database is currently active.

## Routing and deployment

- Hash-based routing supports static hosting.
- Production files are generated in `dist/` (live build) and `dist-demo/` (demo build).
- The current prototype can be hosted on Firebase Hosting, Cloudflare Pages, Netlify, Vercel or any static web server.

## Browser capabilities

- Browser Web Speech API is used for the voice-invoice prototype when supported.
- Print dialog is used for invoice and E-Way Bill summaries.
- Support and microphone permissions vary by browser.

## Proposed production integrations

- Authorized GST Suvidha Provider for GST, e-Invoice and E-Way Bill APIs.
- WhatsApp Business API for approved notifications.
- OCR/document extraction provider.
- Tally, Zoho Books and Busy imports.
- Banking and payment reconciliation providers.
- Attendance, GPS and telematics providers where required.

