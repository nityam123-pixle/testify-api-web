import { create } from 'zustand'
import { Route, StackInfo, ResponseData } from '@/lib/types'
import { getDefaultPort } from '@/lib/utils'

export interface RequestHeader {
  id: string
  key: string
  value: string
  enabled: boolean
}


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
  customURL: string
  setCustomURL: (url: string) => void
  pathParams: Record<string, string>
  setPathParam: (key: string, value: string) => void

  // Request state
  requestBody: string
  setRequestBody: (body: string) => void
  authToken: string
  setAuthToken: (token: string) => void
  headers: RequestHeader[]
  setHeaders: (headers: RequestHeader[]) => void
  addHeader: () => void
  updateHeader: (id: string, updates: Partial<RequestHeader>) => void
  removeHeader: (id: string) => void

  // Response state
  response: ResponseData | null
  isLoading: boolean

  // Editor settings
  editorTheme: string
  setEditorTheme: (theme: string) => void

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
  customURL: '',
  pathParams: {},
  setCustomURL: (url) => set({ customURL: url }),
  setPathParam: (key, value) => set((state) => ({ 
    pathParams: { ...state.pathParams, [key]: value } 
  })),
  setSelectedRoute: (route) => set((state) => {
    let baseURL = 'http://localhost:3000'
    if (state.stack) {
      const port = state.stack.port || getDefaultPort(state.stack.framework)
      baseURL = `http://localhost:${port}`
    }
    return {
      selectedRoute: route,
      customURL: route ? `${baseURL}${route.path}` : '',
      pathParams: {},
      requestBody: route?.body ? route.body : '',
      response: null,
    }
  }),

  // Request state
  requestBody: '',
  setRequestBody: (body) => set({ requestBody: body }),
  authToken: '',
  setAuthToken: (token) => set({ authToken: token }),
  headers: [],
  setHeaders: (headers) => set({ headers }),
  addHeader: () => set((state) => ({
    headers: [...state.headers, { id: crypto.randomUUID(), key: '', value: '', enabled: true }]
  })),
  updateHeader: (id, updates) => set((state) => ({
    headers: state.headers.map((h) => (h.id === id ? { ...h, ...updates } : h))
  })),
  removeHeader: (id) => set((state) => ({
    headers: state.headers.filter((h) => h.id !== id)
  })),

  // Response state
  response: null,
  isLoading: false,

  // Editor settings
  editorTheme: 'testify-dark',
  setEditorTheme: (theme) => set({ editorTheme: theme }),

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
