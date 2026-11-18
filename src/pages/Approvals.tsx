import { api, fmt } from '../api';
import { useLoad } from '../hooks';
import { Contact, Empty, Pill, REASON, useUi } from '../ui';
import { Link } from 'react-router-dom';

type Row = { subscription_id: string; plan: string; amount: number; created_at: string; admin_message: string | null; business_id: string; business_name: string; owner_name: string; phone: string | null; email: string | null;
  payment_id: string; paid_amount: number | null; method: string | null; provider_ref: string; evidence: string | null; verification_state: string };

export default function Approvals({ onChange }: { onChange: () => void }) {
  const { data, err, reload } = useLoad<Row[]>('/approvals');
  const { ask, toast } = useUi();
  const act = async (fn: () => Promise<any>, ok: string) => { try { await fn(); toast(ok); reload(); onChange(); } catch (e: any) { toast(e.message, true); } };

  async function approve(r: Row) {
    const v = await ask('Approve subscription', [], { confirm: 'Approve & activate', note: `Activates a 12-month subscription for ${r.business_name}. The customer is notified immediately.` });
    if (!v) return;
    try { await api('POST', `/subscriptions/${r.subscription_id}/approve`, {}); toast('Approved — subscription is active'); reload(); onChange(); }
    catch (e: any) {
      if (e.code === 'AMOUNT_BELOW_PRICE') {
        const o = await ask('Amount below plan price', [{ key: 'overrideReason', label: 'Why approve anyway?', textarea: true, required: true }], { note: e.message, confirm: 'Approve with override' });
        if (o) await act(() => api('POST', `/subscriptions/${r.subscription_id}/approve`, o), 'Approved with override');
      } else toast(e.message, true);
    }
  }
  return (<>
    <div className="top"><div><h1>Pending approvals</h1><div className="sub">Payment alone never unlocks paid features — verify the payment, then approve.</div></div></div>
    {err && <div className="err">{err}</div>}
    <div className="card tw">
      {data && data.length === 0 ? <Empty>🎉 Nothing waiting for approval.</Empty> : (
        <table><thead><tr><th>Submitted</th><th>Business</th><th>Owner</th><th>Payment</th><th>Reference</th><th>State</th><th>Actions</th></tr></thead><tbody>
          {data?.map(r => (<tr key={r.subscription_id}>
            <td>{fmt(r.created_at)}</td>
            <td><Link to={`/customers/${r.business_id}`}>{r.business_name}</Link><div className="mono mut">{r.business_id}</div></td>
            <td>{r.owner_name}<Contact phone={r.phone} email={r.email} /></td>
            <td>₹{r.paid_amount ?? r.amount ?? '—'}<div className="mut">{r.method || '—'} · {r.plan}</div></td>
            <td><span className="mono">{r.provider_ref}</span>{r.evidence && <div className="mut">{r.evidence}</div>}{r.admin_message && <div className="mut">Sent: “{r.admin_message}”</div>}</td>
            <td><Pill s={r.verification_state} /></td>
            <td><div className="actions">
              {r.verification_state !== 'verified'
                ? <button className="sec sm" onClick={async () => { const v = await ask('Mark payment verified', [{ key: 'note', label: 'Where did you verify it? (gateway / bank statement / UTR)', required: true }], { note: 'A screenshot alone is not proof of payment.' }); if (v) act(() => api('POST', `/subscriptions/${r.subscription_id}/verify-payment`, v), 'Payment marked verified'); }}>Verify payment</button>
                : <button className="ok sm" onClick={() => approve(r)}>Approve</button>}
              <button className="sec sm" onClick={async () => { const v = await ask('Request more information', [{ key: 'message', label: 'Message to customer', textarea: true, required: true }]); if (v) act(() => api('POST', `/subscriptions/${r.subscription_id}/clarify`, v), 'Customer notified'); }}>Ask info</button>
              <button className="bad sm" onClick={async () => { const v = await ask('Reject request', REASON, { danger: true, confirm: 'Reject' }); if (v) act(() => api('POST', `/subscriptions/${r.subscription_id}/reject`, v), 'Request rejected'); }}>Reject</button>
            </div></td></tr>))}
        </tbody></table>)}
    </div></>);
}
