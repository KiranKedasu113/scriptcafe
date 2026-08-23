import { useCallback, useMemo, useState } from 'react';
import { ORDER_TYPE } from '../../utils/constants';

/**
 * Deliberately NOT the customer CartContext: that one persists to
 * localStorage under a single shared key for the QR ordering flow.
 * Reusing it here would risk a cashier's in-progress walk-in order
 * bleeding into (or being overwritten by) whatever a customer has on
 * this same device/browser. POS state lives only in memory and clears
 * itself after each order is placed.
 */
export function usePosCart() {
  const [items, setItems] = useState([]);
  const [orderType, setOrderType] = useState(ORDER_TYPE.TAKEAWAY);
  const [tableId, setTableId] = useState(null);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  const addItem = useCallback((menuItem) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.menuItemId === menuItem.id);
      if (existing) {
        return prev.map((i) => (i.menuItemId === menuItem.id ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [...prev, {
        menuItemId: menuItem.id,
        name: menuItem.name,
        price: Number(menuItem.price),
        categoryName: menuItem.categoryName || menuItem.category_name || '',
        quantity: 1,
        notes: ''
      }];
    });
  }, []);

  const setQuantity = useCallback((menuItemId, quantity) => {
    setItems((prev) => {
      if (quantity <= 0) return prev.filter((i) => i.menuItemId !== menuItemId);
      return prev.map((i) => (i.menuItemId === menuItemId ? { ...i, quantity } : i));
    });
  }, []);

  const removeItem = useCallback((menuItemId) => {
    setItems((prev) => prev.filter((i) => i.menuItemId !== menuItemId));
  }, []);

  const clear = useCallback(() => {
    setItems([]);
    setOrderType(ORDER_TYPE.TAKEAWAY);
    setTableId(null);
    setCustomerName('');
    setCustomerPhone('');
  }, []);

  const subtotal = useMemo(() => items.reduce((sum, i) => sum + i.price * i.quantity, 0), [items]);

  return {
    items,
    addItem,
    setQuantity,
    removeItem,
    clear,
    orderType,
    setOrderType,
    tableId,
    setTableId,
    customerName,
    setCustomerName,
    customerPhone,
    setCustomerPhone,
    subtotal,
  };
}
