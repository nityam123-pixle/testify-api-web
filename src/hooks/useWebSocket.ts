import { useEffect, useRef, useCallback } from 'react'
import { useWorkspaceStore } from '@/store/workspace'
import { WS_URL } from '@/lib/constants'
import { WSMessage } from '@/lib/types'

export function useWebSocket() {
  const { connected, connecting, setConnected, setConnecting, setRoutes, setStack, reconnectAttempt, setReconnectAttempt } = useWorkspaceStore()
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return

    setConnecting(true)

    const ws = new WebSocket(WS_URL)
    wsRef.current = ws

    ws.onopen = () => {
      setConnected(true)
      setConnecting(false)
      setReconnectAttempt(0)
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
        reconnectTimeoutRef.current = null
      }
    }

    ws.onmessage = (event) => {
      try {
        const msg: WSMessage = JSON.parse(event.data)
        if (msg.type === 'init') {
          if (msg.routes) setRoutes(msg.routes)
          if (msg.stack) setStack(msg.stack)
        } else if (msg.type === 'update') {
          if (msg.routes) setRoutes(msg.routes)
        }
      } catch (err) {
        console.error('Failed to parse WebSocket message:', err)
      }
    }

    ws.onclose = () => {
      setConnected(false)
      setConnecting(false)
      wsRef.current = null
      
      // Attempt reconnect after 3 seconds
      reconnectTimeoutRef.current = setTimeout(() => {
        setReconnectAttempt(useWorkspaceStore.getState().reconnectAttempt + 1)
        connect()
      }, 3000)
    }

    ws.onerror = () => {
      // Use console.warn instead of console.error to prevent Next.js error overlay
      console.warn('WebSocket connection failed (CLI might not be running)')
      setConnected(false)
      // onclose will be called shortly after onerror
    }
  }, [setConnected, setConnecting, setRoutes, setStack, setReconnectAttempt])

  useEffect(() => {
    connect()

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [connect])

  const sendMessage = useCallback((msg: object) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(msg))
    } else {
      console.warn('WebSocket is not connected. Cannot send message.')
    }
  }, [])

  return { connected, connecting, sendMessage }
}
