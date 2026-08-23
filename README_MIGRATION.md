# Isha Cafe — React Migration: Status & Roadmap

## What's done (Phase 1)

### Database (`supabase/migrations/`)
Run these **in order** in the Supabase SQL Editor (or `supabase db push`
if you use the CLI):

1. `001_cafe_tables.sql` — physical tables + secure per-table QR tokens
   (replaces the guessable `?table=5` URL param). Seeds 20 tables.
2. `002_menu.sql` — relational `menu_categories` / `menu_items` (replaces
   the old single-row `cafe_menu` JSONB blob).
3. `003_seed_menu.sql` — auto-generated from your existing `MENU[]`
   array in `index.html`. All 153 items, 16 categories, preserved exactly.
4. `004_orders_and_items.sql` — normalized `orders` / `order_items` /
   `payments` / `token_counter` (replaces the old JSONB-items, plain-int-token
   `orders` table).
5. `005_create_order_rpc.sql` — **the important one.** `create_cafe_order()`:
   atomic token generation, idempotent via `client_order_id`, prices pulled
   only from `menu_items` (never trusts a price from the browser), validates
   the table QR token server-side, rejects unavailable items.
6. `006_rls_policies.sql` — replaces every old `USING (true)` policy.
   Anonymous users can now only read active menu/tables; all order
   reads/writes go through security-definer RPCs, not raw table access.

**Before running these on your live project:** back up your existing
`orders` table data if you want to keep order history — migration 004
creates new tables rather than altering the old one, so nothing is
destroyed, but the app will start writing to the new tables immediately.

### Frontend (`src/`)
- Vite + React + React Router scaffold, existing color/type tokens
  copied into `src/styles/theme.css` so the look matches your current app.
- `lib/supabase.js` — client reads from `VITE_SUPABASE_URL` /
  `VITE_SUPABASE_ANON_KEY` env vars, not a hardcoded key like the old
  `config.js`.
- `services/orderService.js` — the **only** place that creates an order.
  Both future POS and the current customer flow will call
  `createOrder()`, which calls the `create_cafe_order` RPC. No component
  ever does `.from('orders').insert(...)` directly.
- `context/CartContext.jsx` — cart state, with `localStorage` used only
  for recovery convenience, never as the order database.
- `hooks/useCreateOrder.js` — idempotent submission: stable
  `client_order_id` per checkout attempt, `isSubmitting` guard against
  double-click, `retry()` reuses the same id.
- `hooks/useRealtimeOrders.js` — Supabase Realtime subscription with
  cleanup on unmount; used today by the tracking page, reusable as-is
  for Kitchen/POS/Admin later.
- Customer flow, fully wired: `MenuPage` (validates QR token → loads
  menu) → `CartPage` (checkout via `useCreateOrder`) → `OrderSuccessPage`
  → `OrderTrackingPage` (live status via Realtime).

**Verified:** `npm install && npm run build` completes cleanly (92
modules, no errors). Not yet tested against a live Supabase project —
you'll need to run the migrations, add your real project URL/anon key
to `.env` (copy from `.env.example`), and click through the flow.

## What's NOT done yet (Phase 2 / Phase 3)

These are real remaining work, not stubs — flagging honestly rather
than pretending they're finished:

- **POS / Cashier app** (`pages/pos/`) — browse menu, build an order,
  select DINE_IN/TAKEAWAY + table, take payment, print bill. Will call
  the same `orderService.createOrder()`.
- **Kitchen Dashboard** (`pages/kitchen/`) — realtime NEW/ACCEPTED/
  PREPARING/READY board with status-update buttons.
- **Admin Dashboard** (`pages/admin/`) — menu management, table
  management, order history.
- **Supabase Auth + role-based RLS** — right now migration 006 locks
  anonymous access down to menu/table reads only, which is correct for
  customers but means POS/Kitchen/Admin have **no way to read or update
  orders yet**. Phase 2 needs: Supabase Auth, a `staff` roles table,
  and RLS policies (or more security-definer RPCs) scoped to
  CASHIER/KITCHEN/ADMIN. Don't deploy POS/Kitchen/Admin screens publicly
  until this lands.
- **Payments UI** — the `payments` table and enum exist in the schema;
  no UI writes to it yet.
- **Print service** (`services/printService.js`) — KOT/bill printing,
  decoupled from order creation so a printer failure never loses an order.
- **"Add items to an existing table order"** — the brief's edge case #12.
  Needs a design decision (new order vs. append to session) before
  building; not implemented either way yet.

## What's done (Phase 2)

### Database (`supabase/migrations/007_staff_auth_and_roles.sql`)
Run this after 001–006. It adds:
- `staff_roles` (`user_id -> CASHIER|KITCHEN|ADMIN`) + `current_staff_role()`,
  a `SECURITY DEFINER` helper other policies/RPCs call to check the caller's
  role without RLS recursion.
- RLS `SELECT` policies scoping `orders`/`order_items` to any staff role, and
  `payments` to `CASHIER`/`ADMIN` only — kitchen never sees payment data.
- RLS `ALL` policies letting `ADMIN` manage `menu_items`, `menu_categories`,
  `cafe_tables` directly (cashier/kitchen sessions get a real RLS error, not
  just a hidden button).
- `update_order_status()` — the only way `order_status` changes. Validates
  both the role *and* that the transition is legal from the order's current
  status (kitchen can't skip to `COMPLETED`, cashier can't reopen a cancelled
  order, etc).
- `record_payment()` — `CASHIER`/`ADMIN` only, writes `payments` and flips
  `orders.payment_status`. Single full tender only for now — no split/partial
  payments (flagged, not silently missing).
- `admin_assign_staff_role()` / `admin_deactivate_staff()` — grant/revoke a
  role for an **existing** auth user. Creating the auth user itself is out of
  scope here: do that in Supabase Dashboard → Authentication → Add user (or a
  proper invite flow later), then assign the role from Admin → Staff. The
  anon/authenticated client is never trusted to create arbitrary `auth.users`
  rows.
- `get_order_report()` — basic revenue/status aggregation for Admin →
  Overview.

**Important:** `staff_roles` has no rows until you either insert one directly
in the SQL editor or use `admin_assign_staff_role()` — but that RPC itself
requires an existing `ADMIN`. So bootstrap your first admin manually:
```sql
insert into staff_roles (user_id, role, full_name)
values ('<auth-user-uuid-from-dashboard>', 'ADMIN', 'Your Name');
```

### Frontend (`src/`)
- `context/AuthContext.jsx` — wraps Supabase Auth session + `staff_roles`
  lookup; exposes `status` (`loading | signed-out | unauthorized | signed-in`),
  `role`, `login()`, `logout()`.
- `components/auth/ProtectedRoute.jsx` / `RoleBasedRoute.jsx` — gate `/pos`,
  `/kitchen`, `/admin`. These are a UI convenience only; the real boundary is
  the RLS policies and RPCs in 007, which re-check the role server-side
  regardless of what the client shows.
- `pages/auth/LoginPage.jsx` — email/password sign-in at `/staff/login`.
- `pages/pos/POSPage.jsx` — browse menu, build a walk-in/phone order, pick
  Dine-in (table select) or Takeaway, calls the **same**
  `orderService.createOrder()` the customer QR flow uses (`source: 'POS'`).
  Active-orders panel updates via the existing `useRealtimeOrders` hook, with
  Pay / KOT / Bill actions per order.
- `pages/kitchen/KitchenPage.jsx` — realtime NEW → ACCEPTED → PREPARING →
  READY board, one "next step" button per card, built on
  `useRealtimeOrders` + `update_order_status()`.
- `pages/admin/*` — Overview (today's report), Menu (price edits,
  availability toggle, add item/category), Tables (add table, activate/
  deactivate, regenerate QR token), Order history (date range + status
  filter), Staff (assign/deactivate roles).
- `services/printService.js` — `printKOT()` / `printBill()`, deliberately
  never imported by `orderService.js`. A printer failure can't lose an order;
  printing can always be retried later from POS's active-orders list.
  Current implementation prints via the browser's print dialog (works with
  any printer set as default or chosen in the prompt); swap the internals for
  a thermal-printer SDK later without touching callers.

**Verified:** `npm install && npm run build` completes cleanly. Not yet
tested against a live Supabase project with real staff accounts — run
migration 007, bootstrap an admin as above, then click through Login → POS →
Kitchen → Admin.

## What's NOT done yet (Phase 3 candidates)
- Split/partial payments (deposit + balance, multiple tenders per order).
- "Add items to an existing table order" (still an open design decision from
  Phase 1 — new order vs. append to session).
- Self-service staff sign-up / invite emails (accounts are currently
  Dashboard-provisioned only).
- Real thermal-printer integration (ESC/POS over WebUSB/Bluetooth, or a
  print-server endpoint) — `printService.js` is structured so this is a
  drop-in swap, but it isn't built.
- Table-transfer / merge-orders workflow for cashiers.

## Suggested next session
Auth + roles, POS, Kitchen, and Admin are all in place now. If continuing,
I'd tackle split payments and the "existing table order" design decision
next, since both touch `create_cafe_order`/`record_payment` and are worth
getting right before real estate depends on them.
