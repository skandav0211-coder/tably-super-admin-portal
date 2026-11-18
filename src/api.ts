export class ApiError extends Error { constructor(public status: number, message: string, public code?: string) { super(message); } }
let onUnauthorized: () => void = () => {};
export const setUnauthorizedHandler = (fn: () => void) => { onUnauthorized = fn; };
const API_BASE = (import.meta.env.VITE_API_BASE || '').replace(/\/+$/, '');
export const adminApiUrl = (path: string) => `${API_BASE}/admin-api${path}`;

export async function api<T = any>(method: string, path: string, body?: unknown): Promise<T> {
  const r = await fetch(adminApiUrl(path), {
    method, credentials: 'include',
    headers: { 'content-type': 'application/json', 'x-csrf': '1' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await r.text();
  let j: any; try { j = JSON.parse(text); } catch { j = text; }
  if (r.status === 401 && !path.startsWith('/login')) { onUnauthorized(); throw new ApiError(401, 'Session expired. Please sign in again.'); }
  if (!r.ok) throw new ApiError(r.status, (j && j.error) || r.statusText, j && j.code);
  return j as T;
}
export const fmt = (d?: string | null) => d ? new Date(d).toLocaleString() : '—';
export const fmtDate = (d?: string | null) => d ? new Date(d).toLocaleDateString() : '—';
export const inr = (n: number | null | undefined) => '₹' + Number(n ?? 0).toLocaleString('en-IN');
