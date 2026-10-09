// What every repository provides through useRepo(). Screens rely on these
// names and nothing else, and a unit test holds both implementations to them.
// Where live mode has no data for something yet, it provides an empty value.

export const REPO_KEYS = [
  // the practice
  'FIRM', 'STAFF', 'staffById', 'PORTALS', 'TODAY', 'CURRENT_PERIOD',
  // the client book
  'CLIENTS', 'clientById', 'WATCHLIST',
  // month-end figures per client
  'LEDGER', 'PERIOD_KEYS',
  // compliance obligations
  'OBLIGATIONS', 'daysLeft', 'openObligations', 'overdueObligations', 'dueWithin', 'forClient', 'estimatedTax',
  // ITC reconciliation and the document chase
  'ITC_ROWS', 'itcTotals', 'DOC_REQUESTS', 'CHASE_STATS',
  // departmental notices
  'NOTICES', 'openNotices',
  // the businesses themselves, as their own applications report them
  'SNAPSHOTS', 'ACTIVITY', 'AUTOMATION', 'OPS', 'PEOPLE', 'MONEY', 'FEED', 'ACTIONS',
  'attendanceSummary', 'hasApp', 'brandOf',
  // the referral share — null where there is none
  'revenue',
  // aggregates, from src/lib/derive.js
  'practiceKpis', 'filingBoard', 'turnoverSeries', 'clientSeries', 'readinessBuckets', 'kindLoad',
  'staffWorkload', 'alerts', 'clientBrief', 'calendarMonth', 'monthTotals',
  // saving firm, client and invitation records
  'saveFirmProfile', 'createClient', 'createInvitation', 'acceptInvitation',
  // the hook behind the session actions in useApp() (src/lib/store.jsx)
  'useSession',
]

// What useSession() returns: status lookups and the actions screens can take.
export const SESSION_KEYS = [
  'statusOf', 'metaOf', 'fileReturn', 'markReady', 'reopen',
  'docStatusOf', 'docGotOf', 'uploadDoc', 'uploadedNow', 'remind', 'remindedOf',
  'receiptsFor', 'addReceipt', 'reviewReceipt',
  'taskStatusOf', 'completeTask', 'auditEvents',
  'ownerMissionDone', 'completeOwnerMission',
  'invoicesFor', 'saveInvoice', 'ewayBillsFor', 'saveEwayBill',
  'tripsFor', 'tripStateOf', 'addTrip', 'updateTrip',
  'actionCount',
]
