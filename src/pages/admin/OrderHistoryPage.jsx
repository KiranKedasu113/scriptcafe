import { useEffect, useState } from 'react';
import { fetchOrderHistory } from '../../services/staffOrderService';
import { formatCurrency } from '../../utils/formatCurrency';
import { ORDER_STATUS } from '../../utils/constants';

function daysAgoISO(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

const PAY_STATUS_STYLE = {
  PAID: { color: 'var(--green)', bg: 'var(--green-bg)' },
  UNPAID: { color: 'var(--red)', bg: 'var(--red-bg)' },
  PENDING: { color: 'var(--amber)', bg: 'var(--gold-glow)' },
  FAILED: { color: 'var(--red)', bg: 'var(--red-bg)' },
  REFUNDED: { color: 'var(--blue)', bg: 'var(--blue-bg)' },
};

export function OrderHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [rangeDays, setRangeDays] = useState(7);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchOrderHistory({ startDate: daysAgoISO(rangeDays), status: statusFilter || null })
      .then(setOrders)
      .catch((err) => setError(err.message || 'Failed to load history'))
      .finally(() => setLoading(false));
  }, [statusFilter, rangeDays]);

  const totalRevenue = orders
    .filter((o) => o.payment_status === 'PAID')
    .reduce((sum, o) => sum + Number(o.total_amount), 0);

  return (
    <div>
      <div className="page-header">
        <div className="page-header-text">
          <h2>Order History</h2>
          <p>{orders.length} orders · {formatCurrency(totalRevenue)} revenue</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <select
            className="staff-input"
            value={rangeDays}
            onChange={(e) => setRangeDays(Number(e.target.value))}
            style={{ marginTop: 0, width: 'auto' }}
          >
            <option value={1}>Last 24 hours</option>
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
          </select>
          <select
            className="staff-input"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ marginTop: 0, width: 'auto' }}
          >
            <option value="">All statuses</option>
            {Object.values(ORDER_STATUS).map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}
      {loading && <div className="empty-state">Loading orders…</div>}

      {!loading && (
        <div className="admin-data-table">
          <div className="admin-data-table-head admin-orders-cols">
            <span>Token / Order#</span>
            <span>Type / Table</span>
            <span>Status</span>
            <span>Payment</span>
            <span>Total</span>
          </div>
          {orders.map((o) => {
            const payStyle = PAY_STATUS_STYLE[o.payment_status] || {};
            return (
              <div key={o.id} className="admin-data-table-row admin-orders-cols">
                <span>
                  <span style={{ fontFamily: 'Roboto Mono', fontWeight: 700, color: 'var(--gold)', fontSize: 14 }}>
                    #{o.token_number}
                  </span>
                  <div style={{ fontSize: 11, color: 'var(--cream-muted)', marginTop: 2 }}>
                    {new Date(o.created_at).toLocaleString('en-IN', { hour12: true, hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}
                  </div>
                </span>
                <span>
                  <span style={{ fontSize: 12, fontWeight: 600 }}>
                    {o.order_type === 'DINE_IN'
                      ? `🍽️ Table ${o.cafe_tables?.table_number ?? '—'}`
                      : '🥡 Takeaway'}
                  </span>
                  {o.customer_name && (
                    <div style={{ fontSize: 11, color: 'var(--cream-muted)' }}>{o.customer_name}</div>
                  )}
                </span>
                <span>
                  <span className={`status-badge ${o.order_status}`}>{o.order_status}</span>
                </span>
                <span>
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 99,
                    background: payStyle.bg, color: payStyle.color,
                  }}>
                    {o.payment_status}
                  </span>
                </span>
                <span style={{ fontFamily: 'Roboto Mono', fontWeight: 700, color: 'var(--cream)' }}>
                  {formatCurrency(o.total_amount)}
                </span>
              </div>
            );
          })}
          {orders.length === 0 && (
            <div className="empty-state">No orders found in this period.</div>
          )}
        </div>
      )}
    </div>
  );
}
