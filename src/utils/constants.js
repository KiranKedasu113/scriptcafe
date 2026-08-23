// Mirrors the Postgres enums created in migration 004. Keep in sync.
export const ORDER_SOURCE = { QR: 'QR', POS: 'POS', ADMIN: 'ADMIN' };
export const ORDER_TYPE = { DINE_IN: 'DINE_IN', TAKEAWAY: 'TAKEAWAY' };
export const ORDER_STATUS = {
  NEW: 'NEW',
  ACCEPTED: 'ACCEPTED',
  PREPARING: 'PREPARING',
  READY: 'READY',
  SERVED: 'SERVED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
};
export const PAYMENT_STATUS = {
  UNPAID: 'UNPAID',
  PENDING: 'PENDING',
  PAID: 'PAID',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
};
export const PAYMENT_METHOD = { CASH: 'CASH', UPI: 'UPI', CARD: 'CARD', ONLINE: 'ONLINE' };

// Mirrors the CHECK constraint on staff_roles.role in migration 007.
export const STAFF_ROLE = { CASHIER: 'CASHIER', KITCHEN: 'KITCHEN', ADMIN: 'ADMIN' };

// order_status values a KITCHEN user is allowed to advance (see
// update_order_status() in 007 for the source of truth).
export const KITCHEN_STATUS_FLOW = ['NEW', 'ACCEPTED', 'PREPARING', 'READY'];

// No tax by default — Isha Cafe's menu prices in the old app were tax-inclusive.
// Set to e.g. 0.05 here if you want the RPC to add GST on top of the subtotal.
export const TAX_RATE = 0;

export const CART_STORAGE_KEY = 'isha_cafe_cart_v1';
