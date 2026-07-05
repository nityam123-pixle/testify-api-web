<img src="public/ascii-logo.svg" alt="Testify ASCII Logo" />

# Testify API Web (Phase 5)

**The Web Dashboard for the Testify CLI.**

![License](https://img.shields.io/badge/License-Apache%202.0-blue?style=flat-square)
![Next.js](https://img.shields.io/badge/Next.js-15.0-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19.0-61DAFB?style=flat-square&logo=react)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC?style=flat-square&logo=tailwind-css)

This is the Next.js frontend application that powers the **Testify Web Dashboard**. 
It connects seamlessly to the WebSocket server running inside the [Testify CLI](https://github.com/nityam123-pixle/testify-cli).

## Key Features

- **Modern Web Dashboard**: A sleek, fully-featured Next.js frontend with dark mode styling and buttery-smooth Framer Motion animations.
- **Advanced Request Editor**:
  - Fully editable API URLs and base ports
  - Dynamic Path Parameters detection (`:id`, `{uid}`) that automatically maps input fields to the URL
  - Comprehensive Headers management with intelligent Autocomplete
  - Automatic Cookie Extraction ("Use Cookie" button parses `Set-Cookie` responses)
- **Code Editor**: Monaco Editor integration with a custom `testify-dark` theme for JSON request bodies.
- **State Management**: Built on Zustand for instant UI updates and seamless WebSocket synchronization with the CLI engine.

## Architecture

*   **Next.js (App Router)**: The core framework for the application.
*   **Tailwind CSS (v4)**: Utilized for all styling, combined with a custom design token system in `globals.css` (Surface elevations 0-3).
*   **Zustand**: A lightweight, fast state management library used (`src/store/workspace.ts`) to manage routes, the active request, and responses.
*   **Framer Motion**: Powers the buttery-smooth micro-interactions, layout transitions, and accordion animations.
*   **Shadcn/UI**: Provides accessible, premium foundational UI components (Dialogs, Accordions, Tabs, Buttons).
*   **Monaco Editor**: Integrated for the JSON Request Body editor with a custom `testify-dark` theme.

## How it works

This Next.js application is designed to be exported as a static bundle (`output: 'export'`). 
The resulting `out/` directory is then fully embedded into the `testify-cli` Go binary using `//go:embed`.

This means end-users never have to run this Next.js app themselves. They simply download the Go binary and run:
```bash
testify ui
```
Which spins up the local Go server and serves this very Next.js application!

## Development

If you want to contribute to the frontend UI or test changes:

1.  **Start the Testify CLI Backend**:
    Navigate to your API backend project (e.g. an Express or Next.js app) and run the CLI in UI mode:
    ```bash
    testify ui
    ```
    This starts the local Testify server on port `7842`.

2.  **Run the Next.js Dev Server**:
    In a separate terminal window, navigate to this repository and start the development server:
    ```bash
    npm install
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) with your browser. The Web UI will connect to the CLI's WebSocket at `ws://localhost:7842/ws`.

## Build & Export

To build the static export for the CLI:

```bash
npm run build
```
The static assets will be generated in the `out/` directory, ready to be copied into the CLI repository.

## License

This project is licensed under the **Apache License 2.0**. See the [LICENSE](LICENSE) file for details.
