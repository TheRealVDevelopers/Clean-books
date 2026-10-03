# Features and Workflows

## Practice-side application

### Portfolio management

- Practice dashboard with deadlines, blockers and client readiness.
- Complete client book and Client 360 profile.
- Compliance calendar generated from client registrations.
- Team workload and assignment views.
- Reports and operational registers.

### Tax and compliance

- GST workspace and filing readiness.
- ITC versus GSTR-2B reconciliation demonstration.
- TDS, payroll, PF, ESI and professional-tax tracking.
- Direct tax, advance tax, audit and ROC tracking.
- Notices, demands, reply dates and risk position.
- Document chase queue and client reminders.

### Work management

- Work inbox for document requests, filing reviews and purchase approvals.
- Task completion and in-session audit events.
- User and access-role demonstration.
- Integrations roadmap page.

### Revenue-share management

- Referred clients and monthly recurring fees.
- Proposed 20% share calculation.
- Payout history, projections and referral pipeline.
- Commercial and professional-compliance warning.

### CA Assistant preview

- Chat-style interface.
- Demo questions for GST packs, missing data and 2B mismatches.
- Structured answers generated from local demo records.
- Human review is required before any statutory action.

## Client-side application

### Today

- Business health score.
- Daily missions, streak and reward points.
- Three important indicators by default.
- Compliance and owner actions shown in plain language.

### Custom operations

- Different operational views for each business vertical.
- Transport example includes vehicles, drivers, trip status, documents and PODs.
- Other examples include gym members, restaurant operations, manufacturing job cards, construction sites and ecommerce orders.

### People

- Employee list and role.
- Attendance, check-in, check-out and current status.
- Salary, overtime, advance and payroll summary.

### Money

- Collections, bank and cash position.
- Receivables ageing and payables.
- Purchase and bill capture demonstration.
- CA review status.

### Voice invoice

1. User speaks or types an instruction.
2. The application extracts customer, phone, item, quantity, rate, GST and due date.
3. User reviews and edits the invoice.
4. CGST/SGST or IGST is calculated.
5. User confirms creation.
6. A printable invoice summary is produced.

The current prototype uses browser speech recognition when available. It does not automatically send an invoice.

### E-Way Bill preparation

1. Invoice and customer data are prefilled.
2. Goods, HSN, route, distance, vehicle and transporter details are entered.
3. GSTIN, HSN and vehicle formats are checked.
4. Expected validity is calculated.
5. A demo E-Way Bill record and printable summary are prepared.

The prototype does not submit data to the E-Way Bill portal. Production submission requires an authorized GSP or approved API provider.

### My CA

- Pending information requested by the practice.
- Plain-language return status.
- One-tap demo document submission.
- Filing deadlines and amounts payable.

## Shared workflow demonstration

A document submitted from the client application updates the CA-side status in the shared React store. This demonstrates the desired two-sided workflow, although permanent storage and real-time multi-user synchronization require Firebase implementation.

