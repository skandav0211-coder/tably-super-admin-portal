import { useEffect, useState } from 'react';
import { api } from '../api';
import { useLoad } from '../hooks';
import { useUi } from '../ui';

const LABELS: Record<string, [string, string]> = {
  plan_months: ['Subscription length (months)', 'Applied when a request is approved'],
  plan_price: ['Plan price (₹)', 'Approvals below this need an override reason. 0 = no check'],
  reminder_days: ['Renewal reminder days', 'Comma separated, e.g. 30,15,7,1'],
  max_devices: ['Maximum devices per business', 'SRS default: 3'],
  grace_days: ['Grace period after expiry (days)', '0 = locked immediately at expiry'],
  offline_window_hours: ['Offline billing window (hours)', 'How long a device may bill without contacting the server'],
  payment_instructions: ['Payment instructions shown in the app', 'e.g. your UPI ID / bank details and how to submit the reference'],
  support_contact: ['Support contact shown in the app', 'Phone, email or WhatsApp'],
  receipt_footer_default: ['Default receipt footer', 'Used when a business has not set its own footer'],
};
const LONG = ['payment_instructions'];
export default function Settings() {
  const { data, err } = useLoad<Record<string, string>>('/settings'); const { toast } = useUi();
  const [v, setV] = useState<Record<string, string>>({});
  useEffect(() => { if (data) setV(data); }, [data]);
  async function save() {
    const changed = Object.fromEntries(Object.entries(v).filter(([k, x]) => data && data[k] !== x));
    if (!Object.keys(changed).length) return toast('Nothing changed');
    try { await api('PUT', '/settings', changed); toast('Settings saved (audited)'); } catch (e: any) { toast(e.message, true); }
  }
  return (<>
    <div className="top"><div><h1>System settings</h1><div className="sub">Every change is written to the audit log</div></div></div>
    {err && <div className="err">{err}</div>}
    <div className="card" style={{ maxWidth: 640 }}>
      {Object.entries(LABELS).map(([k, [l, h]]) => <label key={k}>{l}{LONG.includes(k) ? <textarea rows={3} value={v[k] ?? ''} onChange={e => setV({ ...v, [k]: e.target.value })} /> : <input value={v[k] ?? ''} onChange={e => setV({ ...v, [k]: e.target.value })} />}<span className="mut" style={{ fontWeight: 400 }}>{h}</span></label>)}
      <button onClick={save}>Save settings</button></div>
  </>);
}
