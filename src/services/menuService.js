import { supabase } from '../lib/supabase';

/**
 * Fetch active categories with their items, ordered for display.
 * Unavailable items are included (so the UI can show "Out of stock")
 * rather than filtered out — the RPC is the real gatekeeper anyway.
 */
export async function fetchMenu() {
  const { data: categories, error: catError } = await supabase
    .from('menu_categories')
    .select('id, name, display_order')
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  if (catError) throw catError;

  const { data: items, error: itemError } = await supabase
    .from('menu_items')
    .select('id, category_id, name, description, unit_label, price, image_url, code, is_veg, is_available, display_order')
    .order('display_order', { ascending: true });

  if (itemError) throw itemError;

  return categories.map((cat) => ({
    ...cat,
    items: items
      .filter((item) => item.category_id === cat.id)
      .map((item) => ({ ...item, category_name: cat.name, categoryName: cat.name })),
  }));
}
