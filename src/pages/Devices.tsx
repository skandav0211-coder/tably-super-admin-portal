import { Link } from 'react-router-dom';
import { api, fmt } from '../api';
import { useLoad } from '../hooks';
import { Empty, Pill, REASON, useUi } from '../ui';

export default function Devices() {
  const d = useLoad<any[]>('/devices'); const ev = useLoad<any[]>('/security-events');
  const { ask, toast } = useUi();
  const revoke = async (id: string) => {
    const v = await ask('Revoke device', REASON, { danger: true, confirm: 'Revoke' }); if (!v) return;
    try { await api('POST', `/devices/${id}/revoke`, v); toast('Device revoked'); d.reload(); } catch (e: any) { toast(e.message, true); }
  };
  return (<>
    <div className="top"><div><h1>Devices</h1><div className="sub">Maximum 3 active devices per business</div></div></div>
    {d.err && <div className="err">{d.err}</div>}
    <div className="card tw">{d.data && d.data.length === 0 ? <Empty>No devices registered yet.</Empty> :
      <table><thead><tr><th>Business</th><th>Slot</th><th>Label</th><th>Registered</th><th>Last seen</th><th>Status</th><th></th></tr></thead><tbody>
        {d.data?.map(x => <tr key={x.id}><td><Link to={`/customers/${x.business_id}`}>{x.business_name}</Link></td><td>{x.slot}</td><td>{x.label}<div className="mono mut">{x.id}</div></td><td>{fmt(x.registered_at)}</td><td>{fmt(x.last_seen_at)}</td><td><Pill s={x.status} /></td>
          <td>{x.status === 'active' && <button className="bad sm" onClick={() => revoke(x.id)}>Revoke</button>}</td></tr>)}</tbody></table>}</div>
    <div className="card tw"><h2>Security events</h2>{ev.data && ev.data.length === 0 ? <Empty>No suspicious events.</Empty> :
      <table><thead><tr><th>When</th><th>Business</th><th>Event</th><th>Detail</th></tr></thead><tbody>{ev.data?.map(e => <tr key={e.id}><td>{fmt(e.created_at)}</td><td className="mono">{e.business_id}</td><td>{e.kind}</td><td>{e.detail}</td></tr>)}</tbody></table>}</div>
  </>);
}
