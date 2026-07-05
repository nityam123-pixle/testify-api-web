'use client'

import { Search } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { RouteList } from '@/components/routes/RouteList'
import { useWorkspaceStore } from '@/store/workspace'

export function Sidebar() {
  const [searchQuery, setSearchQuery] = useState('')
  const searchInputRef = useRef<HTMLInputElement>(null)
  const { routes } = useWorkspaceStore()
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const uniqueFiles = new Set(routes.map(r => r.file)).size

  return (
    <aside className="w-[300px] flex-shrink-0 border-r border-border bg-surface-1 flex flex-col h-full overflow-hidden">
      <div className="p-4 pb-2">
        <div className="relative group">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search routes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-muted/20 hover:bg-muted/30 focus:bg-muted/40 border border-border/50 focus:border-primary/50 rounded-lg pl-9 pr-12 py-2 text-sm outline-none text-foreground transition-all placeholder:text-muted-foreground/60 shadow-sm"
          />
          <div className="absolute right-2 top-2">
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-border/50 bg-muted/50 px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
              <span className="text-xs">⌘</span>K
            </kbd>
          </div>
        </div>
        
        {routes.length > 0 && (
          <div className="flex items-center justify-between mt-3 px-1">
            <span className="text-xs font-medium text-muted-foreground">{routes.length} Routes</span>
            <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground/50">{uniqueFiles} Files</span>
          </div>
        )}
      </div>
      
      <div className="flex-1 overflow-y-auto p-2 flex flex-col scrollbar-hide">
        <RouteList searchQuery={searchQuery} />
      </div>
    </aside>
  )
}
