# Application Architecture

## High-level design

```text
CA / Auditor Application        Client Business Application
        |                                  |
        +--------- Shared domain ----------+
                          |
                 React application state
                          |
             Demo JavaScript data modules

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
  data/                   Seeded demo domain records
  lib/                    Store, Firebase initializer, dates and formatting
```

## Application boundaries

### Practice side

Routes under the main shell include dashboard, clients, compliance workspaces, documents, assistant, work inbox, integrations, access, revenue and reporting.

### Client side

`/app/:id` renders a separate owner application without the practice sidebar. Branding and operations change according to the selected client and business vertical.

### Shared store

`src/lib/store.jsx` is the current workflow bridge. It manages demo actions including document receipts, task states, missions, invoices, E-Way Bills, audit events and notifications.

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

