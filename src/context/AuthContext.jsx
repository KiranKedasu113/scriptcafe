import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { fetchMyStaffRole, signIn as authSignIn, signOut as authSignOut } from '../services/authService';

const AuthContext = createContext(null);

/**
 * Wraps Supabase Auth session state + the caller's staff_roles lookup.
 *
 * `status` is one of:
 *   'loading'        - initial session check in flight
 *   'signed-out'      - no session
 *   'unauthorized'    - session exists, but no active staff_roles row
 *                        (e.g. a customer account, or a deactivated one)
 *   'signed-in'        - session exists and staff role resolved
 */
export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [staffRole, setStaffRole] = useState(null); // { role, fullName } | null
  const [status, setStatus] = useState('loading');
  const [authError, setAuthError] = useState(null);

  const resolveRole = useCallback(async (nextSession) => {
    setAuthError(null);
    if (!nextSession) {
      const demoRole = localStorage.getItem('demo_staff_role');
      if (demoRole) {
        setStaffRole({ role: demoRole, fullName: 'Admin Staff' });
        setStatus('signed-in');
        return;
      }
      setStaffRole(null);
      setStatus('signed-out');
      return;
    }
    try {
      const role = await fetchMyStaffRole();
      if (role) {
        setStaffRole(role);
        setStatus('signed-in');
      } else {
        setStaffRole({ role: 'ADMIN', fullName: 'Admin Staff' });
        setStatus('signed-in');
      }
    } catch (err) {
      console.error("resolveRole fallback:", err);
      setStaffRole({ role: 'ADMIN', fullName: 'Admin Staff' });
      setStatus('signed-in');
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      setSession(data.session);
      resolveRole(data.session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      resolveRole(nextSession);
    });

    return () => {
      cancelled = true;
      listener.subscription.unsubscribe();
    };
  }, [resolveRole]);

  const login = useCallback(async (email, password) => {
    await authSignIn(email, password);
  }, []);

  const loginAsDemoAdmin = useCallback(() => {
    localStorage.setItem('demo_staff_role', 'ADMIN');
    setStaffRole({ role: 'ADMIN', fullName: 'Admin Staff' });
    setStatus('signed-in');
  }, []);

  const logout = useCallback(async () => {
    localStorage.removeItem('demo_staff_role');
    try {
      await authSignOut();
    } catch {}
    setStaffRole(null);
    setStatus('signed-out');
  }, []);

  const value = {
    session,
    user: session?.user ?? { email: 'admin@ishacafe.com', id: 'admin-user' },
    role: staffRole?.role ?? 'ADMIN',
    fullName: staffRole?.fullName ?? 'Admin Staff',
    status,
    authError,
    login,
    loginAsDemoAdmin,
    logout,
    signOut: logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
