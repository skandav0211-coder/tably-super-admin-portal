# Tably Super Admin Portal

Standalone React + TypeScript web application for Super Admin account management, subscriptions, customers, devices, support, and audit history. It is deployed independently from the backend API.

## Run locally

```sh
npm ci
npm run dev
```

The Vite development server proxies `/admin-api` to `http://localhost:3000`. Start the backend separately.

## Build and deploy

```sh
npm run build
```

Deploy the generated `dist/` directory to a static web host. Configure `VITE_API_BASE` to the backend origin (for example `https://api.example.com`; no trailing path is needed), rebuild, and add the exact portal origin to the backend's `ADMIN_PORTAL_ORIGINS` allowlist. Use sibling HTTPS subdomains on the same site for browser cookie compatibility.

Admin sessions use an HttpOnly, SameSite=Strict cookie. Serve the portal and API over HTTPS in production.
