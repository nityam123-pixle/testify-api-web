import { RequestConfig, ResponseData } from './types'

export async function sendRequest(config: RequestConfig): Promise<ResponseData> {
  const fullURL = config.url

  const headers: Record<string, string> = {}
  for (const [k, v] of Object.entries(config.headers || {})) {
    headers[k] = v
  }
  if (config.body && config.body.trim() !== '') {
    if (!headers['Content-Type'] && !headers['content-type']) {
      headers['Content-Type'] = 'application/json'
    }
  }

  const startTime = performance.now()

  try {
    // All requests go through the Testify Go proxy (/proxy?url=...)
    // This runs server-side so there are zero browser CORS restrictions.
    const proxyURL = `http://localhost:7842/proxy?url=${encodeURIComponent(fullURL)}`

    const fetchOptions: RequestInit = {
      method: config.method.toUpperCase(),
      headers,
    }

    if (fetchOptions.method !== 'GET' && fetchOptions.method !== 'HEAD') {
      if (config.body && config.body.trim() !== '') {
        fetchOptions.body = config.body
      }
    }

    const response = await fetch(proxyURL, fetchOptions)

    const duration = Math.round(performance.now() - startTime)

    const bodyText = await response.text()

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
