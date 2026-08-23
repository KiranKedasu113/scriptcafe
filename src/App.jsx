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
          <div className="app-viewport-wrap" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ flex: 1 }}>
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
            </div>

            {/* Static Developer Credit Footer Bar */}
            <footer
              className="developer-credit-footer"
              style={{
                width: '100%',
                padding: '14px 16px',
                textAlign: 'center',
                fontSize: '12px',
                fontWeight: '500',
                fontFamily: "'Poppins', sans-serif",
                color: 'var(--cream-dim)',
                background: 'rgba(10, 7, 3, 0.4)',
                borderTop: '1px solid rgba(216, 161, 58, 0.15)',
                letterSpacing: '0.5px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px',
                marginTop: 'auto',
              }}
            >
              <span>designed &amp; developed by</span>
              <a
                href="https://arohi.dev"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: 'var(--gold)',
                  fontWeight: 800,
                  textDecoration: 'none',
                  letterSpacing: '0.6px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#ffffff';
                  e.currentTarget.style.textDecoration = 'underline';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--gold)';
                  e.currentTarget.style.textDecoration = 'none';
                }}
              >
                arohi.dev
              </a>
            </footer>
          </div>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}
