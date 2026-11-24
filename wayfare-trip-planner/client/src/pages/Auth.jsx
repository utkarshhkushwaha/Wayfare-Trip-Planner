import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { errMsg } from '../api';
import { useAuth } from '../context/AuthContext.jsx';
import Img from '../components/Img.jsx';
import { IMG } from '../images.js';

export default function Auth({ portal, mode }) {
  const isAdmin = portal === 'admin';
  const isRegister = mode === 'register';
  const base = isAdmin ? '/admin' : '';
  const { signIn } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'travel_partner', companyName: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    setBusy(true);
    try {
      const { data } = await api.post(`/auth/${portal}/${mode}`, form);
      signIn(data);
      nav(isAdmin ? '/admin' : '/plan');
    } catch (ex) {
      setErr(errMsg(ex));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={`auth-shell ${isAdmin ? 'is-admin' : ''}`}>
      <aside className="auth-art">
        <Img src={isAdmin ? IMG.authAdmin : IMG.authUser} alt="" seed={isAdmin ? 3 : 0} loading="eager" />
        <div className="auth-art-text">
          <h3>{isAdmin ? 'Reach travellers while they compare.' : 'Your next trip, priced end to end.'}</h3>
          <p>{isAdmin ? 'List your routes or stays and see when they are selected.' : 'Compare routes and stays side by side and keep the itinerary you like.'}</p>
        </div>
      </aside>
      <div className="auth-form">
        <p className="eyebrow">{isAdmin ? 'Partner portal' : 'Traveller portal'}</p>
        <h2>{isRegister ? (isAdmin ? 'Register your business' : 'Create your account') : 'Welcome back'}</h2>
        <form onSubmit={submit} className="stack">
          {isRegister && <label>Full name<input value={form.name} onChange={set('name')} required /></label>}
          {isRegister && isAdmin && (
            <>
              <label>Partner type
                <select value={form.role} onChange={set('role')}>
                  <option value="travel_partner">Travel partner (flights, trains, buses, cabs)</option>
                  <option value="accommodation_partner">Accommodation partner (stays)</option>
                </select>
              </label>
              <label>Business name<input value={form.companyName} onChange={set('companyName')} /></label>
            </>
          )}
          <label>Email<input type="email" value={form.email} onChange={set('email')} required /></label>
          <label>Password<input type="password" minLength={6} value={form.password} onChange={set('password')} required /></label>
          {err && <p className="error">{err}</p>}
          <button className="btn lg" disabled={busy}>{busy ? 'Please wait' : isRegister ? 'Create account' : 'Sign in'}</button>
        </form>
        <p className="muted small">
          {isRegister ? 'Already registered? ' : 'New here? '}
          <Link className="textlink" to={`${base}/${isRegister ? 'login' : 'register'}`}>{isRegister ? 'Sign in' : 'Create an account'}</Link>
        </p>
        <p className="muted small">
          {isAdmin ? 'Travelling instead? ' : 'Run a travel or stay business? '}
          <Link className="textlink" to={isAdmin ? '/login' : '/admin/login'}>{isAdmin ? 'Traveller sign in' : 'Partner sign in'}</Link>
        </p>
      </div>
    </div>
  );
}
