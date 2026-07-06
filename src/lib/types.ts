export interface Route {
  method: string
  path: string
  file: string
  body?: string
}

export interface StackInfo {
  framework: string
  language: string
  port: string
  projectName: string
  hasConvex: boolean
  hasDotEnv: boolean
}

export interface WSMessage {
  type: 'init' | 'update' | 'response' | 'error'
  routes?: Route[]
  stack?: StackInfo
  cliVersion?: string
}

export interface RequestConfig {
  method: string
  url: string
  headers: Record<string, string>
  body: string
}

export interface ResponseData {
  status: number
  statusText: string
  body: string
  headers: Record<string, string>
  duration: number
  size: number
  httpVersion?: string
}
