import { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export function LoginPage() {
  const { status, login, loginAsDemoAdmin } = useAuth();
  const location = useLocation();
  const from = location.state?.from || '/cashier';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (status === 'signed-in') return <Navigate to={from} replace />;

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message || 'Sign-in failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">ISHA<br />CAFE</div>
          <h1>Staff Portal</h1>
          <p>Sign in to access Cashier · Kitchen · Admin</p>
        </div>

        {status === 'unauthorized' && (
          <div className="info-banner" style={{ display: 'flex', flexDirection: 'column', gap: 10, textAlign: 'left', lineHeight: 1.5 }}>
            <div>⚠️ Your account exists but has no staff role yet.</div>
            {useAuth().authError && (
              <div style={{ color: 'var(--red)', fontSize: 12, fontWeight: 'bold', background: 'rgba(239,68,68,0.1)', padding: '6px 10px', borderRadius: 4, border: '1px solid rgba(239,68,68,0.2)' }}>
                Detail: {useAuth().authError}
              </div>
            )}
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: 10, borderRadius: 6, fontSize: 11, fontFamily: 'monospace', color: 'var(--cream)' }}>
              <strong>Logged-in Email:</strong> {useAuth().user?.email}<br/>
              <strong>User ID (UUID):</strong> {useAuth().user?.id}
            </div>
            <div style={{ fontSize: 11, color: 'var(--cream-dim)' }}>
              Copy the User ID above and run this in your Supabase SQL editor:
              <pre style={{ margin: '6px 0 0', padding: 8, background: '#000', borderRadius: 4, whiteSpace: 'pre-wrap', color: 'var(--gold)', fontSize: 10, fontFamily: 'monospace' }}>
                {`INSERT INTO public.staff_roles (user_id, role, full_name, is_active)
VALUES ('${useAuth().user?.id || 'your-user-id'}', 'ADMIN', 'Kiran Kumar', true)
ON CONFLICT (user_id) DO UPDATE SET role = 'ADMIN', is_active = true;`}
              </pre>
            </div>
            <button
              className="adm-btn adm-btn-secondary"
              style={{ padding: '6px 12px', fontSize: 11, alignSelf: 'flex-start', marginTop: 4 }}
              onClick={useAuth().logout}
            >
              🚪 Sign Out &amp; Try Again
            </button>
          </div>
        )}
        {error && <div className="error-banner">⚠️ {error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="login-field">
            <label>Email address</label>
            <input
              id="login-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="staff-input"
              placeholder="you@example.com"
              autoComplete="username"
            />
          </div>
          <div className="login-field">
            <label>Password</label>
            <input
              id="login-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="staff-input"
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>
          <button
            id="login-submit"
            className="btn btn-gold btn-full"
            type="submit"
            disabled={submitting}
            style={{ padding: '12px', fontSize: '15px', marginTop: 4 }}
          >
            {submitting ? 'Signing in…' : '→ Sign in with Credentials'}
          </button>
        </form>

        <div style={{ margin: '16px 0 0', display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
          <div style={{ fontSize: 12, color: 'var(--cream-muted)' }}>— OR —</div>
          <button
            type="button"
            className="adm-btn adm-btn-secondary"
            style={{
              width: '100%',
              padding: '11px',
              fontSize: '14px',
              fontWeight: 700,
              color: 'var(--gold)',
              borderColor: 'var(--gold-soft)',
              background: 'rgba(216,161,58,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8
            }}
            onClick={loginAsDemoAdmin}
          >
            ⚡ Quick Sign In as Admin
          </button>
        </div>

        <div className="login-divider" style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--line)' }}>
          <span style={{ color: 'var(--cream-muted)', fontSize: 12 }}>
            Customer menu → <a href="/menu" style={{ color: 'var(--gold)', textDecoration: 'none' }}>Open menu</a>
          </span>
        </div>
      </div>
    </div>
  );
}
