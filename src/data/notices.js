// Notices, demands and departmental correspondence. Every one of these carries
// a hard reply date, and missing one is the single most expensive thing that
// can happen in a practice — so they get their own screen and their own count
// on the dashboard.

export const NOTICES = [
  {
    id: 'NT-01', clientId: 'CL-04', authority: 'GST', form: 'ASMT-10',
    ref: 'ZA290826041182K', receivedOn: '2026-09-06', replyBy: '2026-10-06',
    period: 'FY 2024-25', amount: 214000, status: 'Reply Drafted', assignee: 'ST-2',
    summary: 'Scrutiny of returns — ITC claimed in 3B exceeds the credit available in 2B by ₹2.14 L for the year.',
    ourPosition: 'The gap is entirely credit on invoices filed by vendors in a later month, all of which appeared in the following period. Working with a month-wise reconciliation is ready.',
    risk: 'Low',
  },
  {
    id: 'NT-02', clientId: 'CL-07', authority: 'GST', form: 'GSTR-3A',
    ref: 'ZA290926010047T', receivedOn: '2026-09-04', replyBy: '2026-09-19',
    period: 'Jul 2026', amount: null, status: 'Open', assignee: 'ST-4',
    summary: 'Default notice for non-filing of GSTR-3B for Jul 2026. Return must be filed within 15 days or assessment proceeds under section 62.',
    ourPosition: 'Cannot be answered until the Tally backup arrives. Client has been reminded three times since 22 Aug. Escalate to the proprietor directly.',
    risk: 'High',
  },
  {
    id: 'NT-03', clientId: 'CL-02', authority: 'Income Tax', form: '143(1)(a)',
    ref: 'CPC/2526/AF/1184620', receivedOn: '2026-08-28', replyBy: '2026-09-27',
    period: 'AY 2025-26', amount: 186400, status: 'Reply Drafted', assignee: 'ST-2',
    summary: 'Proposed adjustment — disallowance of ₹1.86 L of freight expense for want of TDS under section 194C.',
    ourPosition: 'TDS was deducted and deposited, but against the wrong section code in the 26Q. Correction statement filed 02 Sep; the response will carry the revised TDS certificate.',
    risk: 'Medium',
  },
  {
    id: 'NT-04', clientId: 'CL-03', authority: 'GST', form: 'DRC-01A',
    ref: 'ZA290726038819M', receivedOn: '2026-07-30', replyBy: '2026-09-14',
    period: 'FY 2023-24', amount: 96800, status: 'Hearing Fixed', assignee: 'ST-1',
    summary: 'Intimation of tax ascertained — ITC on capital goods claimed while paying tax at 5% under the restaurant scheme.',
    ourPosition: 'The department is right on principle. Recommend paying ₹96,800 with interest under DRC-03 to close it, rather than contesting. Owner has agreed in writing.',
    risk: 'Medium',
  },
  {
    id: 'NT-05', clientId: 'CL-08', authority: 'PF', form: '7A Enquiry',
    ref: 'KN/BNG/45102/2026', receivedOn: '2026-08-19', replyBy: '2026-09-24',
    period: 'FY 2024-25 to FY 2025-26', amount: 342000, status: 'Open', assignee: 'ST-2',
    summary: 'Enquiry into non-coverage of site labour engaged through a contractor. Provident fund dues of ₹3.42 L plus damages estimated.',
    ourPosition: 'Contractor labour was covered under the contractor’s own code for 14 of 22 months. Gathering the contractor’s ECR copies for the remaining period.',
    risk: 'High',
  },
  {
    id: 'NT-06', clientId: 'CL-12', authority: 'Income Tax', form: '133(6)',
    ref: 'ITBA/133/2026/44118', receivedOn: '2026-09-01', replyBy: '2026-09-30',
    period: 'AY 2025-26', amount: null, status: 'Replied', assignee: 'ST-2',
    summary: 'Information called for on marketplace sales — reconciliation of turnover reported in GST returns against 26AS TCS credits under 194-O.',
    ourPosition: 'Replied 08 Sep with a month-wise statement mapping GST turnover, marketplace settlement reports and 26AS. Difference of ₹1.14 L is returns and cancellations, explained line-wise.',
    risk: 'Low',
  },
  {
    id: 'NT-07', clientId: 'CL-05', authority: 'GST', form: 'ADT-01',
    ref: 'ZA290626022714Q', receivedOn: '2026-06-24', replyBy: '2026-09-30',
    period: 'FY 2022-23 & 2023-24', amount: null, status: 'Hearing Fixed', assignee: 'ST-1',
    summary: 'Departmental audit under section 65. Records for two years called for; hearing listed 30 Sep at the Jayanagar division office.',
    ourPosition: 'Books, invoices and the margin-scheme workings compiled for both years. Main exposure is the split between tour-operator margin supplies and pure agent commission.',
    risk: 'Medium',
  },
  {
    id: 'NT-08', clientId: 'CL-10', authority: 'GST', form: 'CMP-05',
    ref: 'ZA290826017730X', receivedOn: '2026-08-11', replyBy: '2026-09-11',
    period: 'FY 2026-27', amount: null, status: 'Reply Drafted', assignee: 'ST-3',
    summary: 'Show cause why the composition option should not be denied — turnover reported for Q1 suggests the ₹1.5 Cr ceiling will be crossed.',
    ourPosition: 'Q1 turnover is within the limit. Reply confirms the position and states that the dealer will opt out voluntarily from 01 Oct 2026 if the run-rate holds. Due tomorrow.',
    risk: 'High',
  },
]

export const noticesForClient = (id) => NOTICES.filter((n) => n.clientId === id)
export const openNotices = () => NOTICES.filter((n) => !['Closed', 'Dropped'].includes(n.status))
export const noticeExposure = () => NOTICES.reduce((s, n) => s + (n.amount || 0), 0)

export const AUTHORITY_TONE = {
  GST: 'brand', 'Income Tax': 'info', PF: 'warn', ESI: 'warn', MCA: 'mute',
}
