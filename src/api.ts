export class ApiError extends Error { constructor(public status: number, message: string, public code?: string) { super(message); } }
let onUnauthorized: () => void = () => {};
export const setUnauthorizedHandler = (fn: () => void) => { onUnauthorized = fn; };
const API_BASE = import.meta.env.VITE_API_BASE || '';
export const adminApiUrl = (path: string) => `${API_BASE}/admin-api${path}`;

export async function api<T = any>(method: string, path: string, body?: unknown): Promise<T> {
  const request = {
    method,
    credentials: 'include' as const,
    headers: { 'content-type': 'application/json', 'x-csrf': '1' },
    body: body === undefined ? undefined : JSON.stringify(body),
  };
  let r: Response;
  for (let attempt = 0; ; attempt++) {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 60_000);
    try {
      r = await fetch(adminApiUrl(path), { ...request, signal: controller.signal });
    } catch (error) {
      if (attempt === 0) continue;
      throw new ApiError(0, 'Server is waking up… Please try again in a moment.');
    } finally {
      window.clearTimeout(timeout);
    }
    if (![502, 503, 504].includes(r.status) || attempt > 0) break;
  }
  if ([502, 503, 504].includes(r.status)) {
    throw new ApiError(r.status, 'Server is waking up… Please try again in a moment.');
  }
  const text = await r.text();
  let j: any; try { j = JSON.parse(text); } catch { j = text; }
  if (r.status === 401 && !path.startsWith('/login')) { onUnauthorized(); throw new ApiError(401, 'Session expired. Please sign in again.'); }
  if (!r.ok) throw new ApiError(r.status, (j && j.error) || r.statusText, j && j.code);
  return j as T;
}
export const fmt = (d?: string | null) => d ? new Date(d).toLocaleString() : '—';
export const fmtDate = (d?: string | null) => d ? new Date(d).toLocaleDateString() : '—';
export const inr = (n: number | null | undefined) => '₹' + Number(n ?? 0).toLocaleString('en-IN');
