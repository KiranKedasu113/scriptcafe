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
        <div className="adm-brand">
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
          <div>
            <h1 className="adm-title">ISHA <span>CAFE</span> — Admin Portal</h1>
            <div className="adm-subtitle">Menu Manager · Orders · Table QR · Staff</div>
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
