import { create } from 'zustand'
import { Route, StackInfo, ResponseData } from '@/lib/types'

interface WorkspaceStore {
  // Connection
  connected: boolean
  connecting: boolean
  reconnectAttempt: number

  // Project data
  routes: Route[]
  stack: StackInfo | null
  cliVersion: string

  // Selected route
  selectedRoute: Route | null
  setSelectedRoute: (route: Route | null) => void

  // Request state
  requestBody: string
  setRequestBody: (body: string) => void
  authToken: string
  setAuthToken: (token: string) => void

  // Response state
  response: ResponseData | null
  isLoading: boolean

  // Actions
  setConnected: (v: boolean) => void
  setConnecting: (v: boolean) => void
  setReconnectAttempt: (n: number) => void
  setRoutes: (routes: Route[]) => void
  setStack: (stack: StackInfo) => void
  setCLIVersion: (v: string) => void
  setResponse: (resp: ResponseData | null) => void
  setIsLoading: (v: boolean) => void
  clearResponse: () => void
}

export const useWorkspaceStore = create<WorkspaceStore>((set) => ({
  // Connection
  connected: false,
  connecting: false,
  reconnectAttempt: 0,

  // Project data
  routes: [],
  stack: null,
  cliVersion: '',

  // Selected route
  selectedRoute: null,
  setSelectedRoute: (route) => set({ 
    selectedRoute: route,
    requestBody: route?.body ? route.body : '',
    response: null,
  }),

  // Request state
  requestBody: '',
  setRequestBody: (body) => set({ requestBody: body }),
  authToken: '',
  setAuthToken: (token) => set({ authToken: token }),

  // Response state
  response: null,
  isLoading: false,

  // Actions
  setConnected: (v) => set({ connected: v }),
  setConnecting: (v) => set({ connecting: v }),
  setReconnectAttempt: (n) => set({ reconnectAttempt: n }),
  setRoutes: (routes) => set({ routes }),
  setStack: (stack) => set({ stack }),
  setCLIVersion: (v) => set({ cliVersion: v }),
  setResponse: (resp) => set({ response: resp }),
  setIsLoading: (v) => set({ isLoading: v }),
  clearResponse: () => set({ response: null }),
}))
