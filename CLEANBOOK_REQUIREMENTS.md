# CleanBook — Product Requirements

## Product purpose

CleanBook connects a CA firm's compliance work with the day-to-day operating systems of its SME clients. A client owner gets a simple view of operations, people and money. The CA gets filing-ready data without chasing it on WhatsApp.

## Users

- **CA principal:** sees the entire practice, reviews filings, notices and risk.
- **CA staff:** owns assigned returns, document requests and reconciliations.
- **Business owner:** sees today's business, uploads documents and approves payments.
- **Business manager / employee:** uses only the operational screens permitted to them.

## Demo scope (now)

- Practice dashboard, client book, GST/TDS/direct-tax workspaces and revenue-share view.
- Custom client application view by business type.
- One-tap purchase / bill capture in the client application.
- Shared document workflow: a client upload changes the CA-side status immediately.
- CA Assistant preview: typed questions return structured answers from the demo data.
- Gamified owner home: business-health score, daily streak, points and action missions.
- Simple-by-default presentation: important actions first; detailed operational numbers stay collapsed until requested.

## Phase 1 — make it a working application

### Started

- Firebase Authentication provider and login screen.
- Protected routes when Firebase is configured; safe demo fallback otherwise.
- Firestore and Storage security-rule foundation.
- Firebase Hosting configuration and documented tenant-aware data paths.

- Firebase Authentication and role-based access.
- Firestore data model for firms, clients, tasks, documents, filings, transactions and messages.
- Firebase Storage for receipt photos, PDFs, bank statements and notices.
- Real purchase capture: camera/upload, OCR extraction, vendor, GSTIN, invoice number, date, tax split and approval state.
- CA task inbox, assignment, review and audit log.
- Notifications by in-app, email and WhatsApp Business API.
- Mobile-first client and employee flows.

## Phase 2 — integrations

- Tally / Zoho Books / Busy imports.
- Bank statement import and reconciliation.
- Payment gateway and UPI settlement reconciliation.
- Biometric attendance, GPS and telematics where applicable.
- e-Invoice, e-Way Bill and GST filing through an authorised GSP.

## Phase 3 — AI Assistant

- Chat across permitted client data only.
- Questions such as: “Prepare Balaji's August GST pack”, “What is missing for 3B?”, “Show 2B mismatches”, “Draft a client reminder”.
- Answers must cite source records, show the period used and require human CA review before any filing or external action.
- AI may prepare, explain and classify; it must not file a return or send a statutory submission without CA approval.

## Guardrails

- Never hard-code credentials or use GST-portal scraping.
- Every statutory action needs a CA review/approval state and immutable audit log.
- Data isolation is mandatory: one firm cannot view another firm's data; a client cannot view another client's data.
- The recurring CA referral-share model needs ICAI/legal review before being treated as final commercial policy.
