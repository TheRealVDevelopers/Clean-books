# CleanBook Product Direction

This document converts the shared CleanBook Business Review into implementation priorities.

## Positioning

CleanBook is an operations system for operations-heavy SMEs that produces accounting and compliance-ready data for their accountant.

**Owner message:** Your business runs on it. Your CA files from it.

**Accountant message:** See which clients can file today, without chasing anyone.

CleanBook is not intended to replace Tally or established CA filing software. It should feed those systems with cleaner data.

## Initial market

- First trade: transport and logistics.
- First city: Bengaluru.
- Initial clusters: Peenya, Yeshwanthpur and Hosur Road.
- Target business: ₹5–50 Cr turnover, 15–150 staff, owner-operated and currently dependent on Tally, Excel and WhatsApp.
- Target channel: accounting firms with 3–20 staff and 100–400 business clients, plus non-CA tax practitioners and bookkeeping firms.

## Commercial direction

- Charge a setup fee for implementation.
- Charge monthly subscription/support separately.
- Price custom change requests separately.
- Offer annual prepayment and automated collection later.
- Do not implement or promote recurring CA commission until written ICAI/legal advice approves a structure.
- Prefer value for CA firms: free dashboard, clean client data and reduced chasing.

## Product priorities

1. Authentication, role-based access and tenant isolation.
2. Real Firestore data and Firebase Storage.
3. Append-only audit logs, backups, monitoring and tests.
4. Firm, staff and client onboarding.
5. Transport trip sheets, LR records, POD capture, driver advances and vehicle-document expiry.
6. Tally import/export and GSTR-1 preparation/export.
7. Secure WhatsApp/email document-request links.
8. GST invoice PDFs and E-Way Bill preparation.
9. Authorized GSP integration later.

## Architecture rule

New clients must be configured rather than rebuilt. Target at least 80% shared code and under two weeks to launch a client after the transport module stabilizes.

## Deferred features

- Connected AI assistant.
- Advanced voice invoicing.
- Expanded gamification.
- Live bank feeds.
- Biometric, GPS and telematics integrations.
- Additional business verticals before transport is repeatable.

## 90-day validation

Continue investment only if the pilot achieves:

- At least three paying transport clients.
- A new client implementation in under three weeks.
- Partner accountants use the dashboard weekly.
- Document chasing or bookkeeping-close time measurably decreases.

