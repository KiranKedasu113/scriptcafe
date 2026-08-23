import { supabase } from '../lib/supabase';

// ---- Menu management -------------------------------------------------
// Direct table writes here are safe specifically because migration 007
// grants INSERT/UPDATE/DELETE on menu_items/menu_categories only to
// authenticated users whose current_staff_role() = 'ADMIN'. A
// cashier/kitchen session gets an RLS error, not just a hidden button.

export async function fetchAllMenuItems() {
  const { data, error } = await supabase
    .from('menu_items')
    .select('id, category_id, name, description, unit_label, price, is_veg, is_available, display_order, code, image_url, menu_categories(name)')
    .order('display_order', { ascending: true });
  if (error) throw new Error(error.message || 'Failed to load menu items');
  return data;
}

export async function fetchCategories() {
  const { data, error } = await supabase
    .from('menu_categories')
    .select('id, name, display_order, is_active')
    .order('display_order', { ascending: true });
  if (error) throw new Error(error.message || 'Failed to load categories');
  return data;
}

export async function updateMenuItem(id, patch) {
  const { error } = await supabase.from('menu_items').update(patch).eq('id', id);
  if (error) throw new Error(error.message || 'Failed to update item');
}

export async function setItemAvailability(id, isAvailable) {
  return updateMenuItem(id, { is_available: isAvailable });
}

export async function createMenuItem(item) {
  const { data, error } = await supabase.from('menu_items').insert(item).select().single();
  if (error) throw new Error(error.message || 'Failed to create item');
  return data;
}

export async function createCategory(category) {
  const { data, error } = await supabase.from('menu_categories').insert(category).select().single();
  if (error) throw new Error(error.message || 'Failed to create category');
  return data;
}

// ---- Table management --------------------------------------------------

export async function fetchTables() {
  const { data, error } = await supabase
    .from('cafe_tables')
    .select('id, table_number, qr_token, is_active, created_at')
    .order('table_number', { ascending: true });
  if (error) throw new Error(error.message || 'Failed to load tables');
  return data;
}

export async function addTable(tableNumber) {
  const { data, error } = await supabase
    .from('cafe_tables')
    .insert({ table_number: tableNumber })
    .select()
    .single();
  if (error) throw new Error(error.message || 'Failed to add table');
  return data;
}

export async function setTableActive(id, isActive) {
  const { error } = await supabase.from('cafe_tables').update({ is_active: isActive }).eq('id', id);
  if (error) throw new Error(error.message || 'Failed to update table');
}

/** Regenerates a table's QR token — old printed QR codes stop working immediately. */
export async function regenerateTableToken(id) {
  const { data, error } = await supabase
    .from('cafe_tables')
    .update({ qr_token: cryptoRandomHex(16) })
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message || 'Failed to regenerate QR token');
  return data;
}

function cryptoRandomHex(bytes) {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return Array.from(arr, (b) => b.toString(16).padStart(2, '0')).join('');
}

// ---- Staff management ----------------------------------------------------
// Creating the auth user itself is out of scope here (Supabase Dashboard
// or an invite Edge Function with the service-role key) — these only
// grant/revoke a role for an auth user that already exists. See
// migration 007's admin_assign_staff_role() for the enforced reason why.

export async function fetchStaffRoles() {
  const { data, error } = await supabase
    .from('staff_roles')
    .select('user_id, role, full_name, is_active, created_at')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message || 'Failed to load staff');
  return data;
}

export async function assignStaffRole(email, role, fullName) {
  const { data, error } = await supabase.rpc('admin_assign_staff_role', {
    p_email: email,
    p_role: role,
    p_full_name: fullName || null,
  });
  if (error) throw new Error(error.message || 'Failed to assign role');
  return data;
}

export async function deactivateStaff(userId) {
  const { data, error } = await supabase.rpc('admin_deactivate_staff', { p_user_id: userId });
  if (error) throw new Error(error.message || 'Failed to deactivate staff');
  return data;
}

// ---- Reporting -----------------------------------------------------------

export async function getOrderReport(startDate, endDate) {
  const { data, error } = await supabase.rpc('get_order_report', {
    p_start: startDate,
    p_end: endDate,
  });
  if (error) throw new Error(error.message || 'Failed to load report');
  return data;
}
