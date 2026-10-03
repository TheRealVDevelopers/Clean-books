# Reference policy — using Hisaabo as a reference

| | |
|---|---|
| Issued by | Inspector (Claude) |
| Issued on | 3 October 2026 |
| Applies to | Every work order from now on |
| Reference project | [hisaabo/hisaabo](https://github.com/hisaabo/hisaabo) · [hisaabo.in](https://hisaabo.in) |

## Why this policy exists

Hisaabo uses the **O'Saasy License**. Clause 1 forbids using the software, or any derivative work, to offer a
hosted commercial service that competes with it. Hisaabo sells managed hosting to CA firms and businesses, so
CleanBook is a competitor. Any CleanBook code derived from Hisaabo's code would breach that license.

We may learn **what** to build from Hisaabo. We may not take **how it is written**.

## Rules for the development agent

### Allowed
1. Read Hisaabo's README, its website, and its user documentation (`apps/docs`, `apps/api-docs`) to learn **which features exist and how they behave for a user**.
2. Use that to decide on features, screens and edge cases to handle, in your own words and your own design.
3. Implement every tax, GST or file-format rule from the **official public sources** listed below.

### Not allowed
1. Opening or reading Hisaabo's source code: anything under `packages/*/src`, `apps/*/src`, its tests, or its data files.
2. Copying, translating or "adapting" any Hisaabo code, test, schema, type definition, comment or data file. This includes rewriting it in JavaScript or for Firebase.
3. Copying text from its documentation into CleanBook's screens or documents.
4. Using its compiled data, such as its HSN code list. Download the official list from the government source instead.
5. Using its npm packages (`@hisaabo/cli`, `@hisaabo/mcp`) or its Docker image in CleanBook.

If a task seems to need Hisaabo's code, **stop and record it in the handoff file**. Do not work around this rule.

## Official sources to build from

| Feature | Build it from |
|---|---|
| GSTIN format and check digit, state codes | GSTN's published GSTIN structure and state code list |
| HSN and SAC codes | CBIC's official HSN/SAC list (cbic-gst.gov.in) |
| GSTR-1 export file | GSTN's GSTR-1 JSON schema (GST developer portal / GST offline tool) |
| GSTR-2B import and matching | GSTN's GSTR-2B JSON schema, plus files the CA downloads from the GST portal |
| Due dates and extensions | CBIC notifications. Store the notification number with each override |
| E-invoice (later) | NIC e-invoice (IRP) API and schema documentation |
| E-way bill (later) | NIC e-way bill API documentation |
| Tally export | Tally Solutions' official XML integration documentation |
| Bank statement import | Real sample statements from the banks your pilot clients use |

Record the source (document name, version, link) in a comment at the top of each module that implements one of these rules.

## Which Hisaabo features fit CleanBook

CleanBook's agreed position is **operations software that feeds clean data to the CA's existing tools**.
It does not replace Tally or the CA's filing software. That decides what we take inspiration from:

| Feature seen in Hisaabo | For CleanBook | When |
|---|---|---|
| GSTIN check-digit validation | Yes | WO-1 (already required) |
| Append-only audit trail | Yes | WO-1 (already required) |
| GSTR-2B import and mismatch list | Yes. A CA can start using it on day one without any client app | Next stage |
| Bank statement import | Yes, for the CA's reconciliation chase | Next stage |
| Tally XML export | Yes. This is how CA firms receive the books | Next stage |
| GSTR-1 JSON export for the CA's filing tool | Yes | With the transport module |
| Invoice numbering per financial year, party ledger, receivables ageing | Yes, inside the owner's app | With the transport module |
| HSN lookup | Yes, from the official list | With the transport module |
| E-invoice and e-way bill through a GSP | Later | After pilot clients |
| Full double-entry books, period close, P&L and balance sheet | **No.** That is Tally's and the CA's job | Only if the owner changes CleanBook's positioning |
| GSTR-3B and GSTR-9 return preparation, ITC utilisation order | **No.** That is the CA's filing tool's job | Same |
| Inventory valuation, payment gateways, AI agent/MCP layer | **No**, not now | Same |

## How the inspector will check

At every inspection:
1. Compare new CleanBook code against Hisaabo's repository for copied or closely translated code (similarity scan).
2. Check that each tax or file-format module names its official source.
3. Check that no Hisaabo package, data file or text appears in CleanBook.

Any copied code fails the inspection and must be removed and rewritten from the official source.
