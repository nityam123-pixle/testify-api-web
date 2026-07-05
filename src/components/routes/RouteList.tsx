import { useWorkspaceStore } from '@/store/workspace'
import { RouteItem } from './RouteItem'
import { useMemo, useState } from 'react'
import { Loader2, Database, ChevronRight, FileCode2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface RouteListProps {
  searchQuery: string
}

export function RouteList({ searchQuery }: RouteListProps) {
  const { routes, connected } = useWorkspaceStore()
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({})

  const toggleGroup = (file: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [file]: prev[file] === undefined ? false : !prev[file]
    }))
  }

  // Filter routes based on search query
  const filteredRoutes = useMemo(() => {
    if (!searchQuery) return routes
    const query = searchQuery.toLowerCase()
    return routes.filter(
      (r) => 
        r.path.toLowerCase().includes(query) || 
        r.method.toLowerCase().includes(query) ||
        (r.file && r.file.toLowerCase().includes(query))
    )
  }, [routes, searchQuery])

  // Group by file
  const groupedRoutes = useMemo(() => {
    const groups: Record<string, typeof routes> = {}
    filteredRoutes.forEach((route) => {
      const file = route.file || 'Unknown'
      if (!groups[file]) groups[file] = []
      groups[file].push(route)
    })
    return groups
  }, [filteredRoutes])

  if (!connected) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary mb-4" />
        <p className="text-sm font-medium text-muted-foreground">Connecting to CLI...</p>
      </div>
    )
  }

  if (filteredRoutes.length === 0) {
    if (searchQuery) {
      return (
        <div className="flex-1 p-4 flex flex-col items-center justify-center text-center">
          <p className="text-sm text-muted-foreground">No routes match your search</p>
        </div>
      )
    }
    
    return (
      <div className="flex-1 p-6 flex flex-col items-center justify-center text-center bg-transparent">
        <div className="h-12 w-12 rounded-full bg-muted/30 flex items-center justify-center mb-4 border border-border/20">
          <Database className="h-6 w-6 text-muted-foreground/50" />
        </div>
        <p className="text-sm font-semibold text-foreground mb-2">No routes detected</p>
        <p className="text-xs text-muted-foreground mb-4 max-w-[200px] leading-relaxed">
          Make sure <code className="bg-muted px-1 py-0.5 rounded text-[10px]">testify start</code> is running in a project with a supported framework
        </p>
        <a 
          href="/frameworks" 
          target="_blank"
          className="text-xs font-medium text-primary hover:text-primary/80 transition-colors inline-flex items-center gap-1"
        >
          View supported frameworks <span>&rarr;</span>
        </a>
      </div>
    )
  }

  const formatFilePath = (path: string) => {
    const segments = path.split(/[/\\]/)
    if (segments.length <= 3) return path
    return '.../' + segments.slice(-3).join('/')
  }

  return (
    <div className="flex flex-col gap-4">
      {Object.entries(groupedRoutes).map(([file, fileRoutes]) => {
        const isExpanded = expandedGroups[file] !== false // Default to true

        return (
          <div key={file} className="flex flex-col">
            <button 
              onClick={() => toggleGroup(file)}
              className="flex items-center justify-between w-full text-left py-1.5 px-2 hover:bg-muted/30 rounded-md transition-colors group mb-1"
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <motion.div
                  animate={{ rotate: isExpanded ? 90 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
                </motion.div>
                <FileCode2 className="h-3.5 w-3.5 text-muted-foreground/70 shrink-0" />
                <span className="text-xs text-muted-foreground group-hover:text-foreground font-mono truncate transition-colors" title={file}>
                  {formatFilePath(file)}
                </span>
              </div>
              <span className="text-[10px] font-mono text-muted-foreground/50 bg-muted/50 px-1.5 rounded shrink-0">
                {fileRoutes.length}
              </span>
            </button>
            
            <AnimatePresence initial={false}>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="flex flex-col gap-0.5 ml-3 border-l border-border/40 pl-2">
                    {fileRoutes.map((route, i) => (
                      <RouteItem key={`${route.method}-${route.path}-${i}`} route={route} />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}
