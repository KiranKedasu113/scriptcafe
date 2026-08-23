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
                padding: '12px 16px',
                textAlign: 'center',
                fontSize: '11.5px',
                fontWeight: '500',
                fontFamily: 'Poppins, sans-serif',
                color: 'var(--cream-dim)',
                background: 'rgba(10, 7, 3, 0.4)',
                borderTop: '1px solid rgba(216, 161, 58, 0.12)',
                letterSpacing: '0.4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                marginTop: 'auto',
              }}
            >
              designed &amp; developed by <span style={{ color: 'var(--gold)', fontWeight: 700 }}>arohi.dev</span>
            </footer>
          </div>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}
