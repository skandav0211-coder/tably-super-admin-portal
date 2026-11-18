import { Link, useParams } from 'react-router-dom';
import { api, fmt, fmtDate } from '../api';
import { useLoad } from '../hooks';
import { Contact, Pill, REASON, useUi } from '../ui';

export default function CustomerDetail() {
  const { id } = useParams();
  const { data: c, err, reload } = useLoad<any>(id ? '/customers/' + encodeURIComponent(id) : null, [id]);
  const { ask, toast } = useUi();
  if (err) return <div className="err">{err}</div>;
  if (!c) return <div className="mut">Loading…</div>;
  const b = c.business;
  const run = async (title: string, path: string, ok: string, danger = false) => {
    const v = await ask(title, REASON, { danger, confirm: title }); if (!v) return;
    try { await api('POST', path, v); toast(ok); reload(); } catch (e: any) { toast(e.message, true); }
  };
  const editDates = async (s: any) => {
    const v = await ask('Override subscription dates', [{ key: 'startDate', label: 'Start (YYYY-MM-DD)', required: true }, { key: 'endDate', label: 'End (YYYY-MM-DD)', required: true }, ...REASON], { note: 'Manual overrides are always audited.' });
    if (!v) return;
    try { await api('PUT', `/subscriptions/${s.id}/dates`, { reason: v.reason, startDate: new Date(v.startDate).toISOString(), endDate: new Date(v.endDate).toISOString() }); toast('Dates updated'); reload(); }
    catch (e: any) { toast(e.message, true); }
  };
  const editBusiness = async () => {
    const v = await ask('Edit business details', [
      { key: 'name', label: 'Business name' }, { key: 'type', label: 'Business type' }, { key: 'address', label: 'Address' }, { key: 'contact', label: 'Contact' }, { key: 'gstin', label: 'GSTIN' }, ...REASON,
    ], { note: 'Leave a field empty to keep its current value.' });
    if (!v) return;
    const body: Record<string, string> = { reason: v.reason };
    for (const k of ['name', 'type', 'address', 'contact', 'gstin']) if (v[k]) body[k] = v[k];
    try { await api('PUT', `/customers/${b.id}`, body); toast('Business updated (audited)'); reload(); } catch (e: any) { toast(e.message, true); }
  };
  const sendSetupInvite = async () => {
    const v = await ask('Send account setup invite', [{ key: 'email', label: 'Customer email address', type: 'email', required: true }], { confirm: 'Send invite', note: 'This will email a one-time code. The customer uses it in the app to set an email password for this existing account.' });
    if (!v) return;
    try { await api('POST', `/customers/${encodeURIComponent(b.id)}/setup-invite`, { email: v.email }); toast('Setup code sent to the customer email'); reload(); }
    catch (e: any) { toast(e.message, true); }
  };
  return (<>
    <p><Link to="/customers">← Customers</Link></p>
    <div className="top"><div><h1>{b.name} <Pill s={c.subscription.status} /></h1><div className="sub mono">{b.id}</div></div>
      <div className="actions"><button className="sec" onClick={editBusiness}>Edit details</button>{b.status === 'suspended'
        ? <button className="ok" onClick={() => run('Reinstate account', `/customers/${b.id}/reinstate`, 'Account reinstated')}>Reinstate account</button>
        : <button className="bad" onClick={() => run('Suspend account', `/customers/${b.id}/suspend`, 'Account suspended', true)}>Suspend account</button>}</div></div>
    <div className="grid two">
      <div className="card"><h2>Business</h2><dl className="kv"><dt>Type</dt><dd>{b.type}</dd><dt>Address</dt><dd>{b.address}</dd><dt>Contact</dt><dd><Contact phone={b.contact} /></dd><dt>GSTIN</dt><dd>{b.gstin || '—'}</dd><dt>Account</dt><dd><Pill s={b.status} /></dd><dt>Registered</dt><dd>{fmt(b.created_at)}</dd></dl></div>
      <div className="card"><h2>Owner</h2><dl className="kv"><dt>Name</dt><dd>{c.owner.owner_name}</dd><dt>User ID</dt><dd className="mono">{c.owner.id}</dd><dt>Phone</dt><dd><Contact phone={c.owner.phone} /></dd><dt>Email</dt><dd>{c.owner.email || '—'}</dd></dl>
        {!c.owner.email && <button className="sec" onClick={sendSetupInvite}>Send setup invite to email</button>}</div>
    </div>
    <div className="card tw"><h2>Subscriptions</h2><table><thead><tr><th>ID</th><th>Status</th><th>Start</th><th>End</th><th>Approved</th><th>Message</th><th></th></tr></thead><tbody>
      {c.subscriptions.map((s: any) => (<tr key={s.id}><td className="mono">{s.id}</td><td><Pill s={s.status} /></td><td>{fmtDate(s.start_date)}</td><td>{fmtDate(s.end_date)}</td><td>{s.approved_by ? `${s.approved_by} · ${fmtDate(s.approved_at)}` : '—'}</td><td>{s.admin_message}</td>
        <td><div className="actions">
          {s.status === 'active' && <button className="sec sm" onClick={() => run('Suspend', `/subscriptions/${s.id}/suspend`, 'Subscription suspended', true)}>Suspend</button>}
          {s.status === 'suspended' && <button className="sec sm" onClick={() => run('Reinstate', `/subscriptions/${s.id}/reinstate`, 'Subscription reinstated')}>Reinstate</button>}
          {['active', 'suspended', 'pending'].includes(s.status) && <button className="bad sm" onClick={() => run('Revoke', `/subscriptions/${s.id}/revoke`, 'Subscription revoked', true)}>Revoke</button>}
          {s.start_date && <button className="sec sm" onClick={() => editDates(s)}>Edit dates</button>}
        </div></td></tr>))}</tbody></table></div>
    <div className="card tw"><h2>Payments</h2><table><thead><tr><th>Date</th><th>Amount</th><th>Method</th><th>Reference</th><th>State</th></tr></thead><tbody>
      {c.payments.map((p: any) => <tr key={p.id}><td>{fmt(p.created_at)}</td><td>₹{p.amount ?? '—'}</td><td>{p.method}</td><td className="mono">{p.provider_ref}</td><td><Pill s={p.verification_state} /></td></tr>)}</tbody></table></div>
    <div className="card tw"><h2>Devices</h2><table><thead><tr><th>Slot</th><th>Label</th><th>Registered</th><th>Last seen</th><th>Status</th><th></th></tr></thead><tbody>
      {c.devices.map((d: any) => <tr key={d.id}><td>{d.slot}</td><td>{d.label}<div className="mono mut">{d.id}</div></td><td>{fmt(d.registered_at)}</td><td>{fmt(d.last_seen_at)}</td><td><Pill s={d.status} /></td>
        <td>{d.status === 'active' && <button className="bad sm" onClick={() => run('Revoke device', `/devices/${d.id}/revoke`, 'Device revoked', true)}>Revoke</button>}</td></tr>)}</tbody></table></div>
    <div className="card"><h2>Activity timeline</h2><ul className="tl">{c.timeline.map((t: any, i: number) => <li key={i}><b>{t.action}</b> <span className="mut">{fmt(t.created_at)} · {t.actor}</span>{t.reason && <div>{t.reason}</div>}</li>)}</ul></div>
  </>);
}
