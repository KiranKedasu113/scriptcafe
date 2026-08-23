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
                padding: '16px 20px',
                textAlign: 'center',
                fontSize: '11px',
                fontFamily: "'Plus Jakarta Sans', 'Outfit', sans-serif",
                color: 'rgba(230, 218, 196, 0.55)',
                background: 'linear-gradient(180deg, rgba(14, 10, 5, 0) 0%, rgba(14, 10, 5, 0.8) 100%)',
                borderTop: '1px solid rgba(216, 161, 58, 0.12)',
                letterSpacing: '1.2px',
                textTransform: 'uppercase',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginTop: 'auto',
              }}
            >
              <span style={{ fontWeight: 500 }}>Designed &amp; Developed by</span>
              <a
                href="https://arohi.dev"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontFamily: "'Outfit', 'Plus Jakarta Sans', sans-serif",
                  fontWeight: 800,
                  fontSize: '12px',
                  letterSpacing: '0.8px',
                  color: '#d8a13a',
                  background: 'rgba(216, 161, 58, 0.08)',
                  border: '1px solid rgba(216, 161, 58, 0.25)',
                  padding: '3px 12px',
                  borderRadius: '20px',
                  textDecoration: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 0 10px rgba(216, 161, 58, 0.15)',
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#120d06';
                  e.currentTarget.style.background = '#d8a13a';
                  e.currentTarget.style.borderColor = '#d8a13a';
                  e.currentTarget.style.boxShadow = '0 0 16px rgba(216, 161, 58, 0.5)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#d8a13a';
                  e.currentTarget.style.background = 'rgba(216, 161, 58, 0.08)';
                  e.currentTarget.style.borderColor = 'rgba(216, 161, 58, 0.25)';
                  e.currentTarget.style.boxShadow = '0 0 10px rgba(216, 161, 58, 0.15)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                arohi.dev <span style={{ fontSize: '11px' }}>↗</span>
              </a>
            </footer>
          </div>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}
