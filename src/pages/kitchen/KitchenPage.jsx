import { useCallback, useEffect, useState } from 'react';
import { StaffNav } from '../../components/staff/StaffNav';
import { KitchenOrderCard } from '../../components/kitchen/KitchenOrderCard';
import { fetchActiveOrders, updateOrderStatus } from '../../services/staffOrderService';
import { useRealtimeOrders } from '../../hooks/useRealtimeOrders';
import { KITCHEN_STATUS_FLOW } from '../../utils/constants';

const COLUMN_LABEL = { NEW: 'New', ACCEPTED: 'Accepted', PREPARING: 'Preparing', READY: 'Ready' };

export function KitchenPage() {
  const [orders, setOrders] = useState([]);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState(null);

  const loadOrders = useCallback(() => {
    fetchActiveOrders()
      .then(setOrders)
      .catch((err) => setError(err.message || 'Failed to load orders'));
  }, []);

  useEffect(loadOrders, [loadOrders]);

  // Realtime board: any INSERT/UPDATE on orders (new order placed,
  // status changed elsewhere) refreshes the columns immediately.
  const { connected } = useRealtimeOrders({ onChange: loadOrders });

  async function handleAdvance(orderId, nextStatus) {
    setBusyId(orderId);
    setError(null);
    try {
      await updateOrderStatus(orderId, nextStatus);
      loadOrders();
    } catch (err) {
      setError(err.message || 'Failed to update order');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="app kitchen-app">
      <StaffNav />
      <div className="kitchen-header">
        <h1>Kitchen</h1>
        <span className={`conn-dot${connected ? ' live' : ''}`}>{connected ? 'Live' : 'Connecting…'}</span>
      </div>
      {error && <div className="error-banner">{error}</div>}

      <div className="kitchen-board">
        {KITCHEN_STATUS_FLOW.map((status) => (
          <div key={status} className="kitchen-column">
            <h2>{COLUMN_LABEL[status]}</h2>
            <div className="kitchen-column-body">
              {orders
                .filter((o) => o.order_status === status)
                .map((order) => (
                  <KitchenOrderCard
                    key={order.id}
                    order={order}
                    busy={busyId === order.id}
                    onAdvance={handleAdvance}
                  />
                ))}
              {orders.filter((o) => o.order_status === status).length === 0 && (
                <div className="empty-state" style={{ padding: '20px 0' }}>
                  —
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
