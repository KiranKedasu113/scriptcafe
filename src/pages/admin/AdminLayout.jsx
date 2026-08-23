import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const TABS = [
  { to: '/admin', label: '📋 Menu Manager & Add Items', end: true },
  { to: '/admin/tables', label: '▦ Table QR Generator' },
  { to: '/admin/history', label: '📊 Order History & Reports' },
  { to: '/admin/staff', label: '👥 Staff Management' },
];

export function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleSignOut() {
    try {
      await logout();
    } catch (e) {
      console.error('Logout failed:', e);
    }
    navigate('/staff/login', { replace: true });
  }

  return (
    <div className="adm-wrap">
      {/* Header */}
      <header className="adm-header">
        <div className="adm-brand" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <img
            src="https://www.ishacafe.store/logo.png"
            alt="ISHA CAFE"
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '1.5px solid var(--gold)',
              boxShadow: '0 0 10px rgba(216,161,58,0.4)',
            }}
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&auto=format&fit=crop&q=80';
            }}
          />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h1 style={{
              margin: 0,
              fontSize: '22px',
              fontFamily: 'Poppins',
              fontWeight: 'bold',
              color: 'var(--cream)',
              lineHeight: 1.1,
              letterSpacing: '0.5px'
            }}>
              ISHA <span style={{ color: 'var(--gold)' }}>CAFE</span> <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--gold-soft)', marginLeft: '6px' }}>— Admin Portal</span>
            </h1>
            <span style={{
              fontSize: '9.5px',
              color: 'var(--cream-dim)',
              letterSpacing: '1.2px',
              textTransform: 'uppercase',
              marginTop: '3px',
              fontWeight: 'bold'
            }}>
              GOOD FOOD, GOOD MOOD!
            </span>
          </div>
        </div>
        <div className="adm-header-actions">
          <span className="adm-user-pill">👤 {user?.email?.split('@')[0]}</span>
          <button className="adm-btn adm-btn-secondary" onClick={handleSignOut}>Sign Out</button>
        </div>
      </header>

      {/* Nav tabs */}
      <nav className="adm-tabs">
        {TABS.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            end={t.end}
            className={({ isActive }) => `adm-tab-btn${isActive ? ' active' : ''}`}
          >
            {t.label}
          </NavLink>
        ))}
      </nav>

      {/* Content */}
      <div className="adm-content">
        <Outlet />
      </div>
    </div>
  );
}
