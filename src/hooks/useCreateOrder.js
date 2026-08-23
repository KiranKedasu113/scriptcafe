import { useCallback, useRef, useState } from 'react';
import { createOrder } from '../services/orderService';

/**
 * Wraps orderService.createOrder with:
 *  - a stable clientOrderId generated once per checkout attempt and
 *    reused on retry (so double-click / refresh / network retry can
 *    never create two orders)
 *  - isSubmitting, to disable the Place Order button immediately
 *  - error state + a retry() that reuses the same clientOrderId
 *
 * The cart is intentionally NOT cleared here — the caller should only
 * clear it after a successful, confirmed response from Supabase.
 */
export function useCreateOrder() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const clientOrderIdRef = useRef(null);
  const lastArgsRef = useRef(null);

  const submit = useCallback(async (orderArgs) => {
    if (isSubmitting) return null; // guards against double-click races

    if (!clientOrderIdRef.current) {
      clientOrderIdRef.current = crypto.randomUUID();
    }
    lastArgsRef.current = orderArgs;

    setIsSubmitting(true);
    setError(null);
    try {
      const result = await createOrder({
        ...orderArgs,
        clientOrderId: clientOrderIdRef.current,
      });
      return result;
    } catch (err) {
      setError(err.message || 'Something went wrong placing your order.');
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting]);

  const retry = useCallback(() => {
    if (!lastArgsRef.current) return Promise.resolve(null);
    return submit(lastArgsRef.current);
  }, [submit]);

  const reset = useCallback(() => {
    clientOrderIdRef.current = null;
    lastArgsRef.current = null;
    setError(null);
  }, []);

  return {
    submit,
    retry,
    reset,
    isSubmitting,
    error,
    clientOrderId: clientOrderIdRef.current,
  };
}
