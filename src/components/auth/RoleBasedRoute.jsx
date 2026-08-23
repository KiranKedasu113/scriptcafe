import { useAuth } from '../../context/AuthContext';
import { ProtectedRoute } from './ProtectedRoute';

/**
 * Gate for routes restricted to specific staff roles, e.g.
 *   <RoleBasedRoute roles={[STAFF_ROLE.ADMIN]}><AdminDashboard /></RoleBasedRoute>
 *
 * This is a *UI-level* convenience only — it hides screens the user
 * shouldn't see and avoids confusing dead-end UIs. It is NOT the
 * security boundary: every mutation still goes through RLS policies
 * and SECURITY DEFINER RPCs (migration 007) that re-check the role
 * server-side, so a stale/tampered client can't bypass anything by
 * skipping this component.
 */
export function RoleBasedRoute({ roles, children }) {
  return (
    <ProtectedRoute>
      <RoleCheck roles={roles}>{children}</RoleCheck>
    </ProtectedRoute>
  );
}

function RoleCheck({ roles, children }) {
  const { role, fullName } = useAuth();

  if (!roles.includes(role)) {
    return (
      <div className="empty-state">
        <h2>Not authorized</h2>
        <p>
          {fullName ? `${fullName}, your` : 'Your'} role ({role}) doesn't have access to this
          page.
        </p>
      </div>
    );
  }

  return children;
}
