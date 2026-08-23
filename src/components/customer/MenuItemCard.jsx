import { formatCurrency } from '../../utils/formatCurrency';
import { useCart } from '../../context/CartContext';

export function MenuItemCard({ item }) {
  const { items, addItem, increaseQuantity, decreaseQuantity } = useCart();
  const cartLine = items.find((i) => i.menuItemId === item.id && !i.notes);
  const qty = cartLine ? cartLine.quantity : 0;

  return (
    <div className={`menu-card${!item.is_available ? ' unavailable' : ''}`}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <h3>{item.name}</h3>
        <span className={`veg-dot${item.is_veg ? '' : ' nonveg'}`} title={item.is_veg ? 'Veg' : 'Non-veg'} />
      </div>
      {item.unit_label && <span className="unit">{item.unit_label}</span>}
      {!item.is_available && <span className="out-of-stock-badge">Out of stock</span>}
      <div className="price-row">
        <span className="price">{formatCurrency(item.price)}</span>
        {item.is_available ? (
          qty > 0 ? (
            <div className="qty-stepper">
              <button onClick={() => decreaseQuantity(item.id)} aria-label="Decrease quantity">−</button>
              <span>{qty}</span>
              <button onClick={() => increaseQuantity(item.id)} aria-label="Increase quantity">+</button>
            </div>
          ) : (
            <button className="btn btn-gold" onClick={() => addItem(item, 1)}>
              Add
            </button>
          )
        ) : null}
      </div>
    </div>
  );
}
