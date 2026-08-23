import { useLocation, useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getOrderStatus } from '../../services/orderService';
import { formatCurrency } from '../../utils/formatCurrency';

export function OrderSuccessPage() {
  const { orderId } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(location.state || null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // If the page was reached directly (e.g. refresh), re-fetch from
    // Supabase rather than relying only on router state.
    if (order) return;
    getOrderStatus(orderId)
      .then(setOrder)
      .catch((err) => setError(err.message || 'Could not load order'));
  }, [orderId, order]);

  if (error) return <div className="app error-banner">{error}</div>;
  if (!order) return <div className="app empty-state">Loading order…</div>;

  const token = order.tokenNumber ?? order.token_number;
  const total = order.totalAmount ?? order.total_amount;

  return (
    <div className="app">
      <div className="success-card">
        <h2>Order Confirmed</h2>
        <p>Token</p>
        <div className="token">#{token}</div>
        <p>Total: {formatCurrency(total)}</p>
        <p style={{ color: 'var(--cream-dim)', fontSize: 13 }}>
          Show this token at the counter, or track status below.
        </p>
        <Link to={`/order/${order.orderId ?? order.order_id}/track`} className="btn btn-gold" style={{ marginTop: 12, display: 'inline-block' }}>
          Track Order
        </Link>
      </div>
    </div>
  );
}
