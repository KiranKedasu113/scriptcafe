import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useCreateOrder } from '../../hooks/useCreateOrder';
import { formatCurrency } from '../../utils/formatCurrency';
import { ORDER_SOURCE, ORDER_TYPE } from '../../utils/constants';

export function CartPage() {
  const { items, table, orderType, customerDetails, setCustomerDetails, increaseQuantity, decreaseQuantity, removeItem, getSubtotal, clearCart } =
    useCart();
  const { submit, retry, isSubmitting, error } = useCreateOrder();
  const navigate = useNavigate();

  const subtotal = getSubtotal();

  async function handlePlaceOrder() {
    const result = await submit({
      source: ORDER_SOURCE.QR,
      orderType,
      tableQrToken: orderType === ORDER_TYPE.DINE_IN ? table?.qr_token : null,
      customerName: customerDetails.name || null,
      customerPhone: customerDetails.phone || null,
      items,
    });

    // Only clear the cart and navigate away once Supabase has confirmed
    // the order exists — never optimistically.
    if (result) {
      clearCart();
      navigate(`/order/${result.orderId}/success`, { state: result });
    }
  }

  if (items.length === 0) {
    return (
      <div className="app empty-state">
        <h2>Your cart is empty</h2>
        <button className="btn btn-gold" onClick={() => navigate('/menu')}>
          Browse Menu
        </button>
      </div>
    );
  }

  return (
    <div className="app">
      <h2>Your Order</h2>

      {orderType === ORDER_TYPE.DINE_IN && !table && (
        <div className="error-banner">Table information missing — please rescan the QR code.</div>
      )}

      {error && (
        <div className="error-banner">
          {error}{' '}
          <button className="btn btn-outline" onClick={retry} disabled={isSubmitting}>
            Retry
          </button>
        </div>
      )}

      {items.map((line) => (
        <div className="cart-line" key={`${line.menuItemId}-${line.notes}`}>
          <div className="meta">
            <h4>{line.name}</h4>
            {line.unitLabel && <span>{line.unitLabel}</span>}
          </div>
          <div className="qty-stepper">
            <button onClick={() => decreaseQuantity(line.menuItemId, line.notes)}>−</button>
            <span>{line.quantity}</span>
            <button onClick={() => increaseQuantity(line.menuItemId, line.notes)}>+</button>
          </div>
          <div className="price">{formatCurrency(line.price * line.quantity)}</div>
          <button className="btn btn-outline" onClick={() => removeItem(line.menuItemId, line.notes)}>
            Remove
          </button>
        </div>
      ))}

      {orderType === ORDER_TYPE.TAKEAWAY && (
        <div className="cart-summary" style={{ marginBottom: 12 }}>
          <input
            placeholder="Your name"
            value={customerDetails.name}
            onChange={(e) => setCustomerDetails((d) => ({ ...d, name: e.target.value }))}
            style={{ width: '100%', marginBottom: 8, padding: 8, borderRadius: 8, border: '1px solid var(--line)', background: 'var(--bg-panel)', color: 'var(--cream)' }}
          />
          <input
            placeholder="Phone number"
            value={customerDetails.phone}
            onChange={(e) => setCustomerDetails((d) => ({ ...d, phone: e.target.value }))}
            style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid var(--line)', background: 'var(--bg-panel)', color: 'var(--cream)' }}
          />
        </div>
      )}

      <div className="cart-summary">
        <div className="row total">
          <span>Total</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
      </div>

      <button
        className="btn btn-gold btn-full"
        style={{ marginTop: 16 }}
        disabled={isSubmitting || (orderType === ORDER_TYPE.DINE_IN && !table)}
        onClick={handlePlaceOrder}
      >
        {isSubmitting ? 'Placing order…' : `Place Order — ${formatCurrency(subtotal)}`}
      </button>
    </div>
  );
}
