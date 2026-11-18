import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Clock3, Hourglass, IndianRupee, ShieldAlert, Sparkles } from 'lucide-react';
import { inr } from '../api';
import mark from '../assets/mark.png';
import { useLoad } from '../hooks';

type D = { totalBusinesses: number; pendingApprovals: number; activeSubscriptions: number; expiringSoon: number; expiredOrSuspended: number; rejected: number; subscriptionRevenue: number; byStatus: Record<string, number> };
export default function Dashboard({ email: _email }: { email: string }) {
  const [f, setF] = useState({ status: '', type: '', from: '', to: '', payment: '' });
  const qs = new URLSearchParams(Object.entries(f).filter(([, v]) => v)).toString();
  const { data: d, err, loading } = useLoad<D>('/dashboard' + (qs ? '?' + qs : ''));
  const set = (k: string) => (e: any) => setF({ ...f, [k]: e.target.value });
  const max = Math.max(1, ...Object.values(d?.byStatus || {}));
  return (<>
    <div className="hero"><div><h1>{greet()} ☕</h1><p>{d ? (d.pendingApprovals ? `${d.pendingApprovals} subscription${d.pendingApprovals > 1 ? 's' : ''} waiting for your approval.` : 'You are all caught up — nothing is waiting for approval.') : 'Loading your numbers…'}</p></div><img src={mark} alt="" /></div>
    {err && <div className="err">{err}</div>}
    <div className="grid kpis">
      <K l="Registered businesses" v={d?.totalBusinesses} icon={<Building2 size={22} />} />
      <K l="Pending approvals" v={d?.pendingApprovals} attn={!!d?.pendingApprovals} to="/approvals" icon={<Hourglass size={22} />} />
      <K l="Active subscriptions" v={d?.activeSubscriptions} icon={<Sparkles size={22} />} />
      <K l="Expiring within 30 days" v={d?.expiringSoon} icon={<Clock3 size={22} />} />
      <K l="Expired / suspended" v={d?.expiredOrSuspended} icon={<ShieldAlert size={22} />} />
      <K l="Verified revenue" v={d ? inr(d.subscriptionRevenue) : undefined} icon={<IndianRupee size={22} />} />
    </div>
    <div className="grid two">
      <div className="card"><h2>Filters</h2>
        <div className="row">
          <label>Subscription status<select value={f.status} onChange={set('status')}><option value="">All</option>{['pending', 'active', 'expiring_soon', 'expired', 'suspended', 'rejected', 'none'].map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}</select></label>
          <label>Payment state<select value={f.payment} onChange={set('payment')}><option value="">All</option>{['unverified', 'verified', 'rejected'].map(s => <option key={s}>{s}</option>)}</select></label>
        </div>
        <div className="row">
          <label>Business type<input value={f.type} onChange={set('type')} placeholder="e.g. cafe" /></label>
          <label>Registered from<input type="date" value={f.from} onChange={set('from')} /></label>
          <label>Registered to<input type="date" value={f.to} onChange={e => setF({ ...f, to: e.target.value ? e.target.value + 'T23:59:59.999Z' : '' })} /></label>
        </div>
        <button className="sec sm" onClick={() => setF({ status: '', type: '', from: '', to: '', payment: '' })}>Clear filters</button>
      </div>
      <div className="card"><h2>Businesses by status {loading && <span className="mut">· updating…</span>}</h2>
        <div className="bars">{Object.entries(d?.byStatus || {}).map(([k, v]) => (
          <div className="bar" key={k}><span>{k.replace('_', ' ')}</span><span className="t"><i style={{ width: `${(v / max) * 100}%` }} /></span><b>{v}</b></div>))}</div>
      </div>
    </div>
  </>);
}
const greet = () => { const h = new Date().getHours(); return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'; };
function K({ l, v, attn, to, icon }: { l: string; v: any; attn?: boolean; to?: string; icon: React.ReactNode }) {
  const body = <><span className="kpi-ic">{icon}</span><div><div className="l">{l}</div><div className="v">{v ?? '…'}</div></div></>;
  return <div className={'kpi' + (attn ? ' attn' : '')}>{to ? <Link to={to} style={{ color: 'inherit', textDecoration: 'none', display: 'flex', gap: 14, alignItems: 'center', width: '100%' }}>{body}</Link> : body}</div>;
}
