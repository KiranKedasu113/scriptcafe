import { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export function LoginPage() {
  const { status, role, login } = useAuth();
  const location = useLocation();

  const [loginMode, setLoginMode] = useState('ADMIN'); // 'ADMIN' | 'CASHIER'
  const [email, setEmail] = useState('admin@ishacafe.com');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const defaultRoute = role === 'ADMIN' ? '/admin' : role === 'KITCHEN' ? '/kitchen' : '/cashier';
  const targetRoute = (role === 'ADMIN' && (!location.state?.from || location.state?.from === '/cashier'))
    ? '/admin'
    : (location.state?.from || defaultRoute);

  if (status === 'signed-in') return <Navigate to={targetRoute} replace />;

  function handleSwitchMode(mode) {
    setLoginMode(mode);
    setError(null);
    if (mode === 'ADMIN') {
      setEmail('admin@ishacafe.com');
    } else {
      setEmail('cashier@ishacafe.com');
    }
  }

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
          <p>Select portal mode to sign in</p>
        </div>

        {/* Portal Mode Selector Buttons */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20, padding: 4, background: 'rgba(0,0,0,0.3)', borderRadius: 10, border: '1px solid var(--line)' }}>
          <button
            type="button"
            onClick={() => handleSwitchMode('ADMIN')}
            style={{
              flex: 1,
              padding: '10px 8px',
              fontSize: '13px',
              fontWeight: 800,
              fontFamily: 'Poppins',
              borderRadius: 8,
              border: loginMode === 'ADMIN' ? '1.5px solid var(--gold)' : '1px solid transparent',
              background: loginMode === 'ADMIN' ? 'var(--gold)' : 'transparent',
              color: loginMode === 'ADMIN' ? '#1a1205' : 'var(--cream-dim)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6
            }}
          >
            👑 Admin Login
          </button>
          <button
            type="button"
            onClick={() => handleSwitchMode('CASHIER')}
            style={{
              flex: 1,
              padding: '10px 8px',
              fontSize: '13px',
              fontWeight: 800,
              fontFamily: 'Poppins',
              borderRadius: 8,
              border: loginMode === 'CASHIER' ? '1.5px solid var(--gold)' : '1px solid transparent',
              background: loginMode === 'CASHIER' ? 'var(--gold)' : 'transparent',
              color: loginMode === 'CASHIER' ? '#1a1205' : 'var(--cream-dim)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6
            }}
          >
            🧾 Cashier Login
          </button>
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
            <label>{loginMode === 'ADMIN' ? 'Admin Email Address' : 'Cashier Email Address'}</label>
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
            {submitting ? 'Signing in…' : loginMode === 'ADMIN' ? '→ Sign in to Admin Portal' : '→ Sign in to Cashier Station'}
          </button>
        </form>

        <div className="login-divider" style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--line)' }}>
          <span style={{ color: 'var(--cream-muted)', fontSize: 12 }}>
            Customer menu → <a href="/menu" style={{ color: 'var(--gold)', textDecoration: 'none' }}>Open menu</a>
          </span>
        </div>
      </div>
    </div>
  );
}
