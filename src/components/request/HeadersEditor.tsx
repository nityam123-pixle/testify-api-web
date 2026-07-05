import { useState, useRef, useEffect } from 'react'
import { Plus, Trash2, Check } from 'lucide-react'
import { RequestHeader, useWorkspaceStore } from '@/store/workspace'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'

const COMMON_HEADERS = [
  'Accept', 'Accept-Charset', 'Accept-Encoding', 'Accept-Language',
  'Authorization', 'Cache-Control', 'Connection', 'Content-Encoding',
  'Content-Length', 'Content-MD5', 'Content-Type', 'Cookie', 'Date',
  'Expect', 'Forwarded', 'From', 'Host', 'If-Match', 'If-Modified-Since',
  'If-None-Match', 'If-Range', 'If-Unmodified-Since', 'Max-Forwards',
  'Origin', 'Pragma', 'Proxy-Authorization', 'Range', 'Referer', 'TE',
  'User-Agent', 'Upgrade', 'Via', 'Warning', 'X-Requested-With',
  'X-Forwarded-For', 'X-Forwarded-Host', 'X-Forwarded-Proto',
  'X-CSRF-Token', 'X-XSRF-TOKEN', 'X-CSRFToken', 'X-Csrf-Token'
]

export function HeadersEditor() {
  const { headers, addHeader, updateHeader, removeHeader } = useWorkspaceStore()
  
  // If empty, add a default empty row
  useEffect(() => {
    if (headers.length === 0) {
      addHeader()
    }
  }, [headers.length, addHeader])

  return (
    <div className="flex flex-col gap-2 mt-2">
      <div className="flex bg-surface-3/50 border border-border/50 rounded-t-md px-3 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider sticky top-0">
        <div className="w-8 shrink-0"></div>
        <div className="w-1/3 shrink-0">Key</div>
        <div className="flex-1">Value</div>
        <div className="w-8 shrink-0"></div>
      </div>
      
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

function HeaderRow({ header, isLast, onUpdate, onRemove, onAdd }: { 
  header: RequestHeader, 
  isLast: boolean, 
  onUpdate: (u: Partial<RequestHeader>) => void,
  onRemove: () => void,
  onAdd: () => void
}) {
  const [open, setOpen] = useState(false)
  
  const handleKeyDown = (e: React.KeyboardEvent, field: 'key' | 'value') => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (isLast) onAdd()
    }
    if (e.key === 'Backspace' && field === 'key' && header.key === '') {
      e.preventDefault()
      onRemove()
    }
  }

  const filteredHeaders = COMMON_HEADERS.filter(h => h.toLowerCase().includes(header.key.toLowerCase()))

  return (
    <div className="flex items-center gap-1.5 group">
      <div className="w-8 shrink-0 flex justify-center">
        <input 
          type="checkbox"
          checked={header.enabled}
          onChange={(e) => onUpdate({ enabled: e.target.checked })}
          className="accent-primary w-3.5 h-3.5 rounded-sm bg-surface-3 border-border/50 cursor-pointer"
        />
      </div>
      
      <div className="w-1/3 shrink-0 relative">
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
              className="w-full bg-surface-3/30 hover:bg-surface-3/60 focus:bg-surface-3 border border-border/50 focus:border-primary/50 rounded-md px-3 py-1.5 text-xs outline-none text-foreground font-mono transition-all placeholder:text-muted-foreground/50 placeholder:font-sans"
            />
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0" align="start">
            <Command>
              <CommandList>
                <CommandGroup>
                  {filteredHeaders.slice(0, 8).map((h) => (
                    <CommandItem
                      key={h}
                      value={h}
                      onSelect={(currentValue) => {
                        onUpdate({ key: h })
                        setOpen(false)
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
      
      <div className="flex-1">
        <input
          type="text"
          value={header.value}
          onChange={(e) => onUpdate({ value: e.target.value })}
          onKeyDown={(e) => handleKeyDown(e, 'value')}
          placeholder="Value"
          className="w-full bg-surface-3/30 hover:bg-surface-3/60 focus:bg-surface-3 border border-border/50 focus:border-primary/50 rounded-md px-3 py-1.5 text-xs outline-none text-foreground font-mono transition-all placeholder:text-muted-foreground/50 placeholder:font-sans"
        />
      </div>
      
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
