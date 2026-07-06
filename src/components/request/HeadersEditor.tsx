import { useState, useRef, useEffect } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { RequestHeader, useWorkspaceStore } from '@/store/workspace'

// Exhaustive list of all standard + widely-used HTTP request headers
// Sourced from IANA HTTP Field Name Registry + MDN + common frameworks
const ALL_REQUEST_HEADERS = [
  // Standard request headers (RFC 7230-7235, RFC 9110-9114)
  'A-IM',
  'Accept',
  'Accept-Charset',
  'Accept-Datetime',
  'Accept-Encoding',
  'Accept-Language',
  'Accept-Ranges',
  'Access-Control-Request-Headers',
  'Access-Control-Request-Method',
  'Authorization',
  'Cache-Control',
  'Connection',
  'Content-Encoding',
  'Content-Length',
  'Content-MD5',
  'Content-Type',
  'Cookie',
  'Date',
  'DNT',
  'Expect',
  'Forwarded',
  'From',
  'Host',
  'HTTP2-Settings',
  'If-Match',
  'If-Modified-Since',
  'If-None-Match',
  'If-Range',
  'If-Unmodified-Since',
  'Max-Forwards',
  'Origin',
  'Pragma',
  'Prefer',
  'Proxy-Authorization',
  'Range',
  'Referer',
  'Save-Data',
  'TE',
  'Trailer',
  'Transfer-Encoding',
  'Upgrade',
  'Upgrade-Insecure-Requests',
  'User-Agent',
  'Via',
  'Warning',
  // Security / CSRF
  'X-CSRF-Token',
  'X-CSRFToken',
  'X-Csrf-Token',
  'X-XSRF-TOKEN',
  // Common non-standard / de-facto headers
  'X-Forwarded-For',
  'X-Forwarded-Host',
  'X-Forwarded-Proto',
  'X-HTTP-Method-Override',
  'X-Requested-With',
  'X-Real-IP',
  'X-Request-ID',
  'X-Correlation-ID',
  'X-Trace-ID',
  'X-B3-TraceId',
  'X-B3-SpanId',
  'X-B3-ParentSpanId',
  'X-B3-Flags',
  'X-B3-Sampled',
  // API / Auth
  'X-Api-Key',
  'X-API-Key',
  'X-Auth-Token',
  'X-Access-Token',
  'X-Client-ID',
  'X-Client-Secret',
  'X-Tenant-ID',
  'X-Workspace-ID',
  'X-Organization-ID',
  // Content negotiation
  'X-Content-Type-Options',
  'X-Requested-With',
  // Rate limiting / retry hints
  'X-Rate-Limit-Limit',
  'X-Rate-Limit-Remaining',
  'X-Rate-Limit-Reset',
  'Retry-After',
  // Framework-specific
  'X-Amz-Date',
  'X-Amz-Content-SHA256',
  'X-Amz-Security-Token',
  'X-Goog-Api-Key',
  'X-Firebase-Auth',
  'baggage',
  'traceparent',
  'tracestate',
]

export function HeadersEditor() {
  const { headers, addHeader, updateHeader, removeHeader } = useWorkspaceStore()

  useEffect(() => {
    if (headers.length === 0) {
      addHeader()
    }
  }, [headers.length, addHeader])

  return (
    <div className="flex flex-col gap-2 mt-2">
      {/* Column heading */}
      <div className="flex bg-surface-3/50 border border-border/50 rounded-t-md px-3 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
        <div className="w-7 shrink-0" />
        <div className="w-[38%] shrink-0">Key</div>
        <div className="flex-1">Value</div>
        <div className="w-7 shrink-0" />
      </div>

      {/* Rows */}
      <div className="flex flex-col gap-1.5">
        {headers.map((header, idx) => (
          <HeaderRow
            key={header.id}
            header={header}
            isLast={idx === headers.length - 1}
            onUpdate={(updates) => updateHeader(header.id, updates)}
            onRemove={() => removeHeader(header.id)}
            onAdd={addHeader}
          />
        ))}
      </div>

      <button
        onClick={addHeader}
        className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground py-2 px-1 w-fit transition-colors mt-1"
      >
        <Plus className="h-3.5 w-3.5" />
        Add Header
      </button>
    </div>
  )
}

function HeaderRow({ header, isLast, onUpdate, onRemove, onAdd }: {
  header: RequestHeader
  isLast: boolean
  onUpdate: (u: Partial<RequestHeader>) => void
  onRemove: () => void
  onAdd: () => void
}) {
  const [open, setOpen] = useState(false)
  const valueRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Filter: if nothing typed, show all; if typed, fuzzy-match
  const query = header.key.toLowerCase()
  const suggestions = query.length === 0
    ? ALL_REQUEST_HEADERS
    : ALL_REQUEST_HEADERS.filter(h => h.toLowerCase().includes(query))

  const handleKeyDown = (e: React.KeyboardEvent, field: 'key' | 'value') => {
    if (e.key === 'Escape') {
      setOpen(false)
      return
    }
    if (e.key === 'Enter') {
      e.preventDefault()
      if (open && suggestions.length > 0) {
        // Select top suggestion
        onUpdate({ key: suggestions[0] })
        setOpen(false)
        setTimeout(() => valueRef.current?.focus(), 30)
        return
      }
      if (field === 'key') {
        valueRef.current?.focus()
      } else if (isLast) {
        onAdd()
      }
    }
    if (e.key === 'Backspace' && field === 'key' && header.key === '') {
      e.preventDefault()
      onRemove()
    }
  }

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  // Context-aware placeholder for the value field
  const valuePlaceholder = (() => {
    const k = header.key.toLowerCase()
    if (k === 'cookie') return 'session=abc123; csrf=xyz'
    if (k === 'authorization') return 'Bearer <token>'
    if (k === 'content-type') return 'application/json'
    if (k === 'accept') return '*/* or application/json'
    if (k === 'origin') return 'http://localhost:3000'
    if (k === 'x-api-key' || k === 'x-api-key') return '<your-api-key>'
    if (k.includes('csrf') || k.includes('xsrf')) return '<csrf-token>'
    if (k === 'referer' || k === 'referrer') return 'https://example.com'
    if (k === 'user-agent') return 'MyApp/1.0'
    if (k === 'host') return 'api.example.com'
    if (k === 'range') return 'bytes=0-1023'
    if (k === 'cache-control') return 'no-cache'
    return 'value'
  })()

  return (
    <div ref={containerRef} className="flex items-center gap-1.5 group relative">
      {/* Checkbox */}
      <div className="w-7 shrink-0 flex justify-center">
        <input
          type="checkbox"
          checked={header.enabled}
          onChange={(e) => onUpdate({ enabled: e.target.checked })}
          className="accent-primary w-3.5 h-3.5 cursor-pointer"
        />
      </div>

      {/* Key input + dropdown */}
      <div className="w-[38%] shrink-0 relative">
        <input
          ref={inputRef}
          type="text"
          value={header.key}
          onChange={(e) => {
            onUpdate({ key: e.target.value })
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => handleKeyDown(e, 'key')}
          placeholder="Key"
          autoComplete="off"
          spellCheck={false}
          className="w-full bg-surface-3/30 hover:bg-surface-3/60 focus:bg-surface-3 border border-border/50 focus:border-primary/50 rounded-md px-3 py-1.5 text-xs outline-none text-foreground font-mono transition-all placeholder:text-muted-foreground/50 placeholder:font-sans"
        />

        {/* Dropdown list */}
        {open && suggestions.length > 0 && (
          <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-surface-2 border border-border rounded-md shadow-xl overflow-hidden">
            <div className="max-h-[200px] overflow-y-auto">
              {suggestions.slice(0, 20).map((h) => (
                <button
                  key={h}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault()
                    onUpdate({ key: h })
                    setOpen(false)
                    setTimeout(() => valueRef.current?.focus(), 30)
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs font-mono text-foreground hover:bg-primary/20 hover:text-primary transition-colors flex items-center gap-2"
                >
                  <span className="flex-1 truncate">{h}</span>
                  {h.toLowerCase() === query && (
                    <span className="text-[10px] text-muted-foreground/60 shrink-0">exact</span>
                  )}
                </button>
              ))}
              {suggestions.length > 20 && (
                <div className="px-3 py-1.5 text-[10px] text-muted-foreground border-t border-border/50">
                  +{suggestions.length - 20} more — keep typing to filter
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Value */}
      <div className="flex-1">
        <input
          ref={valueRef}
          type="text"
          value={header.value}
          onChange={(e) => onUpdate({ value: e.target.value })}
          onKeyDown={(e) => handleKeyDown(e, 'value')}
          placeholder={valuePlaceholder}
          autoComplete="off"
          spellCheck={false}
          className="w-full bg-surface-3/30 hover:bg-surface-3/60 focus:bg-surface-3 border border-border/50 focus:border-primary/50 rounded-md px-3 py-1.5 text-xs outline-none text-foreground font-mono transition-all placeholder:text-muted-foreground/40 placeholder:font-sans"
        />
      </div>

      {/* Delete */}
      <div className="w-7 shrink-0 flex justify-center">
        <button
          onClick={onRemove}
          className="p-1.5 text-muted-foreground/40 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors opacity-0 group-hover:opacity-100"
          title="Remove"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>
    </div>
  )
}
