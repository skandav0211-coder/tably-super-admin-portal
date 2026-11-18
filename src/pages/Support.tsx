import { Link } from 'react-router-dom';
import { api, fmt } from '../api';
import { useLoad } from '../hooks';
import { Empty, Pill, useUi } from '../ui';

export default function Support() {
  const { data, err, reload } = useLoad<any[]>('/support'); const { toast } = useUi();
  return (<>
    <div className="top"><div><h1>Support requests</h1></div></div>
    {err && <div className="err">{err}</div>}
    <div className="card tw">{data && data.length === 0 ? <Empty>No support requests.</Empty> :
      <table><thead><tr><th>When</th><th>Business</th><th>Request</th><th>Status</th><th></th></tr></thead><tbody>
        {data?.map(s => <tr key={s.id}><td>{fmt(s.created_at)}</td><td><Link to={`/customers/${s.business_id}`}>{s.business_name}</Link></td><td><b>{s.subject}</b><div>{s.message}</div></td><td><Pill s={s.status} /></td>
          <td>{s.status === 'open' && <button className="sec sm" onClick={async () => { try { await api('POST', `/support/${s.id}/resolve`, {}); toast('Marked resolved'); reload(); } catch (e: any) { toast(e.message, true); } }}>Resolve</button>}</td></tr>)}</tbody></table>}</div>
  </>);
}
