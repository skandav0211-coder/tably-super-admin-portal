import { useCallback, useEffect, useState } from 'react';
import { api } from './api';
export function useLoad<T>(path: string | null, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null); const [err, setErr] = useState<string | null>(null); const [loading, setLoading] = useState(true);
  const reload = useCallback(() => { if (!path) return; setLoading(true); api<T>('GET', path).then(d => { setData(d); setErr(null); }).catch(e => setErr(e.message)).finally(() => setLoading(false)); }, [path]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(reload, [reload, ...deps]);
  return { data, err, loading, reload };
}
