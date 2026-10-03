import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'
import { STAFF, staffById, CURRENT_PERIOD } from '../data/practice.js'
import { iso } from './dates.js'

const Ctx = createContext(null)
export const useApp = () => useContext(Ctx)

const KEY = 'cleanbook.v1'
const load = () => {
  try { return JSON.parse(localStorage.getItem(KEY)) || {} } catch { return {} }
}

export function AppProvider({ children }) {
  const saved = load()
  const [theme, setTheme] = useState(saved.theme || 'light')
  const [who, setWho] = useState(saved.who || 'ST-1')
  const [period, setPeriod] = useState(CURRENT_PERIOD)
  const [cmdOpen, setCmdOpen] = useState(false)
  const [toasts, setToasts] = useState([])

  // Actions taken in this session. The demo dataset stays immutable; anything
  // the auditor does on screen lands here and wins when a status is read.
  const [patch, setPatch] = useState({})
  const [docPatch, setDocPatch] = useState({})
  const [receipts, setReceipts] = useState([])
  const [taskPatch, setTaskPatch] = useState({})
  const [auditEvents, setAuditEvents] = useState([])
  const [ownerMissions, setOwnerMissions] = useState({})
  const [createdInvoices, setCreatedInvoices] = useState([])
  const [ewayBills, setEwayBills] = useState([])
  const [transportTrips, setTransportTrips] = useState([])
  const [tripPatch, setTripPatch] = useState({})

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify({ theme, who })) } catch { /* private mode */ }
  }, [theme, who])

  const toast = useCallback((title, detail, tone = 'ok') => {
    const id = 'T-' + Math.random().toString(36).slice(2, 8)
    setToasts((t) => [...t, { id, title, detail, tone }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200)
  }, [])

  const audit = useCallback((action, detail, tone = 'info') => {
    setAuditEvents((events) => [{
      id: 'EV-' + Math.random().toString(36).slice(2, 8), action, detail, tone,
      at: new Date().toISOString(), by: staffById[who]?.name || 'CleanBook user',
    }, ...events])
  }, [who])

  const value = useMemo(() => ({
    theme,
    toggleTheme: () => setTheme((t) => (t === 'light' ? 'dark' : 'light')),
    who, setWho, whoInfo: staffById[who], staff: STAFF,
    period, setPeriod,
    cmdOpen, setCmdOpen,
    toasts, toast,

    // status resolution
    statusOf: (o) => patch[o.id]?.status || o.status,
    metaOf: (o) => patch[o.id] || null,

    fileReturn: (o, clientName) => {
      const arn = 'AA29' + o.period.slice(5, 7) + o.period.slice(2, 4) + Math.floor(100000 + Math.random() * 899999) + 'W'
      setPatch((p) => ({ ...p, [o.id]: { status: 'Filed', filedOn: iso(new Date()), arn } }))
      toast(o.form + ' filed', clientName + ' · ' + o.periodLabel + ' · ARN ' + arn)
    },
    markReady: (o, clientName) => {
      setPatch((p) => ({ ...p, [o.id]: { status: 'Ready to File' } }))
      toast(o.form + ' marked ready', clientName + ' · ' + o.periodLabel + ' — queued for review', 'brand')
    },
    reopen: (o) => setPatch((p) => { const n = { ...p }; delete n[o.id]; return n }),

    docStatusOf: (d) => docPatch[d.id]?.status || d.status,
    docGotOf: (d) => (docPatch[d.id]?.got != null ? docPatch[d.id].got : d.got),

    // The two-sided moment: the owner uploads in his own app, and the auditor's
    // chase list, readiness and dashboard counters move on their own.
    uploadDoc: (d) => {
      setDocPatch((p) => ({ ...p, [d.id]: { ...p[d.id], status: 'Received', got: d.need, uploadedNow: true } }))
      audit('Document received', d.what + ' was sent from the client application', 'ok')
      toast(
        'Sent to your CA',
        d.need > 1 ? d.need - d.got + ' more file(s) uploaded — ' + d.what : d.what,
        'ok',
      )
    },
    uploadedNow: (d) => !!docPatch[d.id]?.uploadedNow,
    remind: (d, clientName, onApp) => {
      setDocPatch((p) => ({ ...p, [d.id]: { status: d.status, reminded: true } }))
      toast(
        onApp ? 'Request pushed to the client app' : 'Reminder sent on WhatsApp',
        clientName + ' · ' + d.what,
        onApp ? 'ok' : 'warn',
      )
    },
    remindedOf: (d) => !!docPatch[d.id]?.reminded,

    // Demo-safe capture. Firebase Storage will replace this session store in
    // Phase 1, but the workflow is already exactly what a client uses.
    receiptsFor: (clientId) => receipts.filter((r) => r.clientId === clientId),
    addReceipt: ({ clientId, fileName, amount, vendor }) => {
      const receipt = {
        id: 'RC-' + Math.random().toString(36).slice(2, 8), clientId, fileName,
        amount: Number(amount) || 0, vendor: vendor || 'Vendor to be confirmed',
        capturedAt: new Date().toISOString(), status: 'Captured — CA review pending',
      }
      setReceipts((items) => [receipt, ...items])
      audit('Purchase captured', fileName + ' from ' + receipt.vendor + ' is waiting for CA review', 'brand')
      toast('Purchase captured', fileName + ' is ready for your CA to review', 'ok')
    },
    reviewReceipt: (receipt, approved) => {
      const status = approved ? 'Approved for books' : 'Needs client clarification'
      setReceipts((items) => items.map((item) => item.id === receipt.id ? { ...item, status } : item))
      audit(approved ? 'Purchase approved' : 'Purchase returned', receipt.fileName + ' · ' + status, approved ? 'ok' : 'warn')
      toast(approved ? 'Purchase approved' : 'Sent back to client', receipt.fileName + ' · ' + status, approved ? 'ok' : 'warn')
    },
    taskStatusOf: (taskId) => taskPatch[taskId]?.status || 'Open',
    completeTask: (taskId, title) => {
      setTaskPatch((tasks) => ({ ...tasks, [taskId]: { status: 'Done' } }))
      audit('Task completed', title, 'ok')
      toast('Task completed', title, 'ok')
    },
    auditEvents,
    ownerMissionDone: (missionId) => !!ownerMissions[missionId],
    completeOwnerMission: (missionId, title) => {
      setOwnerMissions((missions) => ({ ...missions, [missionId]: true }))
      audit('Owner action completed', title, 'ok')
      toast('Done', title, 'ok')
    },
    invoicesFor: (clientId) => createdInvoices.filter((invoice) => invoice.clientId === clientId),
    saveInvoice: (invoice) => {
      setCreatedInvoices((items) => [invoice, ...items])
      audit('Invoice created', invoice.number + ' · ' + invoice.customer + ' · ₹' + Math.round(invoice.total).toLocaleString('en-IN'), 'ok')
      toast('Invoice created', invoice.number + ' is ready to print or share', 'ok')
    },
    ewayBillsFor: (clientId) => ewayBills.filter((bill) => bill.clientId === clientId),
    saveEwayBill: (bill) => {
      setEwayBills((items) => [bill, ...items])
      audit('E-Way Bill prepared', bill.number + ' · ' + bill.vehicle + ' · ' + bill.from + ' to ' + bill.to, 'ok')
      toast('E-Way Bill prepared', bill.number + ' is ready for portal generation', 'ok')
    },
    tripsFor: (clientId) => transportTrips.filter((trip) => trip.clientId === clientId),
    tripStateOf: (tripId) => tripPatch[tripId] || null,
    addTrip: (trip) => {
      setTransportTrips((items) => [trip, ...items])
      audit('Trip created', trip.lr + ' · ' + trip.vehicle + ' · ' + trip.from + ' to ' + trip.to, 'ok')
      toast('Trip sheet created', trip.lr + ' assigned to ' + trip.driver, 'ok')
    },
    updateTrip: (tripId, changes) => {
      setTransportTrips((items) => items.map((trip) => trip.id === tripId ? { ...trip, ...changes } : trip))
      setTripPatch((items) => ({ ...items, [tripId]: { ...items[tripId], ...changes } }))
      audit('Trip updated', tripId + ' · ' + (changes.status || changes.podFile || 'details changed'), 'info')
      toast(changes.podFile ? 'POD attached' : 'Trip updated', changes.podFile || changes.status || tripId, 'ok')
    },

    resetDemo: () => { setPatch({}); setDocPatch({}); setReceipts([]); setTaskPatch({}); setAuditEvents([]); setOwnerMissions({}); setCreatedInvoices([]); setEwayBills([]); setTransportTrips([]); setTripPatch({}); toast('Demo data reset', 'Every filing and reminder is back to its starting state', 'mute') },
    actionCount: Object.keys(patch).length + Object.keys(docPatch).length + receipts.length + Object.keys(taskPatch).length + Object.keys(ownerMissions).length + createdInvoices.length + ewayBills.length + transportTrips.length + Object.keys(tripPatch).length,
  }), [theme, who, period, cmdOpen, toasts, toast, patch, docPatch, receipts, taskPatch, auditEvents, ownerMissions, createdInvoices, ewayBills, transportTrips, tripPatch, audit])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
