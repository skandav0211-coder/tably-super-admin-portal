import { ClipboardEvent, FormEvent, KeyboardEvent, useEffect, useRef, useState } from 'react';
import { MailCheck, ShieldCheck } from 'lucide-react';
import { api } from '../api';
import logo from '../assets/logo-full.png';

type Me = { id: string; email: string };
type Challenge = { challenge: string; email: string; expiresInSec: number; resendAfterSec: number };

export default function Login({ onDone }: { onDone: (m: Me) => void }) {
  const [step, setStep] = useState<'password' | 'code'>('password'); const [ch, setCh] = useState<Challenge | null>(null);
  const [err, setErr] = useState(''); const [info, setInfo] = useState(''); const [busy, setBusy] = useState(false); const [wait, setWait] = useState(0);
  const [digits, setDigits] = useState<string[]>(Array(6).fill('')); const refs = useRef<(HTMLInputElement | null)[]>([]);
  useEffect(() => { if (wait <= 0) return; const t = setTimeout(() => setWait(wait - 1), 1000); return () => clearTimeout(t); }, [wait]);
  useEffect(() => { if (step === 'code') refs.current[0]?.focus(); }, [step]);

  async function password(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); setBusy(true); setErr(''); const f = new FormData(e.currentTarget);
    try { const c = await api<Challenge>('POST', '/login', { email: f.get('email'), password: f.get('password') }); setCh(c); setWait(c.resendAfterSec); setDigits(Array(6).fill('')); setStep('code'); }
    catch (x: any) { setErr(x.message); } finally { setBusy(false); }
  }
  async function verify(code: string) {
    if (!ch || busy) return; setBusy(true); setErr('');
    try { await api('POST', '/login/verify', { challenge: ch.challenge, code }); onDone(await api('GET', '/me')); }
    catch (x: any) { setErr(x.message); setDigits(Array(6).fill('')); refs.current[0]?.focus(); if (/start again|expired/i.test(x.message)) { setStep('password'); } } finally { setBusy(false); }
  }
  function setDigit(i: number, v: string) {
    const d = v.replace(/\D/g, ''); if (!d) { const n = [...digits]; n[i] = ''; setDigits(n); return; }
    const n = [...digits]; d.split('').slice(0, 6 - i).forEach((c, k) => (n[i + k] = c)); setDigits(n);
    refs.current[Math.min(i + d.length, 5)]?.focus(); if (n.every(Boolean)) void verify(n.join(''));
  }
  const key = (i: number) => (e: KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Backspace' && !digits[i] && i > 0) refs.current[i - 1]?.focus(); };
  const paste = (e: ClipboardEvent<HTMLInputElement>) => { const t = e.clipboardData.getData('text').replace(/\D/g, ''); if (t.length >= 6) { e.preventDefault(); setDigit(0, t.slice(0, 6)); } };
  async function resend() { if (!ch) return; setErr(''); setInfo('');
    try { const c = await api<Challenge>('POST', '/login/resend', { challenge: ch.challenge }); setCh(c); setWait(c.resendAfterSec); setInfo('A new code is on its way.'); } catch (x: any) { setErr((x as Error).message); } }

  return (
    <div className="login">
      <section className="bp"><div className="tile"><img src={logo} alt="Tably — cafe billing app" /></div>
        <h2>Run every café.<br />Beautifully.</h2><p>The owner console for subscriptions, devices and approvals — all in one warm, simple place.</p></section>
      <section className="fp">
        {step === 'password' ? (
          <form onSubmit={password}>
            <h1>Welcome back</h1><p className="mut" style={{ marginTop: 0 }}>Owner access only. We will email you a one-time code after your password.</p>
            {err && <div className="err" role="alert">{err}</div>}
            <label>Email<input name="email" type="email" autoComplete="username" required autoFocus /></label>
            <label>Password<input name="password" type="password" autoComplete="current-password" required /></label>
            <button style={{ width: '100%' }} disabled={busy}>{busy ? 'Checking…' : 'Continue'}</button>
          </form>
        ) : (
          <div className="box">
            <MailCheck size={34} color="var(--pri)" /><h1>Check your email</h1>
            <p className="mut" style={{ marginTop: 0 }}>We sent a 6-digit code to <b>{ch?.email}</b>. It expires in {Math.round((ch?.expiresInSec || 600) / 60)} minutes.</p>
            {err && <div className="err" role="alert">{err}</div>}{info && <div className="okmsg">{info}</div>}
            <div className="otp" role="group" aria-label="6-digit code">
              {digits.map((d, i) => <input key={i} ref={el => (refs.current[i] = el)} value={d} inputMode="numeric" autoComplete={i === 0 ? 'one-time-code' : 'off'} maxLength={6} aria-label={`Digit ${i + 1}`} onChange={e => setDigit(i, e.target.value)} onKeyDown={key(i)} onPaste={paste} />)}
            </div>
            <button style={{ width: '100%', marginTop: 10 }} disabled={busy || digits.some(x => !x)} onClick={() => verify(digits.join(''))}><ShieldCheck size={16} style={{ verticalAlign: -3, marginRight: 6 }} />{busy ? 'Verifying…' : 'Verify & sign in'}</button>
            <div className="row" style={{ marginTop: 10, justifyContent: 'space-between' }}>
              <button className="link" disabled={wait > 0} onClick={resend}>{wait > 0 ? `Resend code in ${wait}s` : 'Resend code'}</button>
              <button className="link" onClick={() => { setStep('password'); setErr(''); setInfo(''); }}>Use a different account</button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
