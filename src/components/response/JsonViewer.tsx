import React, { useMemo, useState } from 'react'
import { ChevronRight, ChevronDown } from 'lucide-react'

type JsonNodeProps = {
  value: any
  isLast?: boolean
  level?: number
}

function JsonNode({ value, isLast = true, level = 0 }: JsonNodeProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  if (value === null) {
    return (
      <span>
        <span className="text-[#569CD6]">null</span>
        {!isLast && <span className="text-muted-foreground">,</span>}
      </span>
    )
  }
  if (typeof value === 'boolean') {
    return (
      <span>
        <span className="text-[#569CD6]">{value ? 'true' : 'false'}</span>
        {!isLast && <span className="text-muted-foreground">,</span>}
      </span>
    )
  }
  if (typeof value === 'number') {
    return (
      <span>
        <span className="text-[#B5CEA8]">{value}</span>
        {!isLast && <span className="text-muted-foreground">,</span>}
      </span>
    )
  }
  if (typeof value === 'string') {
    return (
      <span>
        <span className="text-[#CE9178]">"{value}"</span>
        {!isLast && <span className="text-muted-foreground">,</span>}
      </span>
    )
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return (
        <span>
          <span className="text-muted-foreground">[]</span>
          {!isLast && <span className="text-muted-foreground">,</span>}
        </span>
      )
    }
    return (
      <span className="relative">
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="absolute -left-4 top-1 text-muted-foreground/50 hover:text-foreground transition-colors"
        >
          {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
        </button>
        <span className="text-muted-foreground">[</span>
        {isExpanded ? (
          <>
            <div className="pl-4 ml-1 border-l border-border/30 hover:border-primary/50 transition-colors">
              {value.map((item, i) => (
                <div key={i} className="flex">
                  <JsonNode value={item} isLast={i === value.length - 1} level={level + 1} />
                </div>
              ))}
            </div>
            <span className="text-muted-foreground">]</span>
          </>
        ) : (
          <span className="text-muted-foreground/50 mx-1 cursor-pointer" onClick={() => setIsExpanded(true)}>
            {value.length} items
          </span>
        )}
        {!isExpanded && <span className="text-muted-foreground">]</span>}
        {!isLast && <span className="text-muted-foreground">,</span>}
      </span>
    )
  }

  if (typeof value === 'object') {
    const entries = Object.entries(value)
    if (entries.length === 0) {
      return (
        <span>
          <span className="text-muted-foreground">{"{}"}</span>
          {!isLast && <span className="text-muted-foreground">,</span>}
        </span>
      )
    }
    return (
      <span className="relative">
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="absolute -left-4 top-1 text-muted-foreground/50 hover:text-foreground transition-colors"
        >
          {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
        </button>
        <span className="text-muted-foreground">{"{"}</span>
        {isExpanded ? (
          <>
            <div className="pl-4 ml-1 border-l border-border/30 hover:border-primary/50 transition-colors">
              {entries.map(([k, v], i) => (
                <div key={k} className="flex">
                  <span className="text-[#9CDCFE] mr-0.5">"{k}"</span>
                  <span className="text-muted-foreground mr-1">:</span>
                  <JsonNode value={v} isLast={i === entries.length - 1} level={level + 1} />
                </div>
              ))}
            </div>
            <span className="text-muted-foreground">{"}"}</span>
          </>
        ) : (
          <span className="text-muted-foreground/50 mx-1 cursor-pointer" onClick={() => setIsExpanded(true)}>
            {entries.length} keys
          </span>
        )}
        {!isExpanded && <span className="text-muted-foreground">{"}"}</span>}
        {!isLast && <span className="text-muted-foreground">,</span>}
      </span>
    )
  }

  return null
}

interface JsonViewerProps {
  data: any
}

export function JsonViewer({ data }: JsonViewerProps) {
  const { lineCount, jsonString } = useMemo(() => {
    try {
      const str = JSON.stringify(data, null, 2)
      return { lineCount: str.split('\n').length, jsonString: str }
    } catch {
      return { lineCount: 1, jsonString: '{}' }
    }
  }, [data])

  // Truncate logic handles incredibly large uncollapsed objects if needed
  const isTruncated = lineCount > 5000
  const displayLines = isTruncated ? 5000 : lineCount

  return (
    <div className="flex font-mono text-sm leading-6 whitespace-pre relative pl-2 h-full">
      {/* Absolute left container for line numbers to prevent scrolling issues */}
      <div className="sticky left-0 flex flex-col items-end text-muted-foreground/40 pr-3 mr-3 border-r border-border/30 min-w-[3ch] select-none py-4 bg-surface-2 z-10 h-full overflow-hidden">
        {Array.from({ length: Math.max(100, lineCount) }).map((_, i) => (
          <div key={i} className="text-[11px] leading-6">{i + 1}</div>
        ))}
      </div>
      <div className="py-4 overflow-x-auto pr-4 flex-1">
        {isTruncated ? (
          <div className="flex flex-col">
            <div className="text-muted-foreground/80">
              {jsonString.split('\n').slice(0, 5000).map((line, i) => (
                <div key={i}>{line}</div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-muted/30 border border-border/50 rounded-md text-muted-foreground text-xs italic flex items-center justify-between shadow-sm">
              <span>Response truncated for display — {lineCount} total lines</span>
            </div>
          </div>
        ) : (
          <div className="pl-4">
            <JsonNode value={data} />
          </div>
        )}
      </div>
    </div>
  )
}
