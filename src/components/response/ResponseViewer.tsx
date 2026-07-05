import { useState, useEffect } from 'react'
import { useWorkspaceStore } from '@/store/workspace'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AlertCircle, Copy, Check, Zap, ServerOff, Clock, ShieldAlert, ChevronRight, CheckCircle2 } from 'lucide-react'
import { JsonViewer } from './JsonViewer'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

const LOADING_STEPS = [
  'Preparing Request',
  'Connecting to Server',
  'Sending Payload',
  'Waiting for Response',
  'Receiving Data'
]

export function ResponseViewer() {
  const { response, isLoading, selectedRoute } = useWorkspaceStore()
  const [copied, setCopied] = useState(false)
  const [loadingStep, setLoadingStep] = useState(0)
  const [isMac, setIsMac] = useState(false)

  useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().indexOf('MAC') >= 0)
  }, [])

  useEffect(() => {
    if (isLoading) {
      setLoadingStep(0)
      const timer1 = setTimeout(() => setLoadingStep(1), 300)
      const timer2 = setTimeout(() => setLoadingStep(2), 600)
      const timer3 = setTimeout(() => setLoadingStep(3), 900)
      const timer4 = setTimeout(() => setLoadingStep(4), 1200)
      return () => { clearTimeout(timer1); clearTimeout(timer2); clearTimeout(timer3); clearTimeout(timer4) }
    }
  }, [isLoading])

  const handleCopy = () => {
    if (!response?.body) return
    navigator.clipboard.writeText(response.body)
    setCopied(true)
    toast.success('Response copied to clipboard')
    setTimeout(() => setCopied(false), 1500)
  }

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
                className={`flex items-center gap-3 ${isActive ? 'text-primary' : isDone ? 'text-emerald-500' : 'text-muted-foreground'}`}
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

  if (!response) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex-1 flex flex-col items-center justify-center bg-surface-1 p-6 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
        
        <div className="relative flex flex-col items-center justify-center z-10 max-w-sm">
          <div className="h-24 w-24 rounded-3xl bg-primary/10 flex items-center justify-center mb-8 relative shadow-lg shadow-primary/5">
            <div className="absolute inset-0 rounded-3xl border border-primary/20 animate-[ping_3s_infinite]" />
            <div className="absolute inset-0 rounded-3xl border-2 border-primary/10" />
            <Zap className="h-10 w-10 text-primary drop-shadow-[0_0_10px_rgba(249,115,22,0.4)]" />
          </div>
          <h3 className="text-2xl font-bold text-foreground mb-3 tracking-tight">Ready to test</h3>
          <p className="text-sm text-muted-foreground mb-8 text-center leading-relaxed">
            Configure your request parameters on the left and hit send to execute the API call.
          </p>
          <kbd className="pointer-events-none inline-flex h-8 select-none items-center gap-1.5 rounded-lg border border-border bg-surface-2 px-3 font-mono text-xs font-medium text-muted-foreground shadow-sm">
            {isMac ? (
              <><span className="text-sm">⌘</span> <span className="text-sm">Return</span></>
            ) : (
              <><span className="text-sm">Ctrl</span>+<span className="text-sm">Enter</span></>
            )}
          </kbd>
        </div>
      </motion.div>
    )
  }

  if (response.status === 0) {
    // Determine error type based on message
    const msg = response.body.toLowerCase()
    let Icon = ServerOff
    let title = "Connection Failed"
    let desc = "The server is unreachable. Check if your local server is running."

    if (msg.includes('timeout')) {
      Icon = Clock
      title = "Request Timeout"
      desc = "The server took too long to respond."
    } else if (msg.includes('validation')) {
      Icon = AlertCircle
      title = "Validation Error"
      desc = "The request payload failed client-side validation."
    } else if (msg.includes('auth') || msg.includes('unauthorized')) {
      Icon = ShieldAlert
      title = "Authentication Failed"
      desc = "The credentials provided were rejected."
    }

    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-surface-1 p-8">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
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

  const isSuccess = response.status >= 200 && response.status < 300
  const isRedirect = response.status >= 300 && response.status < 400
  const isError = response.status >= 400

  const statusColor = isSuccess ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : isRedirect ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'
  const durationColor = response.duration < 200 ? 'text-emerald-500' : response.duration < 1000 ? 'text-yellow-500' : 'text-red-500'

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    return `${(bytes / 1024).toFixed(2)} KB`
  }

  let parsedBody = null
  let isJson = false
  try {
    parsedBody = JSON.parse(response.body)
    isJson = true
  } catch {
    // Not JSON
  }

  return (
    <div className="flex flex-col h-full flex-1 bg-surface-1">
      {/* Top Status Bar */}
      <div className="h-[72px] flex items-center justify-between px-8 border-b border-border shrink-0 bg-surface-1/80 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-6">
          <div className={`px-4 py-1.5 rounded-full text-xs font-mono font-bold border shadow-sm ${statusColor}`}>
            {response.status} {response.statusText}
          </div>
          <div className="flex items-center gap-4 text-sm font-mono font-medium">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className={durationColor}>{response.duration} ms</span>
            </div>
            <span className="w-1 h-1 rounded-full bg-border" />
            <span className="text-muted-foreground">{formatSize(response.size)}</span>
          </div>
        </div>
      </div>

      {/* Tabs Area */}
      <div className="flex-1 overflow-hidden flex flex-col pt-6">
        <Tabs defaultValue={isJson ? 'body' : 'raw'} className="flex-1 flex flex-col h-full w-full">
          <div className="px-8 mb-6 shrink-0">
            <TabsList className="bg-surface-2 p-1 rounded-full border border-border inline-flex h-10 items-center justify-center gap-1 shadow-sm">
              <TabsTrigger 
                value="body" 
                className="rounded-full px-5 py-1.5 text-xs font-medium text-muted-foreground transition-all data-[state=active]:bg-surface-3 data-[state=active]:text-foreground data-[state=active]:shadow-sm"
              >
                Body
              </TabsTrigger>
              <TabsTrigger 
                value="headers" 
                className="rounded-full px-5 py-1.5 text-xs font-medium text-muted-foreground transition-all data-[state=active]:bg-surface-3 data-[state=active]:text-foreground data-[state=active]:shadow-sm"
              >
                Headers
              </TabsTrigger>
              <TabsTrigger 
                value="raw" 
                className="rounded-full px-5 py-1.5 text-xs font-medium text-muted-foreground transition-all data-[state=active]:bg-surface-3 data-[state=active]:text-foreground data-[state=active]:shadow-sm"
              >
                Raw
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="body" className="flex-1 p-0 mx-6 mb-6 mt-0 overflow-hidden relative h-[calc(100%-1.5rem)] rounded-xl border border-border bg-surface-2 shadow-sm">
            <div className="absolute top-4 right-4 z-10">
              <button
                onClick={handleCopy}
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

          <TabsContent value="headers" className="flex-1 p-0 mx-6 mb-6 mt-0 overflow-hidden relative h-[calc(100%-1.5rem)]">
            <div className="w-full h-full border border-border rounded-xl bg-surface-2 overflow-hidden flex flex-col shadow-sm">
              <div className="flex bg-surface-3 border-b border-border px-4 py-2.5 text-xs font-semibold text-foreground sticky top-0">
                <div className="w-1/3 shrink-0">Header Name</div>
                <div className="w-2/3">Value</div>
              </div>
              <div className="overflow-y-auto flex-1">
                {Object.entries(response.headers).map(([key, value]) => (
                  <div key={key} className="flex px-4 py-2.5 border-b border-border/50 last:border-0 hover:bg-surface-3/30 transition-colors">
                    <div className="w-1/3 text-muted-foreground text-xs font-mono shrink-0 break-all">{key}</div>
                    <div className="w-2/3 text-foreground text-xs font-mono break-all">{value}</div>
                  </div>
                ))}
                {Object.keys(response.headers).length === 0 && (
                  <div className="p-8 text-sm text-muted-foreground italic text-center">No headers received</div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="raw" className="flex-1 p-0 mx-6 mb-6 mt-0 overflow-hidden relative h-[calc(100%-1.5rem)] rounded-xl border border-border bg-surface-2 shadow-sm">
            <div className="absolute top-4 right-4 z-10">
              <button
                onClick={handleCopy}
                className="p-1.5 rounded-md bg-surface-3 hover:bg-surface-3/80 text-muted-foreground hover:text-foreground transition-colors border border-border"
                title="Copy raw response"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
              </button>
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
