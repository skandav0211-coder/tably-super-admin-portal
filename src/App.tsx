import { useCallback, useEffect, useState } from 'react';
import { NavLink, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { BadgeCheck, LayoutDashboard, LifeBuoy, LogOut, Menu, Rocket, ScrollText, Settings as Cog, Smartphone, Users, X } from 'lucide-react';
import { ApiError, api, setUnauthorizedHandler } from './api';
import mark from './assets/mark.png';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Approvals from './pages/Approvals';
import Customers from './pages/Customers';
import CustomerDetail from './pages/CustomerDetail';
import Devices from './pages/Devices';
import Releases from './pages/Releases';
import Support from './pages/Support';
import Settings from './pages/Settings';
import Audit from './pages/Audit';

type Me = { id: string; email: string };
const NAV = [['/', 'Dashboard', LayoutDashboard], ['/approvals', 'Approvals', BadgeCheck], ['/customers', 'Customers', Users], ['/devices', 'Devices', Smartphone],
  ['/releases', 'App releases', Rocket], ['/support', 'Support', LifeBuoy], ['/settings', 'Settings', Cog], ['/audit', 'Audit log', ScrollText]] as const;
const BOTTOM = ['/', '/approvals', '/customers', '/devices'];

/** On small screens every table row becomes a labelled card: copy each column header onto its cells. */
function useResponsiveTables() {
  useEffect(() => {
    const label = () => document.querySelectorAll<HTMLTableElement>('.tw table').forEach(t => {
      const heads = [...t.querySelectorAll('thead th')].map(h => h.textContent || '');
      t.querySelectorAll('tbody tr').forEach(tr => [...tr.children].forEach((td, i) => { const el = td as HTMLElement; if (!el.dataset.label) el.dataset.label = heads[i] || ''; }));
    });
    const mo = new MutationObserver(label); mo.observe(document.getElementById('root')!, { childList: true, subtree: true }); label(); return () => mo.disconnect();
  }, []);
}

export default function App() {
  const [me, setMe] = useState<Me | null | undefined>(undefined); const [bootstrapError, setBootstrapError] = useState(''); const [pending, setPending] = useState(0); const [open, setOpen] = useState(false); const loc = useLocation();
  useResponsiveTables();
  useEffect(() => { setUnauthorizedHandler(() => setMe(null)); api<Me>('GET', '/me').then(setMe).catch((error: Error) => { if (!(error instanceof ApiError) || error.status !== 401) setBootstrapError(error.message); setMe(null); }); }, []);
  useEffect(() => setOpen(false), [loc.pathname]);
  const refreshPending = useCallback(() => { api<any[]>('GET', '/approvals').then(r => setPending(r.length)).catch(() => {}); }, []);
  useEffect(() => { if (me) { refreshPending(); const t = setInterval(refreshPending, 30000); return () => clearInterval(t); } }, [me, refreshPending]);
  const signOut = async () => { await api('POST', '/logout').catch(() => {}); setMe(null); };

  if (me === undefined) return <div className="login" style={{ placeItems: 'center', display: 'grid' }}><div className="mut">Loading…</div></div>;
  if (!me) return <Login onDone={setMe} initialError={bootstrapError} />;
  const title = NAV.find(([to]) => (to === '/' ? loc.pathname === '/' : loc.pathname.startsWith(to)))?.[1] || (loc.pathname.startsWith('/customers') ? 'Customer' : '');
  const links = (cls = '') => NAV.map(([to, label, Icon]) => (
    <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => 'navl ' + cls + (isActive ? ' active' : '')}><Icon size={19} /> {label}{to === '/approvals' && pending > 0 && <span className="badge-n">{pending}</span>}</NavLink>));
  const brand = <div className="brand"><span className="logo"><img src={mark} alt="" /></span><div><div className="brand-name">Tably</div><div className="brand-sub">Admin</div></div></div>;
  return (
    <div className="shell">
      <aside className="side">{brand}{links()}<div className="grow" /><div className="me">{me.email}</div><a className="navl" href="#/" onClick={e => { e.preventDefault(); void signOut(); }}><LogOut size={19} /> Sign out</a></aside>
      <header className="topbar"><button className="iconbtn" aria-label="Open menu" onClick={() => setOpen(true)}><Menu size={24} /></button><span className="logo"><img src={mark} alt="" /></span><span className="brand-name">Tably</span><span className="ttl">{title}</span></header>
      <div className={'scrim' + (open ? ' on' : '')} onClick={() => setOpen(false)} />
      <nav className={'drawer' + (open ? ' on' : '')} aria-label="Menu"><div className="row" style={{ justifyContent: 'space-between', alignItems: 'center', flexWrap: 'nowrap' }}>{brand}<button className="iconbtn" aria-label="Close menu" onClick={() => setOpen(false)}><X size={22} /></button></div>
        {links()}<div className="grow" /><div className="me">{me.email}</div><a className="navl" href="#/" onClick={e => { e.preventDefault(); void signOut(); }}><LogOut size={19} /> Sign out</a></nav>
      <main className="main">
        <Routes>
          <Route path="/" element={<Dashboard email={me.email} />} />
          <Route path="/approvals" element={<Approvals onChange={refreshPending} />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/customers/:id" element={<CustomerDetail />} />
          <Route path="/devices" element={<Devices />} />
          <Route path="/releases" element={<Releases />} />
          <Route path="/support" element={<Support />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/audit" element={<Audit />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      <nav className="bottomnav" aria-label="Quick navigation">
        {NAV.filter(([to]) => BOTTOM.includes(to)).map(([to, label, Icon]) => <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => (isActive ? 'active' : '')}><Icon size={21} />{label.split(' ')[0]}{to === '/approvals' && pending > 0 && <span className="badge-n">{pending}</span>}</NavLink>)}
        <button className="bn" onClick={() => setOpen(true)}><Menu size={21} />More</button>
      </nav>
    </div>
  );
}
