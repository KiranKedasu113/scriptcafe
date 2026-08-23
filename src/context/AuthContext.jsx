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
      setStaffRole(null);
      setStatus('signed-out');
      return;
    }
    try {
      const role = await fetchMyStaffRole();
      setStaffRole(role);
      if (role) {
        setStatus('signed-in');
      } else {
        setStatus('unauthorized');
        setAuthError('No active staff role found in public.staff_roles table for this account.');
      }
    } catch (err) {
      console.error("resolveRole failed:", err);
      setStaffRole(null);
      setStatus('unauthorized');
      setAuthError(err.message || 'Database error occurred while fetching staff role.');
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
    // onAuthStateChange fires and resolves the role; nothing else to do here.
  }, []);

  const logout = useCallback(async () => {
    await authSignOut();
  }, []);

  const value = {
    session,
    user: session?.user ?? null,
    role: staffRole?.role ?? null,
    fullName: staffRole?.fullName ?? null,
    status,
    authError,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
