import { useEffect, useState } from 'react';
import { ORDER_TYPE } from '../../utils/constants';
import { formatCurrency } from '../../utils/formatCurrency';

// Token counter persists across orders within the session
let _tokenCounter = 101;
function nextToken() { return _tokenCounter++; }

export function POSCartPanel({ cart, tables, onPlaceOrder, isSubmitting, error, gst, setGst }) {
  const [tokenNum] = useState(() => nextToken());
  const [customName, setCustomName] = useState('');
  const [showCustom, setShowCustom] = useState(false);

  // Automatically reset inputs when cart becomes empty (e.g. after order placement)
  useEffect(() => {
    if (cart.items.length === 0) {
      setCustomName('');
      setShowCustom(false);
    }
  }, [cart.items.length]);

  const subtotal = cart.subtotal;
  const gstAmount = gst ? Math.round(subtotal * 0.05 * 100) / 100 : 0;
  const grand = subtotal + gstAmount;

  const canPlace = cart.items.length > 0 && !isSubmitting &&
    (cart.orderType === ORDER_TYPE.TAKEAWAY || cart.tableId);

  function handleTableChange(val) {
    if (val === '') {
      cart.setOrderType(ORDER_TYPE.TAKEAWAY);
      cart.setTableId(null);
      setShowCustom(false);
    } else if (val === '__custom__') {
      cart.setOrderType(ORDER_TYPE.TAKEAWAY);
      cart.setTableId(null);
      setShowCustom(true);
    } else {
      cart.setOrderType(ORDER_TYPE.DINE_IN);
      cart.setTableId(val);
      setShowCustom(false);
    }
  }

  return (
    <div className="cart-panel">
      <h3>Current Order</h3>

      {/* Token + Table selector */}
      <div className="cart-meta">
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
          <div className="token-badge">TOKEN #<span>{tokenNum}</span></div>
          <select
            id="pos-table-select"
            className="pos-select"
            value={
              cart.orderType === ORDER_TYPE.TAKEAWAY && !showCustom
                ? ''
                : showCustom ? '__custom__'
                : cart.tableId || ''
            }
            onChange={(e) => handleTableChange(e.target.value)}
          >
            <option value="">🏃 Walk-in / Takeaway</option>
            {tables.filter(t => t.is_active).map(t => (
              <option key={t.id} value={t.id}>📍 Table {t.table_number}</option>
            ))}
            <option value="__custom__">✏️ Custom Name / Phone…</option>
          </select>
        </div>
        {showCustom && (
          <input
            id="pos-custom-name"
            className="pos-name-input"
            placeholder="Customer Name / Phone (Optional)"
            value={customName}
            onChange={(e) => { setCustomName(e.target.value); cart.setCustomerName(e.target.value); }}
          />
        )}
      </div>

      {/* Cart items */}
      <div className="cart-items">
        {cart.items.length === 0 ? (
          <div className="cart-empty">No items added yet — tap dishes on the left to add them.</div>
        ) : (
          cart.items.map((item) => (
            <div key={item.menuItemId} className="cart-line">
              <span className="l-name">{item.name}</span>
              <div className="qty-ctrl">
                <button onClick={() => cart.setQuantity(item.menuItemId, item.quantity - 1)}>−</button>
                <span>{item.quantity}</span>
                <button onClick={() => cart.setQuantity(item.menuItemId, item.quantity + 1)}>+</button>
              </div>
              <span className="l-price">{formatCurrency(item.price * item.quantity)}</span>
              <span className="rm" onClick={() => cart.removeItem(item.menuItemId)}>✕</span>
            </div>
          ))
        )}
      </div>

      {/* GST toggle */}
      <div className="gst-toggle">
        <input
          type="checkbox"
          id="gst-toggle-chk"
          checked={gst}
          onChange={(e) => setGst(e.target.checked)}
        />
        <label htmlFor="gst-toggle-chk"> Add 5% GST</label>
      </div>

      {/* Totals */}
      <div className="cart-totals">
        <div className="cart-total-row">
          <span>Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        {gst && (
          <div className="cart-total-row">
            <span>GST (5%)</span>
            <span>{formatCurrency(gstAmount)}</span>
          </div>
        )}
        <div className="cart-total-row grand">
          <span>Total</span>
          <span className="grand-amt">{formatCurrency(grand)}</span>
        </div>
      </div>

      {error && <div className="error-banner" style={{ marginTop: 8 }}>{error}</div>}

      {/* Place order / print button */}
      <button
        id="pos-place-order-btn"
        className="pos-print-btn"
        disabled={!canPlace}
        onClick={onPlaceOrder}
      >
        {isSubmitting ? '⏳ Placing Order…' : '🖨️ Print Bill & Kitchen KOT'}
      </button>
      <button
        id="pos-clear-btn"
        className="pos-clear-btn"
        onClick={cart.clear}
        disabled={cart.items.length === 0}
      >
        Clear Order
      </button>
    </div>
  );
}
