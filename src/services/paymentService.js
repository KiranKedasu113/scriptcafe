import { supabase } from '../lib/supabase';

/**
 * Records a full payment against an order via record_payment() —
 * SECURITY DEFINER, restricted to CASHIER/ADMIN, single tender only
 * (no split/partial payments yet; see migration 007's comment on
 * that simplification).
 */
export async function recordPayment({ orderId, method, amount, transactionReference = null }) {
  const { data, error } = await supabase.rpc('record_payment', {
    p_order_id: orderId,
    p_method: method,
    p_amount: amount,
    p_transaction_reference: transactionReference,
  });
  if (error) throw new Error(error.message || 'Failed to record payment');
  return data;
}
