# Product Readiness Assessment

## Executive summary

CleanBook is currently a strong clickable sales prototype, not a production application.

- Sales/discovery demo readiness: approximately **80%**.
- Real product readiness: approximately **15–20%**.
- The interface, workflows, compliance-calendar logic and domain demonstrations are reusable.
- Authentication, permanent storage, tenant isolation, real documents and integrations must be implemented before accepting real client data.

## What the prototype currently simulates

| Interface behaviour | Current implementation |
|---|---|
| CA firm, clients and staff | Fictional JavaScript records in `src/data/` |
| Current compliance date | Fixed demonstration date |
| Filing action | Local status update and fictional ARN |
| WhatsApp reminder | In-app notification only |
| Client document upload | Demo status change; no file storage |
| Firebase | SDK initializer exists; workflows do not use it |
| Login and roles | Demonstration screens; no authentication |
| Saved actions | React session state; no permanent database |

## Reusable work

- Practice and client-side interface system.
- Compliance-calendar rules based on registration profiles.
- GST and dashboard calculations used by the prototype.
- E-Way Bill format checks.
- Shared components and per-business operations tables.
- Two-sided CA/client workflow design.
- Transport-client concept and workflows.

## Stage 1 — secure foundation

**Indicative duration with 2–3 developers: 6–8 weeks.**

1. Firebase Authentication and invitations.
2. Server-enforced firm/client data isolation.
3. Firestore repositories replacing demonstration data.
4. Empty states for new firms.
5. Firm, staff and client onboarding.
6. Bulk client import from Excel.
7. Firebase Storage uploads.
8. Real dates and controlled due-date overrides.
9. Permanent activity and approval logs.
10. Test/live environments, backups, monitoring and automated tests.
11. Terms, privacy, DPDP notice, consent and data agreements.

## Stage 2 — useful for a CA before custom apps

**Indicative duration: 4–6 weeks.**

1. Tally and Excel sales/purchase imports.
2. Bank-statement imports.
3. Downloaded GSTR-2B import and real ITC matching.
4. Secure document-request upload links.
5. WhatsApp click-to-chat and email reminders.
6. Replace filing simulation with **Mark as filed** and real ARN entry.
7. Live calendar, task assignment and reminders.

## Stage 3 — production transport application

**Indicative duration: 6–8 weeks.**

1. Mobile-first installable application.
2. Trip sheets and lorry receipts.
3. POD photo capture.
4. Vehicle-document expiry alerts.
5. Driver advances, fuel and trip expenses.
6. GST invoice masters, financial-year numbering and PDF generation.
7. Purchase-bill capture; OCR after the base workflow is stable.
8. Tally export.
9. Production My CA workflow.

## Stage 4 — platform administration

**Indicative duration: 2–3 weeks.**

1. Platform administration panel.
2. Firm and module provisioning.
3. Usage and support visibility.
4. Subscription billing and GST invoices.
5. Partner tracking based on an approved commercial structure.

## Later features

- Direct GST filing through a GSP.
- Live E-Way Bill API submission.
- Connected AI assistant.
- Advanced voice invoicing.
- Live bank feeds.
- Biometric, GPS and telematics integrations.
- Expanded gamification.

## Indicative delivery outcome

- **Around month 3:** controlled use by a design-partner CA after Stages 1 and 2.
- **Around months 4–6:** target the first production transport client after Stages 3 and 4.

These are planning estimates, not delivery commitments. Timing depends on final scope, team experience, security review, integration providers and feedback turnaround.

## Immediate recommendation

Use the prototype for CA discovery meetings. Do not accept real client documents or represent filing, messaging, AI, E-Way Bill or Firebase workflows as live until the respective production stages are complete.

