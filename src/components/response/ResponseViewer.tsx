'use client'

import { useState, useEffect } from 'react'
import { useWorkspaceStore } from '@/store/workspace'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  AlertCircle, Copy, Check, Zap, ServerOff, Clock, ShieldAlert,
  CheckCircle2, ChevronRight, ArrowDownToLine
} from 'lucide-react'
import { JsonViewer } from './JsonViewer'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

const LOADING_STEPS = [
  'Preparing Request',
  'Connecting to Server',
  'Sending Payload',
  'Waiting for Response',
  'Receiving Data',
]

export function ResponseViewer() {
  const { response, isLoading } = useWorkspaceStore()
  const [copied, setCopied] = useState(false)
  const [loadingStep, setLoadingStep] = useState(0)
  const [isMac, setIsMac] = useState(false)
  const [headersOpen, setHeadersOpen] = useState(false)

  useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().indexOf('MAC') >= 0)
  }, [])

  // Reset headers accordion when new response arrives
  useEffect(() => {
    setHeadersOpen(false)
  }, [response])

  useEffect(() => {
    if (isLoading) {
      setLoadingStep(0)
      const t1 = setTimeout(() => setLoadingStep(1), 300)
      const t2 = setTimeout(() => setLoadingStep(2), 600)
      const t3 = setTimeout(() => setLoadingStep(3), 900)
      const t4 = setTimeout(() => setLoadingStep(4), 1200)
      return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4) }
    }
  }, [isLoading])

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success('Copied to clipboard')
    setTimeout(() => setCopied(false), 1500)
  }

  // Add any response header value into the request headers panel
  const handleUseHeader = (key: string, value: string) => {
    const store = useWorkspaceStore.getState()
    const existing = store.headers.find(h => h.key.toLowerCase() === key.toLowerCase())
    if (existing) {
      store.updateHeader(existing.id, { value, enabled: true })
      toast.success(`Updated ${key}`)
    } else {
      store.addHeader()
      setTimeout(() => {
        const all = useWorkspaceStore.getState().headers
        const last = all[all.length - 1]
        if (last) store.updateHeader(last.id, { key, value, enabled: true })
        toast.success(`Added ${key} to request headers`)
      }, 10)
    }
  }

  // Specifically for Set-Cookie: strip directives, keep only name=value
  const handleUseCookie = (value: string) => {
    const cookiePart = value.split(';')[0].trim()
    const store = useWorkspaceStore.getState()
    const existingCookie = store.headers.find(h => h.key.toLowerCase() === 'cookie')
    if (existingCookie) {
      const cookieName = cookiePart.split('=')[0]
      const alreadyHas = existingCookie.value.includes(cookieName)
      const newValue = alreadyHas
        ? existingCookie.value
        : existingCookie.value
          ? `${existingCookie.value}; ${cookiePart}`
          : cookiePart
      store.updateHeader(existingCookie.id, { value: newValue, enabled: true })
    } else {
      store.addHeader()
      setTimeout(() => {
        const all = useWorkspaceStore.getState().headers
        const last = all[all.length - 1]
        if (last) store.updateHeader(last.id, { key: 'Cookie', value: cookiePart, enabled: true })
      }, 10)
    }
    toast.success('Cookie added to request headers ✓')
  }

  // ─── Loading ────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#0a0a0a]">
        <div className="w-[300px] flex flex-col gap-4">
          {LOADING_STEPS.map((step, idx) => {
            const isActive = idx === loadingStep
            const isDone = idx < loadingStep
            return (
              <motion.div
                key={step}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: isActive || isDone ? 1 : 0.4, x: 0 }}
                className={`flex items-center gap-3 ${
                  isActive ? 'text-primary' : isDone ? 'text-emerald-500' : 'text-muted-foreground'
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : isActive ? (
                  <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                ) : (
                  <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30" />
                )}
                <span className="text-sm font-medium">{step}</span>
              </motion.div>
            )
          })}
        </div>
      </div>
    )
  }

  // ─── Empty state ─────────────────────────────────────────────────────────────
  if (!response) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex-1 flex flex-col items-center justify-center bg-surface-1 p-6 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
        <div className="relative flex flex-col items-center justify-center z-10 max-w-sm">
          <div className="h-24 w-24 rounded-3xl bg-primary/10 flex items-center justify-center mb-8 relative">
            <div className="absolute inset-0 rounded-3xl border border-primary/20 animate-[ping_3s_infinite]" />
            <Zap className="h-10 w-10 text-primary drop-shadow-[0_0_10px_rgba(249,115,22,0.4)]" />
          </div>
          <h3 className="text-2xl font-bold text-foreground mb-3 tracking-tight">Ready to test</h3>
          <p className="text-sm text-muted-foreground mb-8 text-center leading-relaxed">
            Configure your request on the left and hit send.
          </p>
          <kbd className="pointer-events-none inline-flex h-8 select-none items-center gap-1.5 rounded-lg border border-border bg-surface-2 px-3 font-mono text-xs font-medium text-muted-foreground shadow-sm">
            {isMac ? <><span>⌘</span><span>Return</span></> : <><span>Ctrl</span>+<span>Enter</span></>}
          </kbd>
        </div>
      </motion.div>
    )
  }

  // ─── Network error ────────────────────────────────────────────────────────────
  if (response.status === 0) {
    const msg = response.body.toLowerCase()
    let Icon = ServerOff
    let title = 'Connection Failed'
    let desc = 'The server is unreachable. Check if your local server is running.'
    if (msg.includes('timeout')) { Icon = Clock; title = 'Request Timeout'; desc = 'The server took too long to respond.' }
    else if (msg.includes('validation')) { Icon = AlertCircle; title = 'Validation Error'; desc = 'The request payload failed validation.' }
    else if (msg.includes('auth') || msg.includes('unauthorized')) { Icon = ShieldAlert; title = 'Authentication Failed'; desc = 'The credentials provided were rejected.' }

    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-surface-1 p-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="max-w-[400px] w-full border border-red-500/20 bg-surface-2 rounded-xl p-6 relative overflow-hidden shadow-sm"
        >
          <div className="absolute top-0 left-0 w-1 h-full bg-red-500" />
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0 border border-red-500/20">
              <Icon className="h-5 w-5 text-red-500" />
            </div>
            <div className="flex flex-col">
              <h3 className="text-sm font-semibold text-red-500 mb-1">{title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed mb-4">{desc}</p>
              <div className="bg-surface-3 border border-border rounded-lg p-3">
                <p className="text-xs font-mono text-red-400/80 break-all">{response.body}</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────────
  const isSuccess = response.status >= 200 && response.status < 300
  const isRedirect = response.status >= 300 && response.status < 400

  const statusBadgeColor = isSuccess
    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
    : isRedirect
    ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
    : 'bg-red-500/10 text-red-400 border-red-500/20'

  const httpStatusColor = isSuccess ? 'text-emerald-400' : isRedirect ? 'text-yellow-400' : 'text-red-400'
  const durationColor = response.duration < 200 ? 'text-emerald-400' : response.duration < 1000 ? 'text-yellow-400' : 'text-red-400'

  const formatSize = (b: number) => b < 1024 ? `${b} B` : `${(b / 1024).toFixed(2)} KB`

  // Derive HTTP version from actual response headers (proxy may forward x-http-version),
  // fall back to the version string from the response object, otherwise show "HTTP"
  const responseHeaderEntries = Object.entries(response.headers)
  const headerCount = responseHeaderEntries.length
  const httpVersion = response.httpVersion && response.httpVersion !== 'HTTP/1.1'
    ? response.httpVersion
    : response.headers['x-http-version'] || response.headers['x-protocol'] || 'HTTP/1.1'

  let parsedBody: unknown = null
  let isJson = false
  try {
    parsedBody = JSON.parse(response.body)
    isJson = true
  } catch { /* not JSON */ }

  return (
    <div className="flex flex-col h-full flex-1 bg-surface-1 overflow-hidden">

      {/* ── Status / Meta bar ─────────────────────────────────────────────── */}
      <div className="border-b border-border shrink-0 bg-surface-1/80 backdrop-blur-md sticky top-0 z-10">

        {/* Clickable HTTP status line — expands to show headers inline */}
        <button
          onClick={() => setHeadersOpen(v => !v)}
          className="w-full flex items-center gap-2.5 px-6 pt-4 pb-2 hover:bg-surface-2/40 transition-colors group text-left"
        >
          <motion.div animate={{ rotate: headersOpen ? 90 : 0 }} transition={{ duration: 0.15 }}>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60 group-hover:text-muted-foreground transition-colors" />
          </motion.div>
          <span className="text-xs font-mono text-muted-foreground/60">{httpVersion}</span>
          <span className={`text-sm font-mono font-bold ${httpStatusColor}`}>
            {response.status} {response.statusText}
          </span>
          <span className="text-xs font-mono text-muted-foreground/50">
            ({headerCount} {headerCount === 1 ? 'header' : 'headers'})
          </span>
        </button>

        {/* Inline expandable headers — like HTTPie / Bruno */}
        <AnimatePresence initial={false}>
          {headersOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.18, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="mx-6 mb-3 rounded-lg border border-border bg-surface-2 overflow-hidden shadow-sm">
                {/* Heading row */}
                <div className="flex items-center bg-surface-3/80 border-b border-border px-3 py-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  <div className="w-2/5 shrink-0">Response Header</div>
                  <div className="flex-1">Value</div>
                  <div className="w-20 shrink-0 text-right">Add to Request</div>
                </div>

                {/* Header rows */}
                <div className="max-h-[260px] overflow-y-auto divide-y divide-border/40">
                  {responseHeaderEntries.map(([key, value]) => {
                    const isSetCookie = key.toLowerCase() === 'set-cookie'
                    const keyLower = key.toLowerCase()
                    const keyColor =
                      isSetCookie || keyLower === 'cookie' ? 'text-amber-400/80'
                      : keyLower === 'authorization' || keyLower === 'www-authenticate' ? 'text-blue-400/80'
                      : keyLower === 'content-type' ? 'text-purple-400/80'
                      : keyLower.startsWith('x-') ? 'text-primary/70'
                      : 'text-muted-foreground'

                    return (
                      <div key={key} className="flex items-start px-3 py-2 hover:bg-surface-3/20 transition-colors group/row">
                        <div className={`w-2/5 shrink-0 text-xs font-mono break-all pt-0.5 ${keyColor}`}>{key}</div>
                        <div className="flex-1 text-xs font-mono text-foreground/75 break-all pr-3 min-w-0">{value}</div>
                        <div className="w-20 shrink-0 flex justify-end">
                          {isSetCookie ? (
                            <button
                              onClick={() => handleUseCookie(value)}
                              className="opacity-0 group-hover/row:opacity-100 flex items-center gap-1 px-2 py-0.5 bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 rounded text-[10px] font-semibold border border-amber-500/20 transition-all whitespace-nowrap"
                            >
                              <ArrowDownToLine className="h-2.5 w-2.5" />
                              Cookie
                            </button>
                          ) : (
                            <button
                              onClick={() => handleUseHeader(key, value)}
                              className="opacity-0 group-hover/row:opacity-100 flex items-center gap-1 px-2 py-0.5 bg-primary/15 hover:bg-primary/25 text-primary rounded text-[10px] font-semibold border border-primary/20 transition-all whitespace-nowrap"
                            >
                              <ArrowDownToLine className="h-2.5 w-2.5" />
                              Use
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats row */}
        <div className="flex items-center justify-between px-6 pb-3">
          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <Clock className="h-3 w-3 text-muted-foreground/50" />
              <span className={durationColor}>{response.duration} ms</span>
            </div>
            <span className="w-px h-3 bg-border" />
            <span className="text-muted-foreground">{formatSize(response.size)}</span>
          </div>
          <span className={`px-3 py-0.5 rounded-full text-[11px] font-mono font-bold border ${statusBadgeColor}`}>
            {response.status} {response.statusText}
          </span>
        </div>
      </div>

      {/* ── Body / Raw tabs ───────────────────────────────────────────────── */}
      <div className="flex-1 overflow-hidden flex flex-col pt-4 min-h-0">
        <Tabs defaultValue={isJson ? 'body' : 'raw'} className="flex-1 flex flex-col min-h-0 w-full">
          <div className="px-6 mb-4 shrink-0">
            <TabsList className="bg-surface-2 p-1 rounded-full border border-border inline-flex h-10 items-center gap-1 shadow-sm">
              <TabsTrigger
                value="body"
                className="rounded-full px-5 py-1.5 text-xs font-medium text-muted-foreground transition-all data-[state=active]:bg-surface-3 data-[state=active]:text-foreground data-[state=active]:shadow-sm"
              >
                Body
              </TabsTrigger>
              <TabsTrigger
                value="raw"
                className="rounded-full px-5 py-1.5 text-xs font-medium text-muted-foreground transition-all data-[state=active]:bg-surface-3 data-[state=active]:text-foreground data-[state=active]:shadow-sm"
              >
                Raw
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Body tab */}
          <TabsContent
            value="body"
            className="flex-1 p-0 mx-6 mb-6 mt-0 min-h-0 relative rounded-xl border border-border bg-surface-2 shadow-sm overflow-hidden"
          >
            <div className="absolute top-3 right-3 z-10">
              <button
                onClick={() => handleCopy(response.body)}
                className="p-1.5 rounded-md bg-surface-3 hover:bg-surface-3/80 text-muted-foreground hover:text-foreground transition-colors border border-border"
                title="Copy response body"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
            <div className="h-full overflow-y-auto">
              {isJson ? (
                <JsonViewer data={parsedBody} />
              ) : (
                <div className="p-4 font-mono text-sm text-muted-foreground whitespace-pre-wrap">
                  {response.body || <span className="italic">Empty response body</span>}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Raw tab */}
          <TabsContent
            value="raw"
            className="flex-1 p-0 mx-6 mb-6 mt-0 min-h-0 relative rounded-xl border border-border bg-surface-2 shadow-sm overflow-hidden"
          >
            <div className="absolute top-3 right-3 z-10">
              <button
                onClick={() => handleCopy(response.body)}
                className="p-1.5 rounded-md bg-surface-3 hover:bg-surface-3/80 text-muted-foreground hover:text-foreground transition-colors border border-border"
                title="Copy raw response"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
            {/* Raw view: show the HTTP/version + status as first line, like curl -v */}
            <div className="px-4 pt-4 pb-2 border-b border-border/30 bg-surface-3/20 font-mono text-xs select-none">
              <span className="text-muted-foreground/40">{httpVersion} </span>
              <span className={`font-bold ${httpStatusColor}`}>{response.status} {response.statusText}</span>
              <span className="text-muted-foreground/30 ml-2">({headerCount} headers)</span>
            </div>
            <pre className="h-full overflow-y-auto p-4 m-0 font-mono text-sm text-foreground">
              {response.body || <span className="italic text-muted-foreground">Empty response body</span>}
            </pre>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
