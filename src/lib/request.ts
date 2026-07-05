import { RequestConfig, ResponseData } from './types'

export async function sendRequest(config: RequestConfig): Promise<ResponseData> {
  const fullURL = config.baseURL + config.path
  
  const headers = new Headers(config.headers)
  if (config.body && config.body.trim() !== '') {
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json')
    }
  }

  const startTime = performance.now()

  try {
    const fetchOptions: RequestInit = {
      method: config.method.toUpperCase(),
      headers,
    }

    if (fetchOptions.method !== 'GET' && fetchOptions.method !== 'HEAD' && fetchOptions.method !== 'DELETE') {
      if (config.body && config.body.trim() !== '') {
        fetchOptions.body = config.body
      }
    }

    const response = await fetch(fullURL, fetchOptions)
    
    const duration = Math.round(performance.now() - startTime)
    
    const bodyText = await response.text()
    
    // Calculate size in bytes
    const size = new Blob([bodyText]).size

    const responseHeaders: Record<string, string> = {}
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value
    })

    return {
      status: response.status,
      statusText: response.statusText,
      body: bodyText,
      headers: responseHeaders,
      duration,
      size,
    }
  } catch (error: any) {
    const duration = Math.round(performance.now() - startTime)
    return {
      status: 0,
      statusText: 'Network Error',
      body: error instanceof Error ? error.message : String(error),
      headers: {},
      duration,
      size: 0,
    }
  }
}
