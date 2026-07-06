import { useState, useRef, useEffect } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { RequestHeader, useWorkspaceStore } from '@/store/workspace'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandGroup, CommandItem, CommandList } from '@/components/ui/command'

const COMMON_HEADERS = [
  'Accept', 'Accept-Charset', 'Accept-Encoding', 'Accept-Language',
  'Authorization', 'Cache-Control', 'Connection', 'Content-Encoding',
  'Content-Length', 'Content-MD5', 'Content-Type', 'Cookie', 'Date',
  'Expect', 'Forwarded', 'From', 'Host', 'If-Match', 'If-Modified-Since',
  'If-None-Match', 'If-Range', 'If-Unmodified-Since', 'Max-Forwards',
  'Origin', 'Pragma', 'Proxy-Authorization', 'Range', 'Referer', 'TE',
  'User-Agent', 'Upgrade', 'Via', 'Warning', 'X-Requested-With',
  'X-Forwarded-For', 'X-Forwarded-Host', 'X-Forwarded-Proto',
  'X-CSRF-Token', 'X-XSRF-TOKEN', 'X-CSRFToken', 'X-Csrf-Token',
  'X-Api-Key', 'X-Auth-Token',
]

// Quick-add chips for frequently used headers
const QUICK_ADD_HEADERS: { label: string; key: string; defaultValue: string; color: string }[] = [
  { label: 'Cookie', key: 'Cookie', defaultValue: '', color: 'bg-amber-500/15 text-amber-400 border-amber-500/20 hover:bg-amber-500/25' },
  { label: 'Authorization', key: 'Authorization', defaultValue: 'Bearer ', color: 'bg-blue-500/15 text-blue-400 border-blue-500/20 hover:bg-blue-500/25' },
  { label: 'Content-Type', key: 'Content-Type', defaultValue: 'application/json', color: 'bg-purple-500/15 text-purple-400 border-purple-500/20 hover:bg-purple-500/25' },
  { label: 'Accept', key: 'Accept', defaultValue: 'application/json', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/25' },
  { label: 'X-Api-Key', key: 'X-Api-Key', defaultValue: '', color: 'bg-primary/15 text-primary border-primary/20 hover:bg-primary/25' },
]

export function HeadersEditor() {
  const { headers, addHeader, updateHeader, removeHeader } = useWorkspaceStore()

  // If empty, add a default empty row
  useEffect(() => {
    if (headers.length === 0) {
      addHeader()
    }
  }, [headers.length, addHeader])

  const handleQuickAdd = (key: string, defaultValue: string) => {
    // If header already exists, focus it instead
    const existing = headers.find(h => h.key.toLowerCase() === key.toLowerCase())
    if (existing) {
      toast_noop(key)
      return
    }
    addHeader()
    setTimeout(() => {
      const currentHeaders = useWorkspaceStore.getState().headers
      const last = currentHeaders[currentHeaders.length - 1]
      if (last) updateHeader(last.id, { key, value: defaultValue, enabled: true })
    }, 10)
  }

  return (
    <div className="flex flex-col gap-3 mt-2">
      {/* Quick-add chips */}
      <div className="flex flex-wrap gap-1.5">
        {QUICK_ADD_HEADERS.map(q => {
          const alreadyAdded = headers.some(h => h.key.toLowerCase() === q.key.toLowerCase() && h.enabled)
          return (
            <button
              key={q.key}
              onClick={() => handleQuickAdd(q.key, q.defaultValue)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all ${q.color} ${alreadyAdded ? 'opacity-40 cursor-default' : 'cursor-pointer'}`}
              disabled={alreadyAdded}
              title={alreadyAdded ? `${q.key} already added` : `Quick add ${q.key}`}
            >
              {!alreadyAdded && <Plus className="h-2.5 w-2.5" />}
              {q.label}
            </button>
          )
        })}
      </div>

      {/* Column heading */}
      <div className="flex bg-surface-3/50 border border-border/50 rounded-t-md px-3 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
        <div className="w-8 shrink-0" />
        <div className="w-[40%] shrink-0">Key</div>
        <div className="flex-1">Value</div>
        <div className="w-8 shrink-0" />
      </div>

      {/* Header rows */}
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
        className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground py-2 px-1 w-fit transition-colors"
      >
        <Plus className="h-3.5 w-3.5" />
        Add Header
      </button>
    </div>
  )
}

// no-op toast hint (avoids import)
function toast_noop(_key: string) {}

function HeaderRow({ header, isLast, onUpdate, onRemove, onAdd }: {
  header: RequestHeader
  isLast: boolean
  onUpdate: (u: Partial<RequestHeader>) => void
  onRemove: () => void
  onAdd: () => void
}) {
  const [open, setOpen] = useState(false)
  const valueRef = useRef<HTMLInputElement>(null)

  const handleKeyDown = (e: React.KeyboardEvent, field: 'key' | 'value') => {
    if (e.key === 'Enter') {
      e.preventDefault()
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

  const filteredHeaders = COMMON_HEADERS.filter(h =>
    h.toLowerCase().includes(header.key.toLowerCase()) && header.key.length > 0
  )

  // Determine value placeholder based on key
  const valuePlaceholder = (() => {
    const k = header.key.toLowerCase()
    if (k === 'cookie') return 'session_token=abc123; other_cookie=xyz'
    if (k === 'authorization') return 'Bearer <token>'
    if (k === 'content-type') return 'application/json'
    if (k === 'accept') return 'application/json'
    if (k === 'origin') return 'http://localhost:3000'
    if (k === 'x-api-key') return '<your-api-key>'
    if (k === 'x-csrf-token' || k === 'x-xsrf-token') return '<csrf-token>'
    return 'value'
  })()

  // Color coding for well-known keys
  const keyColor = (() => {
    const k = header.key.toLowerCase()
    if (k === 'cookie') return 'text-amber-400'
    if (k === 'authorization') return 'text-blue-400'
    if (k === 'content-type') return 'text-purple-400'
    if (k === 'accept') return 'text-emerald-400'
    return ''
  })()

  return (
    <div className="flex items-center gap-1.5 group">
      {/* Enabled checkbox */}
      <div className="w-8 shrink-0 flex justify-center">
        <input
          type="checkbox"
          checked={header.enabled}
          onChange={(e) => onUpdate({ enabled: e.target.checked })}
          className="accent-primary w-3.5 h-3.5 rounded-sm bg-surface-3 border-border/50 cursor-pointer"
        />
      </div>

      {/* Key with autocomplete */}
      <div className="w-[40%] shrink-0 relative">
        <Popover open={open && filteredHeaders.length > 0} onOpenChange={setOpen}>
          <PopoverTrigger render={<div className="w-full relative" />}>
            <input
              type="text"
              value={header.key}
              onChange={(e) => {
                onUpdate({ key: e.target.value })
                setOpen(true)
              }}
              onFocus={() => setOpen(true)}
              onKeyDown={(e) => handleKeyDown(e, 'key')}
              placeholder="Key"
              className={`w-full bg-surface-3/30 hover:bg-surface-3/60 focus:bg-surface-3 border border-border/50 focus:border-primary/50 rounded-md px-3 py-1.5 text-xs outline-none font-mono transition-all placeholder:text-muted-foreground/50 placeholder:font-sans ${keyColor || 'text-foreground'}`}
            />
          </PopoverTrigger>
          <PopoverContent className="w-[220px] p-0" align="start">
            <Command>
              <CommandList>
                <CommandGroup>
                  {filteredHeaders.slice(0, 8).map((h) => (
                    <CommandItem
                      key={h}
                      value={h}
                      onSelect={() => {
                        onUpdate({ key: h })
                        setOpen(false)
                        setTimeout(() => valueRef.current?.focus(), 50)
                      }}
                      className="font-mono text-xs cursor-pointer"
                    >
                      {h}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {/* Value */}
      <div className="flex-1">
        <input
          ref={valueRef}
          type={header.key.toLowerCase() === 'authorization' ? 'text' : 'text'}
          value={header.value}
          onChange={(e) => onUpdate({ value: e.target.value })}
          onKeyDown={(e) => handleKeyDown(e, 'value')}
          placeholder={valuePlaceholder}
          className="w-full bg-surface-3/30 hover:bg-surface-3/60 focus:bg-surface-3 border border-border/50 focus:border-primary/50 rounded-md px-3 py-1.5 text-xs outline-none text-foreground font-mono transition-all placeholder:text-muted-foreground/40 placeholder:font-sans"
        />
      </div>

      {/* Delete */}
      <div className="w-8 shrink-0 flex justify-center">
        <button
          onClick={onRemove}
          className="p-1.5 text-muted-foreground/50 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors opacity-0 group-hover:opacity-100"
          title="Remove Header"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}
