import { useState } from 'react';
import { Link } from 'react-router-dom';
import { fmtDate } from '../api';
import { useLoad } from '../hooks';
import { Contact, Empty, Pill } from '../ui';

type C = { business_id: string; name: string; type: string; account_status: string; created_at: string; user_id: string; owner_name: string; phone: string | null; email: string | null; subscriptionStatus: string };
export default function Customers() {
  const [q, setQ] = useState(''); const [term, setTerm] = useState('');
  const { data, err, loading } = useLoad<C[]>('/customers?q=' + encodeURIComponent(term));
  return (<>
    <div className="top"><div><h1>Customers</h1><div className="sub">Search by user ID, business ID, name, phone or email</div></div></div>
    <form className="card row" onSubmit={e => { e.preventDefault(); setTerm(q.trim()); }}>
      <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search customers…" aria-label="Search customers" /><button>Search</button>
    </form>
    {err && <div className="err">{err}</div>}
    <div className="card tw" style={{ marginTop: 16 }}>
      {data && data.length === 0 ? <Empty>No customers found.</Empty> : (
        <table><thead><tr><th>Business</th><th>Owner</th><th>Contact</th><th>Type</th><th>Subscription</th><th>Account</th><th>Registered</th></tr></thead><tbody>
          {data?.map(c => (<tr key={c.business_id}>
            <td><Link to={`/customers/${c.business_id}`}>{c.name}</Link><div className="mono mut">{c.business_id}</div></td>
            <td>{c.owner_name}<div className="mono mut">{c.user_id}</div></td><td><Contact phone={c.phone} email={c.email} /></td>
            <td>{c.type}</td><td><Pill s={c.subscriptionStatus} /></td><td><Pill s={c.account_status} /></td><td>{fmtDate(c.created_at)}</td></tr>))}
        </tbody></table>)}
      {loading && <div className="mut" style={{ padding: 8 }}>Loading…</div>}
    </div></>);
}
