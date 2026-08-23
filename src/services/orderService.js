import { supabase } from '../lib/supabase';
import { TAX_RATE } from '../utils/constants';

/**
 * The single order-creation entry point. Both the customer QR flow
 * and the POS/cashier flow call this exact function — never a raw
 * `.from('orders').insert(...)`. All pricing, token generation, and
 * validation happens inside the create_cafe_order Postgres function
 * (see supabase/migrations/005_create_order_rpc.sql), so nothing the
 * browser sends for price/subtotal/total is ever trusted.
 *
 * @param {Object} params
 * @param {string} params.clientOrderId - crypto.randomUUID(), generated
 *   once per checkout attempt and reused on retry for idempotency.
 * @param {'QR'|'POS'|'ADMIN'} params.source
 * @param {'DINE_IN'|'TAKEAWAY'} params.orderType
 * @param {string|null} params.tableQrToken - required for DINE_IN
 * @param {string|null} params.customerName
 * @param {string|null} params.customerPhone
 * @param {Array<{menuItemId: string, quantity: number, notes?: string}>} params.items
 * @returns {Promise<{orderId: string, orderNumber: string, tokenNumber: number, orderStatus: string, totalAmount: number, duplicate: boolean}>}
 */
export async function createOrder({
  clientOrderId,
  source,
  orderType,
  tableQrToken = null,
  customerName = null,
  customerPhone = null,
  items,
}) {
  if (!clientOrderId) throw new Error('clientOrderId is required for idempotent order creation');
  if (!items || items.length === 0) throw new Error('Cannot place an order with no items');

  const rpcItems = items.map((i) => ({
    menu_item_id: i.menuItemId,
    quantity: i.quantity,
    notes: i.notes || '',
  }));

  const { data, error } = await supabase.rpc('create_cafe_order', {
    p_client_order_id: clientOrderId,
    p_source: source,
    p_order_type: orderType,
    p_table_qr_token: tableQrToken,
    p_customer_name: customerName,
    p_customer_phone: customerPhone,
    p_tax_rate: TAX_RATE,
    p_items: rpcItems,
  });

  if (error) {
    // Surface the RPC's error message (ITEM_UNAVAILABLE, INVALID_TABLE, etc.)
    // rather than a generic Postgres error string where possible.
    throw new Error(error.message || 'Failed to create order');
  }

  return {
    orderId: data.order_id,
    orderNumber: data.order_number,
    tokenNumber: data.token_number,
    orderStatus: data.order_status,
    totalAmount: Number(data.total_amount),
    duplicate: Boolean(data.duplicate),
  };
}

/**
 * Fetch an order's current status + line items for the success/
 * tracking page, via a security-definer RPC rather than a raw
 * table read (customers have no direct SELECT on `orders`).
 */
export async function getOrderStatus(orderId) {
  const { data, error } = await supabase.rpc('get_order_status', { p_order_id: orderId });
  if (error) throw new Error(error.message || 'Failed to fetch order status');
  return data;
}
