import { useCallback, useEffect, useState } from 'react';
import { StaffNav } from '../../components/staff/StaffNav';
import { POSMenuPanel } from '../../components/pos/POSMenuPanel';
import { POSCartPanel } from '../../components/pos/POSCartPanel';
import { ActiveOrdersPanel } from '../../components/pos/ActiveOrdersPanel';
import { PaymentModal } from '../../components/pos/PaymentModal';
import { usePosCart } from './usePosCart';
import { useCreateOrder } from '../../hooks/useCreateOrder';
import { useRealtimeOrders } from '../../hooks/useRealtimeOrders';
import { fetchActiveAndPrintedOrders, updateOrderStatus, completeOrderWithFallback } from '../../services/staffOrderService';
import { fetchAllTables } from '../../services/tableService';
import { ORDER_SOURCE, ORDER_TYPE } from '../../utils/constants';
import {
  initQZTrayConnection,
  printKOT,
  printBill,
  getSavedBillPrinter,
  getSavedKotPrinter,
  setSavedBillPrinter,
  setSavedKotPrinter,
  printQZSilent
} from '../../services/printService';

const TABS = [
  { id: 'billing', label: '🧾 Billing' },
  { id: 'orders', label: '🔔 Table Orders' },
  { id: 'printers', label: '🖨️ Printer Settings' },
];

export function POSPage() {
  const cart = usePosCart();
  const { submit, isSubmitting, error, reset } = useCreateOrder();

  const [tables, setTables] = useState([]);
  const [orders, setOrders] = useState({ active: [], completed: [] });
  const [payingOrder, setPayingOrder] = useState(null);
  const [activeTab, setActiveTab] = useState('billing');
  const [gst, setGst] = useState(false);

  // Printer settings states
  const [qzConnected, setQzConnected] = useState(false);
  const [printers, setPrinters] = useState([]);
  const [billPrinter, setBillPrinterState] = useState(getSavedBillPrinter());
  const [kotPrinter, setKotPrinterState] = useState(getSavedKotPrinter());
  const [printerMsg, setPrinterMsg] = useState('');

  const loadOrders = useCallback(() => {
    fetchActiveAndPrintedOrders().then(setOrders).catch(() => {});
  }, []);

  // Initialize and connect QZ Tray
  const connectQZ = useCallback(async (interactive = false) => {
    const success = await initQZTrayConnection();
    setQzConnected(success);
    if (success) {
      try {
        const list = await window.qz.printers.find();
        setPrinters(list);
        if (interactive) setPrinterMsg('⚡ Connected to QZ Tray!');
      } catch (err) {
        console.error("Failed to fetch QZ printers:", err);
      }
    } else {
      if (interactive) {
        alert("QZ Tray Connection Failed!\n\n1. Ensure QZ Tray desktop app is running.\n2. Download from https://qz.io/download/");
      }
    }
  }, []);

  useEffect(() => {
    fetchAllTables().then(setTables).catch(() => {});
    loadOrders();
    connectQZ(false);
  }, [loadOrders, connectQZ]);

  useRealtimeOrders({ onChange: loadOrders });

  // Place order and automatically print both tickets
  const handlePlaceOrder = useCallback(async () => {
    const table =
      cart.orderType === ORDER_TYPE.DINE_IN
        ? tables.find((t) => t.id === cart.tableId)
        : null;

    const result = await submit({
      source: ORDER_SOURCE.POS,
      orderType: cart.orderType,
      tableQrToken: table?.qr_token || null,
      customerName: cart.customerName || null,
      customerPhone: cart.customerPhone || null,
      items: cart.items.map((i) => ({
        menuItemId: i.menuItemId,
        quantity: i.quantity,
        notes: i.notes,
      })),
    });

    if (result) {
      // Reconstruct order metadata for print service
      const subtotal = cart.subtotal;
      const gstAmount = gst ? Math.round(subtotal * 0.05 * 100) / 100 : 0;
      const grand = subtotal + gstAmount;

      const orderForPrint = {
        token_number: result.tokenNumber,
        order_number: result.orderNumber,
        order_type: cart.orderType,
        cafe_tables: table ? { table_number: table.table_number } : null,
        subtotal: subtotal,
        tax_amount: gstAmount,
        total_amount: grand,
        created_at: new Date().toISOString(),
      };

      const itemsForPrint = cart.items.map(i => ({
        item_name: i.name,
        category_name: i.categoryName || i.category_name || '',
        quantity: i.quantity,
        price: i.price,
        line_total: i.price * i.quantity,
        notes: i.notes
      }));

      // Trigger dual print immediately (KOT + Bill)
      try {
        await printKOT(orderForPrint, itemsForPrint);
        await printBill(orderForPrint, itemsForPrint, null);
      } catch (printErr) {
        console.error("Printing failed:", printErr);
      }

      // Auto-complete the order in database since cashier orders are completed immediately
      try {
        await completeOrderWithFallback(result.orderId, 'NEW');
      } catch (err) {
        console.error("Failed to auto-complete POS order:", err);
      }

      cart.clear();
      reset();
      loadOrders();
    }
  }, [cart, tables, gst, submit, reset, loadOrders]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    function handleGlobalKeyDown(e) {
      const inInput = ['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement?.tagName);

      // F8 or Alt + P to Print Bill
      if (e.key === 'F8' || (e.altKey && e.key.toLowerCase() === 'p')) {
        const canPlace = cart.items.length > 0 && !isSubmitting &&
          (cart.orderType === ORDER_TYPE.TAKEAWAY || cart.tableId);
        if (canPlace) {
          e.preventDefault();
          handlePlaceOrder();
        }
      }

      // Escape (only when not in input) or Alt + C to Clear Order
      if ((e.key === 'Escape' && !inInput) || (e.altKey && e.key.toLowerCase() === 'c')) {
        if (cart.items.length > 0) {
          e.preventDefault();
          if (window.confirm("Clear current order?")) {
            cart.clear();
          }
        }
      }
    }

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [cart, isSubmitting, handlePlaceOrder]);

  function handleSavePrinters() {
    setSavedBillPrinter(billPrinter);
    setSavedKotPrinter(kotPrinter);
    setPrinterMsg('💾 Printer preferences saved!');
    setTimeout(() => setPrinterMsg(''), 2500);
  }

  async function testBillPrint() {
    if (!billPrinter) return alert("Select cashier printer first");
    try {
      const html = `<html><body><h1 style="text-align:center;">Test Bill Printer</h1><p style="text-align:center;">Connection Working!</p></body></html>`;
      await printQZSilent(billPrinter, html);
      alert("Test print sent to Bill Printer!");
    } catch (e) {
      alert("Failed: " + e.message);
    }
  }

  async function testKotPrint() {
    if (!kotPrinter) return alert("Select KOT printer first");
    try {
      const html = `<html><body><h1 style="text-align:center;">Test KOT Printer</h1><p style="text-align:center;">Connection Working!</p></body></html>`;
      await printQZSilent(kotPrinter, html);
      alert("Test print sent to KOT Printer!");
    } catch (e) {
      alert("Failed: " + e.message);
    }
  }

  const pendingCount = (orders.active || []).filter(o => o.order_status === 'NEW' || o.order_status === 'ACCEPTED').length;

  return (
    <div className="pos-page-wrap">
      <StaffNav>
        <div className="pos-tab-bar" style={{ background: 'transparent', borderBottom: 'none', padding: 0 }}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              className={`pos-tab-btn${activeTab === tab.id ? ' active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
              {tab.id === 'orders' && pendingCount > 0 && (
                <span className="pos-tab-badge">{pendingCount}</span>
              )}
            </button>
          ))}
        </div>
      </StaffNav>

      {/* Hotkey hint bar */}
      {activeTab === 'billing' && (
        <div className="hotkey-bar">
          <span>⚡ <strong>Cashier Shortcuts:</strong></span>
          <span>Search by name or code</span>
          <span><kbd>Enter</kbd> in search to add match</span>
          <span><kbd>F8</kbd> or <kbd>Alt + P</kbd> to Print Bill</span>
          <span><kbd>Escape</kbd> or <kbd>Alt + C</kbd> to Clear Order</span>
        </div>
      )}

      {/* Billing view */}
      {activeTab === 'billing' && (
        <div className="bill-layout">
          <POSMenuPanel onAddItem={cart.addItem} />
          <POSCartPanel
            cart={cart}
            tables={tables}
            onPlaceOrder={handlePlaceOrder}
            isSubmitting={isSubmitting}
            error={error}
            gst={gst}
            setGst={setGst}
          />
        </div>
      )}

      {/* Table orders view */}
      {activeTab === 'orders' && (
        <div style={{ padding: '0 20px 40px', overflowY: 'auto', flex: 1 }}>
          <ActiveOrdersPanel
            active={orders.active || []}
            completed={orders.completed || []}
            onPay={setPayingOrder}
            onRefresh={loadOrders}
          />
        </div>
      )}

      {/* Printer settings view */}
      {activeTab === 'printers' && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          flex: 1,
          overflowY: 'auto',
          padding: '30px 20px',
          width: '100%'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, width: '100%', maxWidth: 860 }}>
            {/* Top Main Settings Card */}
            <div style={{
              background: 'var(--bg-panel)',
              border: '1px solid var(--line)',
              borderRadius: 16,
              padding: '28px 32px',
              boxShadow: '0 12px 40px rgba(0,0,0,0.6)'
            }}>
              {/* Header Title */}
              <h2 style={{
                margin: 0,
                fontSize: 20,
                fontWeight: 700,
                color: 'var(--gold)',
                fontFamily: 'Poppins',
                display: 'flex',
                alignItems: 'center',
                gap: 10
              }}>
                🖨️ QZ Tray Thermal Printer Settings
              </h2>
              <p style={{ margin: '6px 0 18px', fontSize: 13, color: 'var(--cream-muted)' }}>
                Configure silent 80mm thermal printers for Cashier Bills and Kitchen KOTs.
              </p>

              {/* Status and Connect Row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22 }}>
                <span style={{
                  background: qzConnected ? 'rgba(95,168,60,0.2)' : 'rgba(224,82,82,0.2)',
                  color: qzConnected ? 'var(--green)' : 'var(--red)',
                  border: `1px solid ${qzConnected ? 'rgba(95,168,60,0.4)' : 'rgba(224,82,82,0.4)'}`,
                  padding: '6px 16px',
                  borderRadius: 99,
                  fontWeight: 700,
                  fontSize: 13,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}>
                  ● {qzConnected ? 'Online & Connected' : 'Offline & Disconnected'}
                </span>
                <button
                  className="adm-btn adm-btn-secondary"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 16px',
                    fontSize: 13,
                    borderRadius: 99,
                    border: '1px solid var(--gold-soft)',
                    background: 'rgba(216,161,58,0.1)',
                    color: 'var(--gold)'
                  }}
                  onClick={() => connectQZ(true)}
                >
                  🔄 Connect / Reconnect QZ Tray
                </button>
              </div>

              {/* Printer Cards Grid (2 Columns) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
                {/* Cashier Bill Printer Card */}
                <div style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--line)',
                  borderRadius: 12,
                  padding: 20,
                  display: 'flex',
                  flexDirection: 'column',
                  justify: 'space-between'
                }}>
                  <div>
                    <h3 style={{ margin: '0 0 4px', fontSize: 15, color: 'var(--cream)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                      📄 Cashier Bill Printer
                    </h3>
                    <p style={{ margin: '0 0 14px', fontSize: 12, color: 'var(--cream-muted)', lineHeight: 1.4 }}>
                      Prints full customer tax bills with dish prices, GST, and totals.
                    </p>
                    <select
                      value={billPrinter}
                      onChange={e => setBillPrinterState(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        background: 'var(--bg-panel)',
                        border: '1px solid var(--line)',
                        borderRadius: 8,
                        color: 'var(--cream)',
                        fontSize: 13,
                        outline: 'none',
                        marginBottom: 12
                      }}
                    >
                      <option value="">-- Select Bill Printer --</option>
                      {printers.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <button
                    className="adm-btn adm-btn-secondary"
                    style={{
                      width: '100%',
                      padding: '9px',
                      borderRadius: 8,
                      fontSize: 13,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6
                    }}
                    onClick={testBillPrint}
                  >
                    🧪 Test Print Bill Printer
                  </button>
                </div>

                {/* Kitchen KOT Printer Card */}
                <div style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--line)',
                  borderRadius: 12,
                  padding: 20,
                  display: 'flex',
                  flexDirection: 'column',
                  justify: 'space-between'
                }}>
                  <div>
                    <h3 style={{ margin: '0 0 4px', fontSize: 15, color: 'var(--green)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                      👨‍🍳 Kitchen KOT Printer
                    </h3>
                    <p style={{ margin: '0 0 14px', fontSize: 12, color: 'var(--cream-muted)', lineHeight: 1.4 }}>
                      Prints price-free Kitchen Order Tickets (0 prices, no financial totals).
                    </p>
                    <select
                      value={kotPrinter}
                      onChange={e => setKotPrinterState(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        background: 'var(--bg-panel)',
                        border: '1px solid var(--line)',
                        borderRadius: 8,
                        color: 'var(--cream)',
                        fontSize: 13,
                        outline: 'none',
                        marginBottom: 12
                      }}
                    >
                      <option value="">-- Select KOT Printer --</option>
                      {printers.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <button
                    className="adm-btn adm-btn-secondary"
                    style={{
                      width: '100%',
                      padding: '9px',
                      borderRadius: 8,
                      fontSize: 13,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6
                    }}
                    onClick={testKotPrint}
                  >
                    🧪 Test Print KOT Printer
                  </button>
                </div>
              </div>

              {/* Bottom Right Save Button */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 14 }}>
                {printerMsg && <span style={{ color: 'var(--gold)', fontWeight: 700, fontSize: 13 }}>{printerMsg}</span>}
                <button
                  className="adm-btn adm-btn-primary"
                  style={{
                    background: 'var(--gold)',
                    color: '#1a1510',
                    border: 'none',
                    borderRadius: 8,
                    padding: '10px 24px',
                    fontWeight: 700,
                    fontSize: 14,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                  }}
                  onClick={handleSavePrinters}
                >
                  💾 Save Printer Preferences
                </button>
              </div>
            </div>

            {/* Bottom Card: How QZ Tray Works */}
            <div style={{
              background: 'var(--bg-panel)',
              border: '1px solid var(--line)',
              borderRadius: 16,
              padding: '22px 28px'
            }}>
              <h3 style={{
                margin: '0 0 12px',
                fontSize: 14,
                fontWeight: 700,
                color: 'var(--blue)',
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}>
                ℹ️ How QZ Tray Works
              </h3>
              <ol style={{
                margin: 0,
                paddingLeft: 20,
                fontSize: 12.5,
                color: 'var(--cream-dim)',
                lineHeight: 1.7
              }}>
                <li>
                  Download &amp; Install <strong>QZ Tray (v2.2+)</strong> on this cashier Windows PC from{' '}
                  <a href="https://qz.io/download/" target="_blank" rel="noreferrer" style={{ color: 'var(--gold)', textDecoration: 'underline' }}>
                    https://qz.io/download/
                  </a>.
                </li>
                <li>Keep <strong>QZ Tray Running</strong> in your Windows system tray (near the clock).</li>
                <li>Click <strong>Connect QZ Tray</strong> above. When prompted by QZ Tray, select <em>Allow</em> to grant permission.</li>
                <li>Select your USB / Network 80mm thermal printers from the dropdowns above and click <strong>Save Printer Preferences</strong>.</li>
              </ol>
            </div>
          </div>
        </div>
      )}

      {payingOrder && (
        <PaymentModal
          order={payingOrder}
          onClose={() => setPayingOrder(null)}
          onPaid={() => {
            setPayingOrder(null);
            loadOrders();
          }}
        />
      )}
    </div>
  );
}
