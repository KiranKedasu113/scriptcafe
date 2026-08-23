import { useEffect, useState } from 'react';
import { fetchOrderItems } from '../../services/staffOrderService';

const NEXT_ACTION = {
  NEW: { label: 'Accept', next: 'ACCEPTED' },
  ACCEPTED: { label: 'Start preparing', next: 'PREPARING' },
  PREPARING: { label: 'Mark ready', next: 'READY' },
};

export function KitchenOrderCard({ order, onAdvance, busy }) {
  const [items, setItems] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetchOrderItems(order.id)
      .then((data) => !cancelled && setItems(data))
      .catch(() => !cancelled && setItems([]));
    return () => {
      cancelled = true;
    };
  }, [order.id]);

  const action = NEXT_ACTION[order.order_status];
  const elapsedMin = Math.max(0, Math.round((Date.now() - new Date(order.created_at).getTime()) / 60000));

  return (
    <div className="kitchen-card">
      <div className="kitchen-card-header">
        <strong>#{order.token_number}</strong>
        <span className="meta">
          {order.order_type === 'DINE_IN' ? `Table ${order.cafe_tables?.table_number ?? '—'}` : 'Takeaway'}
        </span>
        <span className={`kitchen-timer${elapsedMin >= 15 ? ' late' : ''}`}>{elapsedMin}m</span>
      </div>

      <ul className="kitchen-item-list">
        {items === null && <li className="meta">Loading items…</li>}
        {items?.map((i) => (
          <li key={i.id}>
            <span className="qty">{i.quantity}x</span> {i.item_name}
            {i.notes && <em> — {i.notes}</em>}
          </li>
        ))}
      </ul>

      {action && (
        <button className="btn btn-gold btn-full" disabled={busy} onClick={() => onAdvance(order.id, action.next)}>
          {busy ? 'Updating…' : action.label}
        </button>
      )}
    </div>
  );
}
