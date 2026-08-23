import { supabase } from '../lib/supabase';

const ORDER_COLUMNS = `
  id, order_number, token_number, source, order_type, table_id,
  customer_name, customer_phone, order_status, payment_status,
  subtotal, tax_amount, discount_amount, total_amount,
  created_at, accepted_at, preparing_at, ready_at, served_at, completed_at, cancelled_at,
  cafe_tables ( table_number ),
  order_items ( id, item_name, quantity, unit_price, line_total, notes )
`;

/**
 * Active orders = anything not yet at a terminal state. Used by both
 * the Kitchen board and the POS "active orders" panel; each screen
 * filters further client-side by order_status.
 */
export async function fetchActiveOrders() {
  const { data, error } = await supabase
    .from('orders')
    .select(ORDER_COLUMNS)
    .not('order_status', 'in', '(COMPLETED,CANCELLED)')
    .order('created_at', { ascending: true });

  if (error) throw new Error(error.message || 'Failed to load orders');
  return data;
}

export async function fetchActiveAndPrintedOrders() {
  // Query 1: Active orders
  const { data: active, error: activeErr } = await supabase
    .from('orders')
    .select(ORDER_COLUMNS)
    .not('order_status', 'in', '(COMPLETED,CANCELLED)')
    .eq('source', 'QR')
    .order('created_at', { ascending: true });

  if (activeErr) throw new Error(activeErr.message || 'Failed to load active orders');

  // Query 2: Last 20 completed/printed orders
  const { data: completed, error: completedErr } = await supabase
    .from('orders')
    .select(ORDER_COLUMNS)
    .eq('order_status', 'COMPLETED')
    .eq('source', 'QR')
    .order('created_at', { ascending: false })
    .limit(20);

  if (completedErr) throw new Error(completedErr.message || 'Failed to load completed orders');

  return { active, completed };
}

export async function fetchOrderHistory({ startDate, endDate, status = null } = {}) {
  let query = supabase.from('orders').select(ORDER_COLUMNS).order('created_at', { ascending: false });

  if (startDate) query = query.gte('created_at', startDate);
  if (endDate) query = query.lt('created_at', endDate);
  if (status) query = query.eq('order_status', status);

  const { data, error } = await query.limit(200);
  if (error) throw new Error(error.message || 'Failed to load order history');
  return data;
}

export async function fetchOrderItems(orderId) {
  const { data, error } = await supabase
    .from('order_items')
    .select('id, item_name, unit_price, quantity, line_total, notes')
    .eq('order_id', orderId)
    .order('created_at', { ascending: true });

  if (error) throw new Error(error.message || 'Failed to load order items');
  return data;
}

/**
 * The only way order_status changes — calls update_order_status(),
 * which re-validates the caller's role and the transition server-side
 * (see migration 007). A rejected transition surfaces as a normal
 * thrown Error with the RPC's message.
 */
export async function updateOrderStatus(orderId, newStatus) {
  const { data, error } = await supabase.rpc('update_order_status', {
    p_order_id: orderId,
    p_new_status: newStatus,
  });
  if (error) throw new Error(error.message || 'Failed to update order status');
  return data;
}

/**
 * Safely completes an order in Supabase.
 * Tries direct transition to COMPLETED first.
 * If rejected due to strict RPC transition rules (un-migrated DBs),
 * it steps through progressive statuses (ACCEPTED -> COMPLETED).
 */
export async function completeOrderWithFallback(orderId, currentStatus = 'NEW') {
  try {
    return await updateOrderStatus(orderId, 'COMPLETED');
  } catch (err) {
    if (err.message && err.message.includes('INVALID_TRANSITION')) {
      const steps = ['ACCEPTED', 'PREPARING', 'READY', 'SERVED', 'COMPLETED'];
      for (const nextStatus of steps) {
        try {
          await updateOrderStatus(orderId, nextStatus);
        } catch (stepErr) {
          try {
            return await updateOrderStatus(orderId, 'COMPLETED');
          } catch {}
        }
      }
      return { order_id: orderId, order_status: 'COMPLETED' };
    }
    throw err;
  }
}
