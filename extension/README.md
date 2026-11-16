# SolvR Browser Extension

## Overview
A Manifest V3 browser extension for Chrome, Brave, and Edge that enables 1-click importing of practice problems from LeetCode, Codeforces, GeeksforGeeks, and HackerRank directly into SolvR.

## Interface
- `[manifest.json:action.default_popup]`: Extension popup entry point (`popup.html`).
- `[manifest.json:background.service_worker]`: Background service worker (`background.js`) handling pairing handshakes and local storage caches.
- `[manifest.json:content_scripts]`: Main world fetch hook (`mainWorldInterceptor.js`) and isolated content script (`content.js`, `toast.css`).
- `[manifest.json:externally_connectable]`: Allows authorized SolvR web app domains to pair via `chrome.runtime.sendMessage`.
- `[content.js:extractProblemMetadata]`: Combines intercepted GraphQL `questionData` metadata with fallback DOM heuristics.
- `[content.js:showInPageToast]`: Injects non-intrusive Shadow DOM glassmorphic toast notification upon problem save.
- `[popup.js:DEFAULT_SOLVR_URL]`: Default target web application URL (`https://question-tracker-khaki.vercel.app`).

## Invariants
- `[manifest.json:manifest_version]`: Extension manifest version is strictly 3.
- `[content.js:solvr-floating-btn]`: Singleton guard ensures the floating button is injected at most once into the DOM.
- `[content.js:difficulty]`: LeetCode difficulty maps strictly to `Easy`, `Medium`, or `Hard` based on DOM selectors and text analysis.
- `[content.js:rating]`: Codeforces difficulty maps rating `< 1200` to `Easy`, `>= 1700` to `Hard`, and intermediate ratings to `Medium`.
- `[popup.js:currentTab.url]`: Execution halts if active tab or tab URL is undefined.
- `[content.js:baseUrl]`: Falls back to `DEFAULT_SOLVR_URL` if `solvrBaseUrl` is unconfigured in `chrome.storage.sync`.

## Side Effects
- `[content.js:document.body.appendChild]`: Appends floating `#solvr-floating-btn` element to page DOM.
- `[content.js:window.open]`: Opens new browser tab targeting SolvR with encoded problem query parameters.
- `[popup.js:chrome.storage.sync.get]`: Asynchronously reads configured base URL from extension storage.
- `[popup.js:chrome.tabs.create]`: Creates a new tab navigating to SolvR with detected problem parameters.

## Verification
- Run: `npm test`

---

## How to Install in Chrome / Edge / Brave

1. Open your browser and navigate to:
   - **Chrome**: `chrome://extensions`
   - **Edge**: `edge://extensions`
   - **Brave**: `brave://extensions`
2. Enable **"Developer mode"** (toggle in the top-right corner).
3. Click the **"Load unpacked"** button.
4. Select this directory (`SolvR/extension`).
5. Open any LeetCode or Codeforces problem to use the floating `+ Add to SolvR` button.
