# Tably Super Admin Portal

Standalone React + TypeScript web application for Super Admin account management, subscriptions, customers, devices, support, and audit history. It is deployed independently from the backend API.

## Run locally

```sh
npm ci
```

Set `VITE_API_BASE` to an HTTPS backend origin in `.env.local` before running the portal. The same API URL is used in development and production; there is no localhost API fallback or proxy.

```dotenv
# .env.local
VITE_API_BASE=https://your-backend.example.com
```

```sh
npm run dev
```

## Build and deploy

```sh
npm ci
VITE_API_BASE=https://your-backend.example.com npm run build
```

Production builds require `VITE_API_BASE`. It must be an HTTPS origin with no path, query, fragment, or credentials. A trailing slash is normalized away.

### Deploy to Vercel

1. Import the standalone Super Admin portal repository into Vercel.
2. Set **Framework Preset** to **Vite**, **Root Directory** to the repository root, **Install Command** to `npm ci`, **Build Command** to `npm run build`, and **Output Directory** to `dist`.
3. Add `VITE_API_BASE` under **Project Settings → Environment Variables** for Production (and Preview if previews should work). Set it to the backend's public HTTPS origin, without a trailing slash.
4. Redeploy after setting or changing the variable. In the backend, add the portal's exact production origin to `ADMIN_PORTAL_ORIGINS`.
5. Use sibling HTTPS subdomains on the same site for browser cookie compatibility.

`vercel.json` configures the SPA fallback and security headers. API requests have a 60-second timeout and retry once on network failures and HTTP 502, 503, or 504. The portal displays “Server is waking up…” if the backend remains unavailable. A 401 returns the user to the login screen.

Admin sessions use an HttpOnly, SameSite=Strict cookie. The portal does not put tokens in URLs or application logs. Serve the portal and API over HTTPS in production.
