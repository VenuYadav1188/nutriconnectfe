# Frontend API URL Resolution Fix

The deployed React frontend is currently attempting to make API calls to `http://localhost:8080/api/ai/chat` instead of the production API. This is causing a `net::ERR_CONNECTION_REFUSED` error because your browser is attempting to contact your local machine instead of the Render server.

## Problem Analysis

Although we previously changed the frontend to use `/api` when `process.env.NODE_ENV === 'production'`, the error specifically says `localhost:8080/api/ai/chat`. This indicates one of three things:

1. **Browser Cache/Service Worker:** Your browser is aggressively caching the old version of the React application from before our fix. Even after the new version is deployed on Render, the browser loads the old cached JavaScript file.
2. **Render Deployment Delay:** Render can take 3-5 minutes to finish building and deploying the new commit. If you tested it immediately after the git push, Render was likely still serving the older version.
3. **Environment Variable Fallback:** The React build system may not be fully respecting the `NODE_ENV` check depending on how the build scripts are configured.

## Proposed Changes

To make the system absolutely bulletproof and guarantee it never uses `localhost` in production, we will stop relying on `process.env` completely. Instead, we will directly check the browser's current URL footprint (`window.location.hostname`).

### 1. Frontend Configuration Update
We will update both [Chatbot.js](file:///d:/nutriconnectfe/src/components/Chatbot.js) and [api.js](file:///d:/nutriconnectfe/src/utils/api.js).

#### [MODIFY] [src/components/Chatbot.js](file:///d:/nutriconnectfe/src/components/Chatbot.js)
Replace the API URL resolution logic with an absolute runtime check:
```javascript
const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:8080/api'
  : '/api';
```

#### [MODIFY] [src/utils/api.js](file:///d:/nutriconnectfe/src/utils/api.js)
Apply the same `window.location.hostname` check for standard API requests.

### 2. Manual Cache Invalidation
Once the new change is built, copied to Spring Boot, and pushed to GitHub, you will need to perform a **Hard Refresh** in your browser to forcefully clear the old cached React bundle. 

*   **Windows/Linux:** `Ctrl` + `F5` (or `Ctrl` + `Shift` + `R`)
*   **Mac:** `Cmd` + `Shift` + `R`

## User Review Required
Please review this approach. If you agree, I will proceed with modifying the frontend, rebuilding the React app, moving the compiled files into your Spring Boot `static` folder, and pushing to Render.
