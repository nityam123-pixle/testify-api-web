'use client'

import { useEffect, useState } from 'react'
import { Topbar } from '@/components/layout/Topbar'
import { Sidebar } from '@/components/layout/Sidebar'
import { RequestEditor } from '@/components/request/RequestEditor'
import { ResponseViewer } from '@/components/response/ResponseViewer'
import { useWebSocket } from '@/hooks/useWebSocket'
import { useWorkspaceStore } from '@/store/workspace'
import { Alert, AlertTitle, AlertDescription, AlertAction } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { AlertCircle, X, Check, Copy, Activity } from 'lucide-react'
import { toast } from 'sonner'

export default function AppShell() {
  // Initialize WebSocket connection
  useWebSocket()
  const { selectedRoute, setSelectedRoute, connected, connecting, reconnectAttempt } = useWorkspaceStore()
  const [isBannerDismissed, setIsBannerDismissed] = useState(false)
  const [copiedCommand, setCopiedCommand] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedRoute(null)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [setSelectedRoute])

  const showBanner = !connected && !connecting && reconnectAttempt > 0 && !isBannerDismissed

  const handleCopyCommand = () => {
    navigator.clipboard.writeText('testify start')
    setCopiedCommand(true)
    toast.success('Command copied to clipboard')
    setTimeout(() => setCopiedCommand(false), 2000)
  }

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-surface-0 text-foreground relative">
      {showBanner && (
        <div className="px-4 py-3 bg-background border-b border-border z-10 shrink-0">
          <Alert variant="default" className="bg-yellow-500/10 border-yellow-500/20 text-yellow-500">
            <AlertCircle className="h-4 w-4 !text-yellow-500" />
            <AlertTitle className="font-semibold tracking-tight">CLI agent not connected</AlertTitle>
            <AlertDescription className="text-yellow-500/80">
              Run <code className="bg-yellow-500/20 px-1 py-0.5 rounded text-xs font-mono ml-1">testify start</code> in your project folder
            </AlertDescription>
            <AlertAction className="flex items-center gap-2 pr-1">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleCopyCommand}
                className="h-7 text-xs bg-yellow-500/10 hover:bg-yellow-500/20 border-yellow-500/20 text-yellow-600 hover:text-yellow-500"
              >
                {copiedCommand ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
                {copiedCommand ? 'Copied' : 'Copy command'}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsBannerDismissed(true)}
                className="h-7 w-7 hover:bg-yellow-500/20 text-yellow-500/70 hover:text-yellow-500 rounded-full"
              >
                <X className="h-4 w-4" />
              </Button>
            </AlertAction>
          </Alert>
        </div>
      )}
      <Topbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {selectedRoute ? (
            <>
              <div className="w-full md:w-[45%] h-[50%] md:h-full border-b md:border-b-0 md:border-r border-gray-800 shrink-0 flex overflow-hidden">
                <RequestEditor />
              </div>
              <div className="w-full md:w-[55%] h-[50%] md:h-full flex overflow-hidden">
                <ResponseViewer />
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center bg-surface-1 p-6">
              <div className="flex flex-col items-center justify-center p-12 bg-surface-2 border border-border rounded-xl shadow-sm min-w-[300px]">
                <div className="h-12 w-12 rounded-full bg-surface-3 flex items-center justify-center mb-6 shadow-sm border border-border">
                  <Activity className="h-5 w-5 text-muted-foreground" />
                </div>
                <h3 className="text-sm font-medium text-foreground mb-1">Select a route</h3>
                <p className="text-xs text-muted-foreground mb-6 text-center max-w-[250px] leading-relaxed">
                  Choose an endpoint from the sidebar to begin testing.
                </p>
                <kbd className="pointer-events-none inline-flex h-6 select-none items-center gap-1 rounded border border-border bg-surface-3 px-2 font-mono text-[11px] font-medium text-muted-foreground">
                  <span className="text-sm font-sans">/</span> <span className="text-sm">Search</span>
                </kbd>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
