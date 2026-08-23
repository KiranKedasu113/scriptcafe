import { formatCurrency } from '../../utils/formatCurrency';
import { printBill, printKOT } from '../../services/printService';
import { completeOrderWithFallback } from '../../services/staffOrderService';

const STATUS_COLOR = {
  NEW: 'NEW',
  ACCEPTED: 'ACCEPTED',
  PREPARING: 'PREPARING',
  READY: 'READY',
  SERVED: 'SERVED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
};

export function ActiveOrdersPanel({ active, completed, onPay, onRefresh }) {
  // Prints and marks active order COMPLETED
  async function handlePrintBoth(order) {
    const items = order.order_items || [];
    try {
      await printKOT(order, items);
      await printBill(order, items, null);
    } catch (err) {
      console.error("Failed to print KOT/Bill:", err);
    }

    try {
      await completeOrderWithFallback(order.id, order.order_status);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error("Failed to update status to COMPLETED:", err);
      alert(`Print succeeded, but failed to complete order in database: ${err.message}`);
    }
  }

  // Re-prints completed order (no database status changes)
  async function handleRePrintBoth(order) {
    const items = order.order_items || [];
    try {
      await printKOT(order, items);
      await printBill(order, items, null);
    } catch (err) {
      console.error("Failed to re-print KOT/Bill:", err);
      alert(`Re-print failed: ${err.message}`);
    }
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: 24, marginTop: 14 }}>
      
      {/* COLUMN 1: LIVE ORDERS */}
      <div className="pos-orders-col">
        <div className="pos-orders-header" style={{ marginBottom: 16 }}>
          <h3 style={{ margin: 0, color: 'var(--gold)', fontFamily: 'Poppins' }}>🧾 Live Orders</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, color: 'var(--cream-muted)' }}>{active.length} active</span>
            <div className="live-dot" />
          </div>
        </div>

        <div className="pos-orders-list" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {active.length === 0 ? (
            <div className="empty-state" style={{ background: 'var(--bg-panel)', padding: 30, borderRadius: 12 }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
              No active orders
            </div>
          ) : (
            active.map((order) => (
              <div
                key={order.id}
                className="pos-order-card"
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1.2fr 2fr',
                  gap: 20,
                  padding: 18,
                  background: 'var(--bg-card)',
                  border: '1.5px solid var(--line)',
                  borderRadius: 12,
                }}
              >
                {/* Left side: Metadata & Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 12 }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <span className="pos-order-token" style={{ fontSize: 20 }}>#{order.token_number}</span>
                      <span className="pos-order-amount" style={{ fontSize: 16 }}>{formatCurrency(order.total_amount)}</span>
                    </div>
                    <div className="pos-order-type-tag" style={{ marginTop: 4, fontSize: 12 }}>
                      {order.order_type === 'DINE_IN'
                        ? `🍽️ Table ${order.cafe_tables?.table_number ?? '—'}`
                        : '🥡 Takeaway'}
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
                      <span className={`status-badge ${STATUS_COLOR[order.order_status] || ''}`} style={{ fontSize: 10 }}>
                        {order.order_status}
                      </span>
                      <span className={`status-badge ${order.payment_status === 'PAID' ? 'pay-badge' : 'unpay-badge'}`} style={{ fontSize: 10 }}>
                        {order.payment_status === 'PAID' ? '✓ Paid' : 'Unpaid'}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                    <button
                      className="adm-btn adm-btn-primary"
                      style={{ justifyContent: 'center', width: '100%', fontSize: 12, padding: '8px 12px' }}
                      onClick={() => handlePrintBoth(order)}
                    >
                      🖨️ Print Bill &amp; KOT
                    </button>
                    {order.payment_status !== 'PAID' && (
                      <button
                        className="adm-btn adm-btn-secondary"
                        style={{ justifyContent: 'center', width: '100%', fontSize: 12, padding: '8px 12px' }}
                        onClick={() => onPay(order)}
                      >
                        💳 Collect Payment
                      </button>
                    )}
                  </div>
                </div>

                {/* Right side: Items List */}
                <div style={{ borderLeft: '1px dashed var(--line)', paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ fontSize: 12, fontWeight: 'bold', color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Items List
                  </div>
                  <div style={{ overflowY: 'auto', maxHeight: 130, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {order.order_items?.map((item, idx) => (
                      <div
                        key={item.id || idx}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: 13,
                          color: 'var(--cream)',
                          borderBottom: '1px solid rgba(255,255,255,0.03)',
                          paddingBottom: 4,
                        }}
                      >
                        <div>
                          <span style={{ color: 'var(--gold)', fontWeight: 'bold', marginRight: 8 }}>{item.quantity}x</span>
                          <span>{item.item_name}</span>
                          {item.notes && (
                            <div style={{ fontSize: 11, color: 'var(--cream-dim)', fontStyle: 'italic', marginLeft: 26 }}>
                              ↳ {item.notes}
                            </div>
                          )}
                        </div>
                        <span style={{ fontFamily: 'Roboto Mono', color: 'var(--cream-dim)' }}>
                          ₹{Number(item.line_total).toFixed(0)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* COLUMN 2: PRINTED / COMPLETED ORDERS */}
      <div className="pos-orders-col" style={{ borderLeft: '1px solid var(--line)', paddingLeft: 24 }}>
        <div className="pos-orders-header" style={{ marginBottom: 16 }}>
          <h3 style={{ margin: 0, color: 'var(--green)', fontFamily: 'Poppins' }}>✅ Printed Orders</h3>
          <span style={{ fontSize: 12, color: 'var(--cream-muted)' }}>{completed.length} printed</span>
        </div>

        <div className="pos-orders-list" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {completed.length === 0 ? (
            <div className="empty-state" style={{ background: 'var(--bg-panel)', padding: 30, borderRadius: 12 }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🖨️</div>
              No printed orders yet
            </div>
          ) : (
            completed.map((order) => (
              <div
                key={order.id}
                className="pos-order-card"
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1.2fr 2fr',
                  gap: 20,
                  padding: 18,
                  background: 'var(--bg-panel)',
                  border: '1.5px dashed var(--line)',
                  borderRadius: 12,
                  opacity: 0.95,
                }}
              >
                {/* Left side: Metadata & Re-print */}
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 12 }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <span className="pos-order-token" style={{ fontSize: 20, color: 'var(--cream-dim)' }}>#{order.token_number}</span>
                      <span className="pos-order-amount" style={{ fontSize: 16, color: 'var(--cream-dim)' }}>{formatCurrency(order.total_amount)}</span>
                    </div>
                    <div className="pos-order-type-tag" style={{ marginTop: 4, fontSize: 12, color: 'var(--cream-muted)' }}>
                      {order.order_type === 'DINE_IN'
                        ? `🍽️ Table ${order.cafe_tables?.table_number ?? '—'}`
                        : '🥡 Takeaway'}
                    </div>
                    <div style={{ marginTop: 8 }}>
                      <span className="status-badge" style={{ background: 'rgba(111,154,60,0.15)', border: '1px solid rgba(111,154,60,0.3)', color: 'var(--green)', fontSize: 10 }}>
                        ✓ COMPLETED
                      </span>
                    </div>
                  </div>

                  <div>
                    <button
                      className="adm-btn adm-btn-secondary"
                      style={{ justifyContent: 'center', width: '100%', fontSize: 12, padding: '8px 12px', borderStyle: 'dashed' }}
                      onClick={() => handleRePrintBoth(order)}
                    >
                      🖨️ Re-Print Bill &amp; KOT
                    </button>
                  </div>
                </div>

                {/* Right side: Items List */}
                <div style={{ borderLeft: '1px dashed var(--line)', paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ fontSize: 12, fontWeight: 'bold', color: 'var(--cream-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Items List
                  </div>
                  <div style={{ overflowY: 'auto', maxHeight: 130, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {order.order_items?.map((item, idx) => (
                      <div
                        key={item.id || idx}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: 13,
                          color: 'var(--cream-dim)',
                          borderBottom: '1px solid rgba(255,255,255,0.02)',
                          paddingBottom: 4,
                        }}
                      >
                        <div>
                          <span style={{ color: 'var(--cream-muted)', fontWeight: 'bold', marginRight: 8 }}>{item.quantity}x</span>
                          <span>{item.item_name}</span>
                        </div>
                        <span style={{ fontFamily: 'Roboto Mono', color: 'var(--cream-muted)' }}>
                          ₹{Number(item.line_total).toFixed(0)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
