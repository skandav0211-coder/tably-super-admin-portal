# Tably Super Admin Portal

Standalone React + TypeScript web application for Super Admin account management, subscriptions, customers, devices, support, and audit history. It is deployed independently from the backend API.

## Run locally

```sh
npm ci
```

For local development, set `VITE_API_BASE` to the backend's full HTTPS origin in `.env.local`. Production uses same-origin requests through the Vercel `/admin-api` rewrite, so leave `VITE_API_BASE` empty or unset in production.

```dotenv
# .env.local
VITE_API_BASE=https://tably-backend-production.up.railway.app
```

```sh
npm run dev
```

## Build and deploy

```sh
npm ci
npm run build
```

The production build intentionally permits `VITE_API_BASE` to be empty or unset. If a non-empty value is supplied to a production build, it fails with a message because production API calls must use the same-origin Vercel proxy. For local development, a configured base must be an HTTPS origin with no path, query, fragment, or credentials; a trailing slash is normalized away.

### Deploy to Vercel

1. Import the standalone Super Admin portal repository into Vercel.
2. Set **Framework Preset** to **Vite**, **Root Directory** to the repository root, **Install Command** to `npm ci`, **Build Command** to `npm run build`, and **Output Directory** to `dist`.
3. Remove `VITE_API_BASE` from the Vercel **Production** and **Preview** environment variables (or leave it unset). Do not set it to the backend URL for production builds.
4. Redeploy. Production requests go to the portal's own origin at `/admin-api/...`; `vercel.json` proxies them to `https://tably-backend-production.up.railway.app/admin-api/...` before the SPA fallback. The browser therefore receives and sends the session cookie on the portal origin.
5. Keep `credentials: 'include'` enabled for API fetches.

`vercel.json` configures the SPA fallback and security headers. API requests have a 60-second timeout and retry once on network failures and HTTP 502, 503, or 504. The portal displays “Server is waking up…” if the backend remains unavailable. A 401 returns the user to the login screen.

Admin sessions use an HttpOnly, SameSite=Strict cookie. The portal does not put tokens in URLs or application logs. Serve the portal over HTTPS in production.
