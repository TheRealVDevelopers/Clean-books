# Production Roadmap

## Phase 0 — review and definition

- Confirm the first production customer and business vertical.
- Freeze minimum viable scope.
- Validate GST, E-Way Bill and referral commercial requirements.
- Produce final data model and permission matrix.
- Approve UI flows with a practising CA and client owner.

## Phase 1 — production foundation

- Firebase Authentication and role onboarding.
- Firestore repositories replacing demo state.
- Firebase Storage for documents and receipts.
- Firm/client tenant isolation and security rules.
- Persistent tasks, messages and audit events.
- Error monitoring, analytics, backups and environments.
- Responsive mobile client workflows.

## Phase 2 — accounting workflow

- Real invoice and purchase records.
- Camera upload and OCR extraction.
- Vendor/customer masters and GSTIN validation.
- Ledger mapping and accounting review queue.
- Bank statement import and reconciliation.
- Tally/Zoho Books/Busy export or synchronization.

## Phase 3 — statutory integrations

- Select authorized GSP/ASP.
- e-Invoice generation and cancellation.
- E-Way Bill generation, update, extension and cancellation.
- GST return data preparation and controlled filing workflow.
- Provider acknowledgements and retry handling.
- Maker-checker approval and immutable audit evidence.

## Phase 4 — communication and automation

- In-app notification center.
- Email notifications.
- Approved WhatsApp Business templates.
- Escalations, reminders and SLA tracking.
- Client document requests linked to filing tasks.

## Phase 5 — AI assistant

- Retrieval over authorized client data.
- Source-cited GST and reconciliation answers.
- Draft reminders, explanations and work summaries.
- Human approval for every external action.
- Evaluation suite for accuracy, leakage and unsafe automation.

## Phase 6 — custom business modules

- Repeatable module framework by vertical.
- Transport production module first: trips, PODs, fleet documents, driver expenses and E-Way Bills.
- Configuration layer to customize workflows without duplicating the entire application.
- Onboarding templates, migration tools and support dashboard.

## Suggested MVP acceptance criteria

- Two firms cannot access each other's data.
- A client can access only its own business records.
- A document upload is immediately visible to authorized CA staff.
- Every status change records actor and timestamp.
- Invoice and purchase records persist across sessions.
- E-Way Bill preparation passes validation and requires approval before API submission.
- Production actions have clear success, failure and retry states.

