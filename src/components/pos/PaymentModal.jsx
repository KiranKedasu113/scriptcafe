import { useState } from 'react';
import { formatCurrency } from '../../utils/formatCurrency';
import { PAYMENT_METHOD } from '../../utils/constants';
import { recordPayment } from '../../services/paymentService';

const METHOD_INFO = {
  CASH: { icon: '💵', label: 'Cash' },
  UPI: { icon: '📱', label: 'UPI' },
  CARD: { icon: '💳', label: 'Card' },
  ONLINE: { icon: '🌐', label: 'Online' },
};

export function PaymentModal({ order, onClose, onPaid }) {
  const [method, setMethod] = useState(PAYMENT_METHOD.CASH);
  const [reference, setReference] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  async function handleConfirm() {
    setSubmitting(true);
    setError(null);
    try {
      await recordPayment({
        orderId: order.id,
        method,
        amount: order.total_amount,
        transactionReference: reference || null,
      });
      onPaid(method);
    } catch (err) {
      setError(err.message || 'Failed to record payment');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <h2>💳 Collect Payment</h2>
        <p className="modal-meta">
          Order {order.order_number} · Token #{order.token_number}
          {order.order_type === 'DINE_IN' && order.cafe_tables?.table_number
            ? ` · Table ${order.cafe_tables.table_number}`
            : ' · Takeaway'}
        </p>

        <div className="modal-amount">{formatCurrency(order.total_amount)}</div>

        <p style={{ fontSize: 13, color: 'var(--cream-muted)', margin: '0 0 10px' }}>Payment method</p>
        <div className="payment-method-grid">
          {Object.values(PAYMENT_METHOD).map((m) => {
            const info = METHOD_INFO[m] || { icon: '💰', label: m };
            return (
              <button
                key={m}
                className={`payment-method-btn${method === m ? ' selected' : ''}`}
                onClick={() => setMethod(m)}
              >
                <span className="payment-method-icon">{info.icon}</span>
                {info.label}
              </button>
            );
          })}
        </div>

        {method !== PAYMENT_METHOD.CASH && (
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 12, color: 'var(--cream-muted)', display: 'block', marginBottom: 4 }}>
              Transaction reference (optional)
            </label>
            <input
              className="staff-input"
              placeholder="UPI ID / transaction ID…"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              style={{ marginTop: 0 }}
            />
          </div>
        )}

        {error && <div className="error-banner">{error}</div>}

        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          <button className="btn btn-outline btn-full" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button className="btn btn-gold btn-full" onClick={handleConfirm} disabled={submitting}>
            {submitting ? '⏳ Recording…' : '✓ Confirm Payment'}
          </button>
        </div>
      </div>
    </div>
  );
}
