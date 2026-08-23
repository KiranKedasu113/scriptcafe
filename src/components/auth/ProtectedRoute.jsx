import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * Gate for any route that requires *some* logged-in staff member,
 * regardless of role. RoleBasedRoute builds on this for per-role gating.
 */
export function ProtectedRoute({ children }) {
  const { status, logout } = useAuth();
  const location = useLocation();

  if (status === 'loading') {
    return <div className="empty-state">Checking session…</div>;
  }

  if (status === 'signed-out') {
    return <Navigate to="/staff/login" replace state={{ from: location.pathname }} />;
  }

  if (status === 'unauthorized') {
    return (
      <div className="empty-state">
        <h2>Not authorized</h2>
        <p>Your account isn't set up as staff. Ask an admin to grant you a role.</p>
        <button
          className="adm-btn adm-btn-secondary"
          style={{ marginTop: 16, padding: '8px 16px' }}
          onClick={logout}
        >
          Sign Out &amp; Retry
        </button>
      </div>
    );
  }

  return children;
}
