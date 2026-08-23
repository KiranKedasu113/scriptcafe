import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { formatCurrency } from '../../utils/formatCurrency';

export function CartBar() {
  const { items, getSubtotal } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) return null;
  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div className="cart-bar">
      <div>
        <div className="count">{count} item{count !== 1 ? 's' : ''} added</div>
        <div className="total">{formatCurrency(getSubtotal())}</div>
      </div>
      <button className="btn btn-gold" onClick={() => navigate('/cart')}>
        View Cart
      </button>
    </div>
  );
}
