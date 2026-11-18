import { useState } from 'react';
import { adminApiUrl, fmt } from '../api';
import { useLoad } from '../hooks';

export default function Audit() {
  const { data, err } = useLoad<any[]>('/audit?limit=1000'); const [q, setQ] = useState('');
  const rows = (data || []).filter(e => !q || JSON.stringify(e).toLowerCase().includes(q.toLowerCase()));
  return (<>
    <div className="top"><div><h1>Audit log</h1><div className="sub">Append-only. Records cannot be edited or deleted.</div></div>
      <a className="btn sec" style={{ border: '1px solid var(--line)', color: 'var(--ink)', background: 'transparent' }} href={adminApiUrl('/export/subscriptions.csv')}>Export subscriptions CSV</a></div>
    {err && <div className="err">{err}</div>}
    <div className="card"><input placeholder="Filter by actor, action, target, reason…" value={q} onChange={e => setQ(e.target.value)} aria-label="Filter audit log" /></div>
    <div className="card tw" style={{ marginTop: 16 }}><table><thead><tr><th>When</th><th>Actor</th><th>Action</th><th>Target</th><th>Reason</th><th>Change</th></tr></thead><tbody>
      {rows.map(e => <tr key={e.id}><td>{fmt(e.created_at)}</td><td className="mono">{e.actor}</td><td><b>{e.action}</b></td><td className="mono">{e.target}</td><td>{e.reason}</td><td className="mono mut">{[e.before, e.after].filter(Boolean).join(' → ')}</td></tr>)}</tbody></table></div>
  </>);
}
