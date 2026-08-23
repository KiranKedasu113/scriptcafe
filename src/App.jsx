import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { RoleBasedRoute } from './components/auth/RoleBasedRoute';
import { MenuPage } from './pages/customer/MenuPage';
import { CartPage } from './pages/customer/CartPage';
import { OrderSuccessPage } from './pages/customer/OrderSuccessPage';
import { OrderTrackingPage } from './pages/customer/OrderTrackingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { POSPage } from './pages/pos/POSPage';
import { KitchenPage } from './pages/kitchen/KitchenPage';

import { AdminLayout } from './pages/admin/AdminLayout';

import { MenuManagementPage } from './pages/admin/MenuManagementPage';
import { TableManagementPage } from './pages/admin/TableManagementPage';
import { OrderHistoryPage } from './pages/admin/OrderHistoryPage';
import { StaffManagementPage } from './pages/admin/StaffManagementPage';
import { STAFF_ROLE } from './utils/constants';

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/menu" replace />} />
            <Route path="/menu" element={<MenuPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/order/:orderId/success" element={<OrderSuccessPage />} />
            <Route path="/order/:orderId/track" element={<OrderTrackingPage />} />

            <Route path="/staff/login" element={<LoginPage />} />

            <Route
              path="/cashier"
              element={
                <RoleBasedRoute roles={[STAFF_ROLE.CASHIER, STAFF_ROLE.ADMIN]}>
                  <POSPage />
                </RoleBasedRoute>
              }
            />

            <Route path="/pos" element={<Navigate to="/cashier" replace />} />

            <Route
              path="/kitchen"
              element={
                <RoleBasedRoute roles={[STAFF_ROLE.KITCHEN, STAFF_ROLE.ADMIN]}>
                  <KitchenPage />
                </RoleBasedRoute>
              }
            />

            <Route
              path="/admin"
              element={
                <RoleBasedRoute roles={[STAFF_ROLE.ADMIN]}>
                  <AdminLayout />
                </RoleBasedRoute>
              }
            >
              <Route index element={<MenuManagementPage />} />
              <Route path="tables" element={<TableManagementPage />} />
              <Route path="history" element={<OrderHistoryPage />} />
              <Route path="staff" element={<StaffManagementPage />} />
            </Route>

            {/* Catch-all: unknown staff paths fall back to cashier */}
            <Route
              path="*"
              element={
                <ProtectedRoute>
                  <Navigate to="/cashier" replace />
                </ProtectedRoute>
              }
            />
          </Routes>

          {/* Developer credit badge at right corner bottom */}
          <div
            className="developer-credit-footer"
            style={{
              position: 'fixed',
              bottom: '10px',
              right: '16px',
              zIndex: 99999,
              fontSize: '11px',
              fontWeight: '600',
              fontFamily: 'Poppins, sans-serif',
              color: 'var(--cream-dim)',
              background: 'rgba(15, 10, 4, 0.85)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              padding: '5px 12px',
              borderRadius: '20px',
              border: '1px solid rgba(216, 161, 58, 0.3)',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.6)',
              pointerEvents: 'none',
              letterSpacing: '0.3px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            designed and developed by <span style={{ color: 'var(--gold)', fontWeight: 800 }}>arohi.dev</span>
          </div>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}
