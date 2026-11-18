import { FormEvent } from 'react';
import { api, fmt } from '../api';
import { useLoad } from '../hooks';
import { useUi } from '../ui';

export default function Releases() {
  const { data, err, reload } = useLoad<any[]>('/releases'); const { toast } = useUi();
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); const form = e.currentTarget; const f = new FormData(form);
    try { await api('POST', '/releases', { version: f.get('version'), minSupported: Number(f.get('min') || 0), apkUrl: f.get('apk'), notes: f.get('notes') }); toast('Release published'); form.reset(); reload(); }
    catch (x: any) { toast(x.message, true); }
  }
  return (<>
    <div className="top"><div><h1>App releases</h1><div className="sub">Publish versions and set the minimum supported build</div></div></div>
    {err && <div className="err">{err}</div>}
    <form className="card" onSubmit={submit}><h2>Publish a release</h2>
      <div className="row"><label>Version<input name="version" required placeholder="1.0.3" /></label><label>Minimum supported build<input name="min" type="number" min={0} placeholder="0" /></label><label>Download URL<input name="apk" placeholder="https://…" /></label></div>
      <label>Release notes<textarea name="notes" rows={3} /></label><button>Publish</button></form>
    <div className="card tw"><table><thead><tr><th>Version</th><th>Min build</th><th>Notes</th><th>Published</th></tr></thead><tbody>
      {data?.map(r => <tr key={r.id}><td><b>{r.version}</b></td><td>{r.min_supported}</td><td>{r.notes}</td><td>{fmt(r.created_at)}</td></tr>)}</tbody></table></div>
  </>);
}
