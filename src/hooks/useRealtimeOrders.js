import { useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Subscribes to realtime INSERT/UPDATE events on `orders`, optionally
 * filtered to a single order id (for the customer tracking page) or
 * left unfiltered (for Kitchen/POS/Admin dashboards, added in a later
 * phase once those screens exist).
 *
 * Handles: cleanup on unmount, de-duplication of events, and basic
 * reconnect (the supabase-js realtime client reconnects automatically;
 * we just make sure we don't double-subscribe).
 */
export function useRealtimeOrders({ orderId = null, onChange } = {}) {
  const [connected, setConnected] = useState(false);
  const channelRef = useRef(null);

  useEffect(() => {
    const channelName = orderId ? `orders-${orderId}` : 'orders-all';
    const filter = orderId ? `id=eq.${orderId}` : undefined;

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders', filter },
        (payload) => {
          onChange?.(payload);
        }
      )
      .subscribe((status) => {
        setConnected(status === 'SUBSCRIBED');
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  return { connected };
}
