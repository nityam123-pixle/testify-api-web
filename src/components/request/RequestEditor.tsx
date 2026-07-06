import { useState, useEffect, useRef, useCallback } from 'react'
import { useWorkspaceStore } from '@/store/workspace'
import { METHOD_COLORS } from '@/lib/constants'
import { Eye, EyeOff, ChevronRight, Loader2, Send, Copy, FileJson, RefreshCw, Wand2 } from 'lucide-react'
import Editor from '@monaco-editor/react'
import { sendRequest } from '@/lib/request'
import { extractPathParams } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { toast } from 'sonner'
import { HeadersEditor } from './HeadersEditor'
import { loadCustomTheme } from '@/lib/monacoThemes'

function getDefaultPort(framework?: string): string {
  switch (framework) {
    case 'FastAPI':
    case 'Django':
    case 'Laravel':
    case 'Symfony':
    case 'Sanic':
    case 'Falcon':
      return '8000'
    case 'Flask':
    case 'ASP.NET Core':
      return '5000'
    case 'Spring Boot':
    case 'Quarkus':
    case 'Micronaut':
    case 'Gin':
    case 'Echo':
    case 'Chi':
    case 'Go stdlib':
    case 'Restify':
    case 'aiohttp':
    case 'Actix Web':
      return '8080'
    case 'AdonisJS':
      return '3333'
    case 'Sails.js':
      return '1337'
    case 'CakePHP':
      return '8765'
    case 'Sinatra':
      return '4567'
    case 'Grape':
      return '9292'
    case 'Tornado':
      return '8888'
    case 'Next.js':
    case 'NestJS':
    case 'Express':
    case 'Fastify':
    case 'Hono':
    case 'Elysia':
    case 'Fiber':
    case 'Rails':
    case 'Axum':
    default:
      return '3000'
  }
}

export function RequestEditor() {
  const { selectedRoute, authToken, setAuthToken, requestBody, setRequestBody, isLoading, setIsLoading, setResponse, headers, customURL, setCustomURL, pathParams, setPathParam, editorTheme, setEditorTheme } = useWorkspaceStore()
  const [showAuth, setShowAuth] = useState(false)
  const [authExpanded, setAuthExpanded] = useState(false)
  const [headersExpanded, setHeadersExpanded] = useState(true)
  const [isMac, setIsMac] = useState(false)
  const editorRef = useRef<any>(null)

  const handleSend = useCallback(async () => {
    if (!selectedRoute) return

    setIsLoading(true)

    const requestHeaders: Record<string, string> = {}

    // Add custom enabled headers first
    headers.forEach(h => {
      if (h.enabled && h.key.trim() !== '') {
        requestHeaders[h.key] = h.value
      }
    })

    // Auth token takes precedence if set in the auth panel
    if (authToken) {
      requestHeaders['Authorization'] = `Bearer ${authToken}`
    }

    let finalURL = customURL
    const params = extractPathParams(customURL)
    params.forEach(p => {
      const val = pathParams[p] || ''
      finalURL = finalURL.replace(new RegExp(`:${p}\\b`, 'g'), val)
      finalURL = finalURL.replace(new RegExp(`\\{${p}\\}`, 'g'), val)
      finalURL = finalURL.replace(new RegExp(`\\[${p}\\]`, 'g'), val)
    })

    const config = {
      method: selectedRoute.method,
      url: finalURL,
      headers: requestHeaders,
      body: requestBody,
    }

    try {
      const result = await sendRequest(config)
      setResponse(result)
    } catch (e) {
      // Handled inside sendRequest
    } finally {
      setIsLoading(false)
    }
  }, [selectedRoute, customURL, pathParams, authToken, requestBody, headers, setIsLoading, setResponse])

  const handleSendRef = useRef(handleSend)
  useEffect(() => {
    handleSendRef.current = handleSend
  }, [handleSend])

  useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().indexOf('MAC') >= 0)
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault()
        e.stopPropagation()
        handleSendRef.current()
      }
    }
    window.addEventListener('keydown', handleKeyDown, { capture: true })
    return () => window.removeEventListener('keydown', handleKeyDown, { capture: true })
  }, [])

  useEffect(() => {
    if (!editorRef.current) return
    const urls: Record<string, string> = {
      'one-dark': '/themes/OneDark-Pro.monaco.json',
      'bearded': '/themes/Bearded-Theme.monaco.json',
      'coffee': '/themes/Coffee-Theme.monaco.json'
    }
    import('monaco-editor').then(monaco => {
      if (urls[editorTheme]) {
        loadCustomTheme(monaco, editorTheme, urls[editorTheme])
      } else {
        monaco.editor.setTheme(editorTheme)
      }
    })
  }, [editorTheme])

  if (!selectedRoute) return null

  const methodColorClass = METHOD_COLORS[selectedRoute.method as keyof typeof METHOD_COLORS] || METHOD_COLORS.ALL
  const hasBody = ['POST', 'PUT', 'PATCH'].includes(selectedRoute.method.toUpperCase())

  return (
    <div className="flex flex-col h-full flex-1 border-r border-border bg-surface-1 min-w-[400px]">
      {/* 1. Route header bar */}
      <div className="p-6 border-b border-border bg-surface-1/80 backdrop-blur-md sticky top-0 z-10">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3 bg-surface-2 border border-border/50 rounded-lg p-1.5 shadow-sm focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20 transition-all">
            <span className={`shrink-0 px-3 py-1.5 rounded-md text-[13px] font-mono font-bold tracking-widest uppercase ${methodColorClass} bg-opacity-10`}>
              {selectedRoute.method}
            </span>
            <input
              type="text"
              value={customURL}
              onChange={(e) => setCustomURL(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-sm font-mono text-foreground placeholder:text-muted-foreground/50 px-2 min-w-0"
              placeholder="http://localhost:3000/api/endpoint"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleSendRef.current()
                }
              }}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col p-6 gap-6">
        {/* 1.5 Path Params section */}
        {(() => {
          const params = extractPathParams(customURL)
          if (params.length === 0) return null
          return (
            <motion.div layout className="flex flex-col rounded-lg bg-surface-2 overflow-hidden shadow-sm">
              <div className="flex items-center gap-2 p-3 border-b border-border/40 bg-surface-3/30">
                <span className="text-sm font-semibold text-foreground">Path Variables</span>
              </div>
              <div className="p-4 flex flex-col gap-2">
                {params.map(p => (
                  <div key={p} className="flex items-center gap-3">
                    <div className="w-1/3 shrink-0 text-xs font-mono text-muted-foreground bg-surface-3 px-3 py-1.5 rounded-md border border-border/50">
                      {p}
                    </div>
                    <input
                      type="text"
                      value={pathParams[p] || ''}
                      onChange={(e) => setPathParam(p, e.target.value)}
                      placeholder="value"
                      className="flex-1 bg-surface-3/30 hover:bg-surface-3/60 focus:bg-surface-3 border border-border/50 focus:border-primary/50 rounded-md px-3 py-1.5 text-xs outline-none text-foreground font-mono transition-all"
                    />
                  </div>
                ))}
              </div>
            </motion.div>
          )
        })()}

        {/* 2. Auth section */}
        <motion.div layout className="flex flex-col rounded-lg bg-surface-2 overflow-hidden shadow-sm">
          <button
            onClick={() => setAuthExpanded(!authExpanded)}
            className="flex items-center justify-between p-3 hover:bg-muted/30 transition-colors"
          >
            <div className="flex items-center gap-2">
              <motion.div animate={{ rotate: authExpanded ? 90 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </motion.div>
              <span className="text-sm font-semibold text-foreground">Authorization</span>
            </div>
            {!authExpanded && authToken && (
              <span className="text-xs font-mono text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">Token Set</span>
            )}
          </button>

          <AnimatePresence initial={false}>
            {authExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="p-4 pt-0 border-t border-border/40">
                  <div className="relative mt-2">
                    <span className="absolute left-3 top-2.5 text-xs font-mono text-muted-foreground/70 pointer-events-none">Bearer</span>
                    <input
                      type={showAuth ? 'text' : 'password'}
                      value={authToken}
                      onChange={(e) => setAuthToken(e.target.value)}
                      placeholder="••••••••••••••••"
                      className="w-full bg-muted/20 hover:bg-muted/30 focus:bg-muted/40 border border-border/50 focus:border-primary/50 rounded-lg pl-16 pr-10 py-2 text-sm outline-none text-foreground font-mono transition-all placeholder:tracking-widest"
                    />
                    <button
                      onClick={() => setShowAuth(!showAuth)}
                      className="absolute right-3 top-2.5 text-muted-foreground/50 hover:text-foreground transition-colors"
                      title={showAuth ? "Hide Token" : "Reveal Token"}
                    >
                      {showAuth ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* 3. Headers section */}
        <motion.div layout className="flex flex-col rounded-lg bg-surface-2 overflow-hidden shadow-sm">
          <button
            onClick={() => setHeadersExpanded(!headersExpanded)}
            className="flex items-center justify-between p-3 hover:bg-surface-3/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <motion.div animate={{ rotate: headersExpanded ? 90 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </motion.div>
              <span className="text-sm font-semibold text-foreground">Headers</span>
            </div>
            <span className="text-xs font-mono text-muted-foreground bg-surface-3 px-2 py-0.5 rounded-full border border-border">
              {headers.filter(h => h.enabled && h.key).length} active
            </span>
          </button>

          <AnimatePresence initial={false}>
            {headersExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="p-4 pt-0 border-t border-border/40">
                  <HeadersEditor />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* 4. Body section */}
        <motion.div layout className="flex flex-col flex-1 min-h-[300px] rounded-lg overflow-hidden bg-surface-2 shadow-sm">
          <div className="flex items-center justify-between p-3 border-b border-border/50 bg-surface-3">
            <div className="flex items-center gap-3 px-2">
              <FileJson className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold text-foreground uppercase tracking-wider">Body</span>
              {hasBody && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-primary/10 text-primary border border-primary/20">JSON</span>
              )}
            </div>
            {hasBody && (
              <div className="flex items-center gap-2">
                <select 
                  value={editorTheme}
                  onChange={(e) => setEditorTheme(e.target.value)}
                  className="bg-surface-2 border border-border/50 text-xs text-foreground px-2 py-1 rounded outline-none cursor-pointer focus:border-primary/50 transition-colors"
                >
                  <option value="testify-dark">Default Theme</option>
                  <option value="one-dark">One Dark Pro</option>
                  <option value="bearded">Bearded Theme</option>
                  <option value="coffee">Coffee Theme</option>
                </select>

                <div className="w-px h-4 bg-border/50 mx-1"></div>

                <Tooltip>
                  <TooltipTrigger
                    onClick={() => {
                      try {
                        const parsed = JSON.parse(requestBody)
                        setRequestBody(JSON.stringify(parsed, null, 2))
                        toast.success('JSON Formatted')
                      } catch (e) {
                        toast.error('Invalid JSON payload')
                      }
                    }}
                    className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md transition-colors"
                  >
                    <Wand2 className="h-3.5 w-3.5" />
                  </TooltipTrigger>
                  <TooltipContent side="top">Format JSON</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger
                    onClick={() => {
                      setRequestBody('')
                      toast.success('Body cleared')
                    }}
                    className="p-1.5 text-muted-foreground hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-red-500">Clear Body</TooltipContent>
                </Tooltip>
              </div>
            )}
          </div>

          {hasBody ? (
            <div className="flex-1 w-full p-2 bg-surface-2">
              <Editor
                height="100%"
                defaultLanguage="json"
                theme="testify-dark"
                value={requestBody}
                onChange={(value) => setRequestBody(value || '')}
                onMount={(editor, monaco) => {
                  editorRef.current = editor
                  monaco.editor.defineTheme('testify-dark', {
                    base: 'vs-dark',
                    inherit: true,
                    rules: [],
                    colors: {
                      'editor.background': '#161616'
                    }
                  })
                  
                  const urls: Record<string, string> = {
                    'one-dark': '/themes/OneDark-Pro.monaco.json',
                    'bearded': '/themes/Bearded-Theme.monaco.json',
                    'coffee': '/themes/Coffee-Theme.monaco.json'
                  }
                  if (urls[editorTheme]) {
                    loadCustomTheme(monaco, editorTheme, urls[editorTheme])
                  } else {
                    monaco.editor.setTheme(editorTheme)
                  }
                }}
                options={{
                  minimap: { enabled: false },
                  fontSize: 13,
                  fontFamily: 'var(--font-mono)',
                  scrollBeyondLastLine: false,
                  wordWrap: 'on',
                  padding: { top: 8, bottom: 8 },
                  lineNumbers: 'on',
                  renderLineHighlight: 'all',
                  matchBrackets: 'always',
                  autoIndent: 'full',
                  formatOnPaste: true,
                }}
              />
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center bg-surface-2 py-12">
              <div className="h-12 w-12 rounded-full bg-surface-3 flex items-center justify-center mb-4 shadow-sm border border-border">
                <FileJson className="h-5 w-5 text-muted-foreground" />
              </div>
              <h3 className="text-sm font-medium text-foreground mb-1">No request body required</h3>
              <p className="text-xs text-muted-foreground">This endpoint does not accept a request body.</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* 5. Send button */}
      <div className="p-4 border-t border-border bg-surface-1/80 backdrop-blur-md sticky bottom-0 z-10">
        <button
          disabled={isLoading}
          onClick={handleSend}
          className="group relative w-full flex items-center justify-center gap-2 bg-primary/80 hover:bg-primary/90 text-primary-foreground py-3 rounded-lg font-semibold transition-all duration-200 shadow-sm hover:shadow-[0_0_15px_rgba(234,88,12,0.2)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden cursor-pointer"
        >
          {/* Subtle sheen effect */}
          <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              Send Request
              <kbd className="ml-2 pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-primary-foreground/20 bg-primary-foreground/10 px-1.5 font-mono text-[10px] font-medium text-primary-foreground/80">
                {isMac ? '⌘ Return' : 'Ctrl+Enter'}
              </kbd>
            </>
          )}
        </button>
      </div>
    </div>
  )
}
