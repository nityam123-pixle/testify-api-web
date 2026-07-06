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

    // ── Read the tunnelled headers from the Go proxy ──────────────────────────
    // The proxy sends two special headers:
    //
    //   X-Testify-Response-Headers  — JSON map of ALL original response headers
    //                                 (including Set-Cookie which the browser's
    //                                 Fetch API silently drops on cross-origin
    //                                 responses).
    //
    //   X-Testify-Proto             — The actual HTTP version string from Go's
    //                                 http.Response.Proto ("HTTP/1.1", "HTTP/2.0"…)
    //
    // We prefer these over the browser's response.headers which are incomplete.

    let displayHeaders: Record<string, string> = {}

    const tunnelled = response.headers.get('x-testify-response-headers')
    if (tunnelled) {
      try {
        // The tunnelled value is JSON: { "Header-Name": ["value1", "value2"] }
        // We flatten multi-value headers to a single comma-joined string,
        // matching the standard HTTP representation.
        const raw: Record<string, string[]> = JSON.parse(tunnelled)
        for (const [key, values] of Object.entries(raw)) {
          // Skip the proxy's own meta-headers from the display
          const lower = key.toLowerCase()
          if (lower === 'x-testify-response-headers' || lower === 'x-testify-proto') continue
          displayHeaders[key] = values.join(', ')
        }
      } catch {
        // Fallback: use whatever the browser exposes
        response.headers.forEach((value, key) => {
          displayHeaders[key] = value
        })
      }
    } else {
      // Old proxy version — use browser headers
      response.headers.forEach((value, key) => {
        displayHeaders[key] = value
      })
    }

    // Real HTTP version from the proxy (e.g. "HTTP/1.1", "HTTP/2.0")
    const httpVersion = response.headers.get('x-testify-proto') || 'HTTP/1.1'

    return {
      status: response.status,
      statusText: response.statusText,
      body: bodyText,
      headers: displayHeaders,
      duration,
      size,
      httpVersion,
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
