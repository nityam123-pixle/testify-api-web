import { useWorkspaceStore } from '@/store/workspace'
import { Badge } from '@/components/ui/badge'
import { Activity } from 'lucide-react'
import Link from 'next/link'

function GithubIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.02c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A4.8 4.8 0 0 0 8 18v4" />
    </svg>
  )
}

export function Topbar() {
  const { connected, connecting, stack, reconnectAttempt } = useWorkspaceStore()

  return (
    <header className="h-14 border-b border-border bg-background flex items-center justify-between px-4 shrink-0">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <img src="/ascii-logo.svg" alt="Testify ASCII Logo" className="h-5 w-auto object-contain brightness-110" />
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">Local Workspace</span>
            <span className="px-1.5 py-0.5 rounded-md bg-muted text-[10px] font-mono text-muted-foreground">v1.1.0</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center flex-1">
        <div className="flex items-center gap-2.5 text-sm bg-muted/20 px-3 py-1.5 rounded-full border border-border/40 backdrop-blur-sm">
          {connecting || reconnectAttempt > 0 ? (
            <>
              <div className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
              </div>
              <span className="text-xs text-orange-500 font-semibold tracking-wide uppercase">
                {reconnectAttempt > 0 ? `Reconnecting... (attempt ${reconnectAttempt})` : 'Connecting...'}
              </span>
            </>
          ) : connected ? (
            <>
              <div className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </div>
              <span className="text-xs text-emerald-500 font-semibold tracking-wide uppercase">Connected</span>
            </>
          ) : (
            <>
              <div className="relative flex h-2 w-2">
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]"></span>
              </div>
              <span className="text-xs text-red-500 font-semibold tracking-wide uppercase">Disconnected</span>
            </>
          )}
          
          {stack && connected && (
            <>
              <div className="w-px h-3 bg-border/50 mx-1" />
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground font-mono">{stack.framework}</span>
                <span className="text-xs text-muted-foreground font-mono">·</span>
                <span className="text-xs text-foreground font-mono font-medium">:{stack.port}</span>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Link 
          href="/frameworks"
          className="px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md transition-colors"
        >
          45 Frameworks
        </Link>
        <a 
          href="https://github.com/nityam123-pixle/testify" 
          target="_blank" 
          rel="noopener noreferrer"
          className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md transition-colors"
        >
          <GithubIcon className="h-4 w-4" />
        </a>
      </div>
    </header>
  )
}
