import { supabase } from '../lib/supabase';

/**
 * Validate a scanned table QR token against the database.
 * Never trust a `?table=5`-style number from the URL — only this
 * opaque token, checked server-side, proves which table it is.
 * Returns null if the token is missing, unknown, or inactive.
 */
export async function validateTableToken(qrToken) {
  if (!qrToken) return null;

  const { data, error } = await supabase
    .from('cafe_tables')
    .select('id, table_number, is_active')
    .eq('qr_token', qrToken)
    .eq('is_active', true)
    .maybeSingle();

  if (error) throw error;
  return data; // null if not found
}

/**
 * Full table list including qr_token — used by POS (to place a
 * DINE_IN order for a walk-in without them scanning anything) and by
 * Admin table management. Anon read on cafe_tables is already
 * unrestricted at the row level (migration 006), so this is safe to
 * call from any staff screen once auth-gated by the route itself.
 */
export async function fetchAllTables() {
  const { data, error } = await supabase
    .from('cafe_tables')
    .select('id, table_number, qr_token, is_active, created_at')
    .order('table_number', { ascending: true });

  if (error) throw error;
  return data;
}
