import { createContext, ReactNode, useCallback, useContext, useRef, useState } from 'react';

export const Pill = ({ s }: { s: string }) => <span className={`pill p-${s}`}>{s.replace('_', ' ')}</span>;
export const Empty = ({ children }: { children: ReactNode }) => <div className="empty">{children}</div>;
export function Contact({ phone, email }: { phone?: string | null; email?: string | null }) {
  const { toast } = useUi();
  async function copy() {
    if (!phone) return;
    try { await navigator.clipboard.writeText(phone); toast('Phone number copied'); }
    catch { toast('Could not access clipboard', true); }
  }
  return <div className="contact">
    {phone ? <><a href={`tel:${encodeURIComponent(phone)}`}>{phone}</a> <button type="button" className="sec sm" onClick={copy} aria-label={`Copy ${phone}`}>Copy</button></> : <span className="mut">—</span>}
    {email ? <div className="mut">{email}</div> : null}
  </div>;
}

type Field = { key: string; label: string; textarea?: boolean; required?: boolean; type?: string };
type Ask = (title: string, fields: Field[], opts?: { confirm?: string; danger?: boolean; note?: string }) => Promise<Record<string, string> | null>;
type Toast = (msg: string, err?: boolean) => void;
const Ctx = createContext<{ ask: Ask; toast: Toast }>({ ask: async () => null, toast: () => {} });
export const useUi = () => useContext(Ctx);

export function UiProvider({ children }: { children: ReactNode }) {
  const [dlg, setDlg] = useState<null | { title: string; fields: Field[]; confirm: string; danger: boolean; note?: string; res: (v: Record<string, string> | null) => void }>(null);
  const [toast, setToast] = useState<null | { msg: string; err: boolean }>(null);
  const timer = useRef<number>();
  const ask: Ask = useCallback((title, fields, o = {}) => new Promise(res => setDlg({ title, fields, confirm: o.confirm || 'Confirm', danger: !!o.danger, note: o.note, res })), []);
  const t: Toast = useCallback((msg, err = false) => { setToast({ msg, err }); window.clearTimeout(timer.current); timer.current = window.setTimeout(() => setToast(null), 4200); }, []);
  return (
    <Ctx.Provider value={{ ask, toast: t }}>
      {children}
      {dlg && (
        <div className="overlay" role="dialog" aria-modal="true" onMouseDown={e => { if (e.target === e.currentTarget) { dlg.res(null); setDlg(null); } }}>
          <form className="modal" onSubmit={e => {
            e.preventDefault(); const f = new FormData(e.currentTarget); const o: Record<string, string> = {};
            dlg.fields.forEach(x => (o[x.key] = String(f.get(x.key) ?? '').trim())); dlg.res(o); setDlg(null);
          }}>
            <h3>{dlg.title}</h3>
            {dlg.note && <p className="mut">{dlg.note}</p>}
            {dlg.fields.map((x, i) => (
              <label key={x.key}>{x.label}
                {x.textarea ? <textarea name={x.key} required={x.required} rows={3} autoFocus={i === 0} /> : <input name={x.key} type={x.type || 'text'} required={x.required} autoFocus={i === 0} />}
              </label>
            ))}
            <div className="actions">
              <button type="button" className="sec" onClick={() => { dlg.res(null); setDlg(null); }}>Cancel</button>
              <button className={dlg.danger ? 'bad' : ''}>{dlg.confirm}</button>
            </div>
          </form>
        </div>
      )}
      {toast && <div className={'toast' + (toast.err ? ' err2' : '')} role="status">{toast.msg}</div>}
    </Ctx.Provider>
  );
}
export const REASON: Field[] = [{ key: 'reason', label: 'Reason (recorded in the audit log)', textarea: true, required: true }];
