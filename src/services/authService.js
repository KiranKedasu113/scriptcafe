import { supabase } from '../lib/supabase';

/**
 * Staff sign-in. Uses Supabase Auth email/password — staff accounts
 * themselves are provisioned via the Supabase Dashboard (or an invite
 * flow), never created from this client. See migration 007's comments
 * for why: the anon/authenticated client is never trusted to create
 * arbitrary auth.users rows.
 */
export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message || 'Sign-in failed');
  return data.session;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message || 'Sign-out failed');
}

export function getSession() {
  return supabase.auth.getSession().then(({ data }) => data.session);
}

/**
 * Fetch the caller's own staff_roles row. Returns null if the logged-in
 * user has no (active) staff role — e.g. a customer account, or a
 * deactivated staff account — which the UI treats as "not authorized".
 */
export async function fetchMyStaffRole() {
  const { data, error } = await supabase
    .from('staff_roles')
    .select('role, full_name, is_active')
    .limit(1);

  if (error) throw new Error(error.message || 'Failed to load staff role');
  if (!data || data.length === 0) return null;
  
  const row = data[0];
  if (!row.is_active) return null;
  return { role: row.role, fullName: row.full_name };
}
