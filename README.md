# CleanBook — the practice dashboard, and the apps its clients run on

> **Application review:** Start with [`review-documents/00-START-HERE.md`](./review-documents/00-START-HERE.md) for the complete product, technology, architecture, security, setup and roadmap review pack.

A working prototype of **both sides** of CleanBook:

1. **The practice side** — one place where a CA manages the whole client book, and one page where
   they manage the 20% revenue share they earn for introducing those clients to The Real V
   Developers. Free forever for the practice.
2. **The client side** — the custom application Real V built for each of those businesses. Eight
   clients, eight different apps: a gym gets members and renewals, a transporter gets trucks and
   PODs, a factory gets job cards and machine downtime. Same shell, nothing else in common.

The two are wired together. A document request raised on the practice side appears in the owner's
own app; when he sends it, the practice's chase list, filing readiness and dashboard counters move
on their own. Open `/#/app/CL-02`, send the two pending items, then look at
`/#/documents` — 14 open becomes 12.

```bash
npm install
npm run dev      # http://localhost:5185
```

Everything is demo data. Filing and reminder actions change the screen for the session only —
nothing is sent to any portal. "Reset demo" in the sidebar puts it all back.

For Firebase later: copy `.env.example` to `.env`, add your Firebase web-app values, then replace the session-store actions in `src/lib/store.jsx` with Firestore and Storage writes. The Firebase initializer is already in `src/lib/firebase.js`.

---

## The story the demo tells

The fixed date is **10 September 2026**. Aug-2026 GST is the live filing period, so:

- **GSTR-1 falls due tomorrow** (11 Sep). 4 of 9 monthly clients can file today.
- GSTR-3B follows on the 20th with ~₹21 L of tax to pay across the book.
- Advance tax Q2 is due the 15th, PF/ESI the 15th, PT the 20th, tax audit reports the 30th.
- Four filings are already overdue — and **every one belongs to a client whose data still
  arrives by hand.**

That last line is the pitch. Eight of the twelve clients run a custom application Real V built
for their specific business, so their books arrive in CleanBook by themselves. The other four
are on the free tier, and they are the source of every overdue return, every chase message and
every notice in the practice.

## The twelve clients

| Client | Trade | Turnover | Data | Real V |
|---|---|---|---|---|
| Precision Auto Components | Auto component mfg | ₹11.8 Cr | Auto | ₹50,000/mo |
| Sri Balaji Transports | Goods transport (GTA) | ₹6.2 Cr | Auto | ₹30,000/mo |
| BuildRight Interiors | Interior fit-out | ₹4.1 Cr | Auto | ₹28,000/mo |
| Anand Bhavan Grand | Restaurant | ₹3.4 Cr | Auto | ₹22,000/mo |
| Sharada Medicals | Pharmacy retail | ₹2.6 Cr | **Tally pen drive** | Proposal sent |
| UrbanKart Retail | D2C e-commerce | ₹2.2 Cr | Auto | ₹20,000/mo |
| Wanderlust Travels | Travel agency | ₹1.9 Cr | Auto | ₹18,000/mo |
| Nandi Agro Traders | Agri commodity | ₹1.4 Cr | **Bill book** | Free tier |
| Zenith Coaching Academy | Test-prep coaching | ₹1.15 Cr | **Excel** | Build in progress |
| Iron Temple Fitness | Gym | ₹1.05 Cr | Auto | ₹10,000/mo |
| Kaveri Dental Care | Dental clinic (GST exempt) | ₹92 L | **Spreadsheet** | Discovery done |
| Glow & Go Salon | Salon chain, QRMP | ₹78 L | Auto | ₹12,000/mo |

Deliberately mixed so the compliance engine has to cope with real variety: regular monthly,
QRMP, composition, unregistered-and-exempt, e-invoicing, company/LLP/partnership/HUF/proprietor,
tax-audit and non-audit cases.

## Pages

| Route | What it is |
|---|---|
| `/` | **Dashboard** — the five-minute view. What's due, what's blocked, what needs a decision, what arrived on its own, and the practice inbox. |
| `/calendar` | **Compliance calendar** — a month grid of every statutory date, generated from each client's registration profile. Filter by head or by staff member. |
| `/clients` | **Client book** — the whole list with turnover, scheme, readiness, next obligation, owner and Real V status. |
| `/clients/:id` | **Client 360** — registration profile, *live operating snapshot of the business*, compliance history, GST ledger, ITC, documents, notices, and the application Real V built for them. |
| `/documents` | **Data & documents** — the chase queue, with turnaround by channel (9 hours through a client's own app against 96 on WhatsApp). |
| `/assistant` | **CA Assistant preview** — type “Prepare August GST pack”, “What is missing for GSTR-3B?” or “Show 2B mismatches”; it turns the current demo records into a review-ready work summary. It is rule-based in this demo, not AI yet. |
| `/inbox` | **Work inbox** — document chase, filing reviews, purchase approval and an in-session audit trail. |
| `/integrations` | **Integrations & automation** — Firebase, accounting, bank, WhatsApp, GSP, OCR, biometric and GPS connection plan. |
| `/access` | **Users & access** — the CA, staff, owner and employee role model for Firebase enforcement. |
| `/gst` | **GST workspace** — one screen for the whole book: output tax, ITC, RCM, cash payable, readiness, file actions. |
| `/itc` | **ITC vs GSTR-2B** — line-by-line mismatches with the reason and the action for each. |
| `/tds` | **TDS & payroll** — monthly challans, quarterly 26Q/16A, PF, ESI and Karnataka PT. |
| `/direct-tax` | **Direct tax, audit & ROC** — advance tax built from live turnover, 44AB tracker, ITRs, MCA filings, GSTR-9/9C. |
| `/notices` | **Notices & demands** — every departmental letter with its reply date, amount at stake and our position. |
| `/revenue` | **Revenue share** — the 20%. See below. |
| `/team` | **Team & workload** — hours against capacity, per person, per client. |
| `/reports` | **Reports** — the six registers a practice actually has to produce, each one a CSV click. |
| `/apps` | **Client applications** — the gallery of what each client runs, live, being built, or not built yet. |
| `/settings` | Firm profile, portal connections, alert preferences, the referral agreement. |

## The client side — `/app/:clientId`

Its own chrome, its own colour per business, no practice sidebar. Five tabs:

| Tab | What the owner gets |
|---|---|
| **Today** | A gamified five-minute screen: one business-health score, streak, points and four daily missions. Only three important numbers show by default; detailed operations stay collapsed until the owner asks for them. |
| **Operations** | The tab that differs per business: *Members* (plans, renewals, dues, PT slots) · *Fleet* (every truck, driver, position, papers, PODs blocking billing) · *Service* (covers by hour, kitchen wait, store and wastage) · *Plant* (job cards, stages, machine downtime) · *Bookings* · *Chairs* · *Sites* · *Orders*. |
| **My people** | Headcount, who checked in and out and when, "still in" for anyone who hasn't punched out, days worked, overtime, advances, salary — and the month's payout with PF, ESI and PT, ready to approve. |
| **Money** | Cash and bank against what's committed, billed vs collected, receivables ageing, payables, and a one-tap bill / purchase capture flow for the CA to review. |
| **My CA** | What the accountant is waiting for, with a **Send** button. Every return with a plain-English status ("Filed for you", "With your CA, ready to go", "Waiting on you"), what has to be paid and when, and the accountant's direct number. |

For the four clients with no app yet, `/app/:id` shows the **case for building one** instead: how
far behind the books are, how many documents are being chased, overdue filings, open notices, the
modules Real V would build, the fee, and what it adds to the CA's share. That page is a sales
artifact — it is what the CA shows the owner.

## The revenue share page

The page the whole arrangement lives or dies on.

- **₹1,90,000** — what Real V collects this month from the eight referred clients.
- **₹38,000** — the practice's 20%, accruing, payable 7 Oct.
- **₹44,080** — what actually reaches the bank: +18% GST on the commission, −2% TDS u/s 194H.
- **₹2,13,400** — received across seven payouts since Feb 2026.
- **₹4,56,000** — annual run-rate today; **₹6,33,600** if the whole pipeline closes.

Tabs: per-client contribution, payout history with UTRs and downloadable statements, the
pipeline (four existing clients plus two outside referrals — ₹74,000/mo of fees, ₹14,800/mo of
share, ₹8,550 weighted by confidence) with a twelve-month projection, and a plain-terms
explanation of how the arrangement works.

It also carries an honest warning. An ongoing revenue-linked arrangement between a vendor and a
practising member needs to be tested against the **Chartered Accountants Act, 1949 (First
Schedule, Part I)** — clause 2 on sharing fees and clause 3 on receiving a share of profits of a
business — before it is signed. The safer structures, if the position turns out to be doubtful,
are a one-time introduction fee or routing the arrangement through a separate non-practising
entity. Better to raise that in the pitch than to have a CA raise it for you.

## How it's built

- React 19 + Vite + Tailwind, `recharts` for charts, `lucide-react` for icons. No backend.
- Hash routing, so `dist/` can be dropped on any static host.
- Light and dark themes off CSS variables (`data-theme` on `<html>`).
- [CLEANBOOK_REQUIREMENTS.md](./CLEANBOOK_REQUIREMENTS.md) contains the product scope: Firebase foundation, integrations and the AI-assistant guardrails.

```
src/
  data/
    practice.js     firm, staff, the fixed "today" and current filing period
    clients.js      the twelve client profiles + the advisory watchlist
    periods.js      18 months of generated month-end numbers, seeded per client
    compliance.js   the obligation engine — rules in, calendar out
    recon.js        ITC-vs-2B lines and the document chase queue
    notices.js      departmental correspondence
    ops.js          live business snapshots per client + the practice inbox
    revenue.js      the 20% share: months, payouts, per-client, pipeline, projection
    business.js     the client side: brand accent per app, staff and attendance,
                    cash position, and the per-trade operations module
  apps/owner/       the client-side app — shell, one generic table renderer, and
                    five panels (Today, Operations, People, Money, My CA) plus the
                    "no app yet" sales page
  lib/
    dates.js        Indian tax-period arithmetic (FY, quarters, due dates)
    rng.js          seeded generator — the demo reads identically on every reload
    derive.js       every aggregate the screens use
    status.js       one place that decides what colour a status is
    store.jsx       theme, signed-in staff member, session actions, toasts
  pages/            fourteen screens
```

Nothing on the compliance calendar is typed in. Each client's registration profile — regular,
QRMP, composition, PF, ESI, PT, company or firm, audit or not — decides which forms apply and
when. Change a client's scheme in `clients.js` and the calendar, the workload split and the
dashboard counters all rewrite themselves.
