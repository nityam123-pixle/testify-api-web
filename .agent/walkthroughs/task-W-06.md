# Walkthrough: Task W-06 (HTTP Request Execution)

## What was completed
We have implemented the core request execution engine that allows the browser to send HTTP requests directly to the user's local API.

### Request Utility (`src/lib/request.ts`)
- Created a robust `sendRequest` function that takes a unified `RequestConfig` object and executes it using the native `fetch` API.
- Implemented smart header injection (automatically adding `Content-Type: application/json` when a body is present).
- Handled edge cases perfectly: `GET`, `HEAD`, and `DELETE` requests safely omit the body, avoiding `fetch` exceptions.
- Added precise performance tracking using `performance.now()` to measure the round-trip duration in milliseconds.
- Safely processes standard responses (including non-2xx codes) while cleanly catching hard network errors.

### Request Editor Wiring
- Wired the `sendRequest` function directly into the `RequestEditor` component.
- The "Send Request" button now dynamically pulls the `method`, `path`, `baseURL`, `authToken`, and `requestBody` from the Zustand store.
- Built-in global keyboard shortcut: pressing `Ctrl+Enter` or `Cmd+Enter` anywhere in the app immediately fires the active request.
- The UI handles the loading state (blocking multiple clicks while a request is running) and correctly stores the returned `ResponseData` directly back into the Zustand store for the upcoming Response Viewer to display.

## Validation Results
- Verified there are zero TypeScript errors via `npm run build`.
- The request handler perfectly aligns with our `ResponseData` interface.
