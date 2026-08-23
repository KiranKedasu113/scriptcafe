import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { getOrderStatus } from '../../services/orderService';
import { useRealtimeOrders } from '../../hooks/useRealtimeOrders';
import { formatCurrency } from '../../utils/formatCurrency';

const STEPS = ['NEW', 'ACCEPTED', 'PREPARING', 'READY', 'SERVED', 'COMPLETED'];

export function OrderTrackingPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    getOrderStatus(orderId)
      .then(setOrder)
      .catch((err) => setError(err.message || 'Could not load order'));
  }, [orderId]);

  useEffect(load, [load]);

  // Re-fetch full status whenever this order changes on the server.
  // (We re-fetch via the RPC rather than trusting the realtime payload
  // directly, since RLS still applies to what the payload itself can
  // contain for anon subscribers.)
  useRealtimeOrders({ orderId, onChange: load });

  if (error) return <div className="app error-banner">{error}</div>;
  if (!order) return <div className="app empty-state">Loading order status…</div>;

  const currentIndex = STEPS.indexOf(order.order_status);

  return (
    <div className="app">
      <h2>Order #{order.token_number}</h2>
      <div className="cart-summary">
        {STEPS.map((step, i) => (
          <div
            key={step}
            className="row"
            style={{ color: i <= currentIndex ? 'var(--gold)' : 'var(--cream-dim)', fontWeight: i === currentIndex ? 800 : 400 }}
          >
            <span>{step.replace('_', ' ')}</span>
            {i <= currentIndex && <span>✓</span>}
          </div>
        ))}
      </div>
      <div className="cart-summary" style={{ marginTop: 12 }}>
        <div className="row total">
          <span>Total</span>
          <span>{formatCurrency(order.total_amount)}</span>
        </div>
        <div className="row">
          <span>Payment</span>
          <span>{order.payment_status}</span>
        </div>
      </div>
    </div>
  );
}
