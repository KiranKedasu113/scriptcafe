import { createContext, useCallback, useContext, useMemo, useState, useEffect } from 'react';
import { CART_STORAGE_KEY, ORDER_TYPE } from '../utils/constants';

const CartContext = createContext(null);

function loadPersistedCart() {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    return raw ? JSON.parse(raw) : { items: [], orderType: ORDER_TYPE.DINE_IN };
  } catch {
    return { items: [], orderType: ORDER_TYPE.DINE_IN };
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => loadPersistedCart().items);
  const [orderType, setOrderType] = useState(() => loadPersistedCart().orderType);
  const [table, setTable] = useState(null); // { id, table_number, qr_token }
  const [customerDetails, setCustomerDetails] = useState({ name: '', phone: '' });

  // Cart contents are only a *temporary recovery convenience* — the
  // authoritative order always comes from Supabase after checkout.
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify({ items, orderType }));
  }, [items, orderType]);

  const addItem = useCallback((menuItem, quantity = 1, notes = '') => {
    setItems((prev) => {
      const existing = prev.find((i) => i.menuItemId === menuItem.id && i.notes === notes);
      if (existing) {
        return prev.map((i) =>
          i === existing ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      return [
        ...prev,
        {
          menuItemId: menuItem.id,
          name: menuItem.name,
          unitLabel: menuItem.unit_label,
          price: Number(menuItem.price),
          quantity,
          notes,
        },
      ];
    });
  }, []);

  const removeItem = useCallback((menuItemId, notes = '') => {
    setItems((prev) => prev.filter((i) => !(i.menuItemId === menuItemId && i.notes === notes)));
  }, []);

  const increaseQuantity = useCallback((menuItemId, notes = '') => {
    setItems((prev) =>
      prev.map((i) =>
        i.menuItemId === menuItemId && i.notes === notes ? { ...i, quantity: i.quantity + 1 } : i
      )
    );
  }, []);

  const decreaseQuantity = useCallback((menuItemId, notes = '') => {
    setItems((prev) =>
      prev
        .map((i) =>
          i.menuItemId === menuItemId && i.notes === notes ? { ...i, quantity: i.quantity - 1 } : i
        )
        .filter((i) => i.quantity > 0)
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const getSubtotal = useCallback(
    () => items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [items]
  );

  const value = useMemo(
    () => ({
      items,
      orderType,
      setOrderType,
      table,
      setTable,
      customerDetails,
      setCustomerDetails,
      addItem,
      removeItem,
      increaseQuantity,
      decreaseQuantity,
      clearCart,
      getSubtotal,
    }),
    [items, orderType, table, customerDetails, addItem, removeItem, increaseQuantity, decreaseQuantity, clearCart, getSubtotal]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
}
