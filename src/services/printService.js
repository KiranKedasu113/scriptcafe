/**
 * Decoupled Printing Service with QZ Tray silent printing & browser print fallback.
 */

// Helper to escape HTML strings
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function getSavedBillPrinter() { return localStorage.getItem('isha_cafe_bill_printer') || ''; }
export function getSavedKotPrinter() { return localStorage.getItem('isha_cafe_kot_printer') || ''; }
export function setSavedBillPrinter(name) { localStorage.setItem('isha_cafe_bill_printer', name); }
export function setSavedKotPrinter(name) { localStorage.setItem('isha_cafe_kot_printer', name); }

export async function initQZTrayConnection() {
  if (!window.qz) return false;
  if (window.qz.websocket.isActive()) return true;
  try {
    await window.qz.websocket.connect({ retries: 2, delay: 1 });
    return true;
  } catch (e) {
    console.warn("QZ connection failed:", e);
    return false;
  }
}

export async function printQZSilent(printerName, htmlContent) {
  if (!window.qz) throw new Error("QZ Tray library is not loaded.");
  if (!window.qz.websocket.isActive()) {
    const connected = await initQZTrayConnection();
    if (!connected) throw new Error("QZ Tray is not connected. Please ensure the QZ Tray desktop app is running.");
  }
  if (!printerName || !printerName.trim()) {
    throw new Error("No printer selected.");
  }
  const config = window.qz.configs.create(printerName.trim(), {
    colorType: 'color',
    rasterize: true, // Render HTML to image for clean thermal output
  });
  const data = [{
    type: 'html',
    format: 'plain',
    data: htmlContent
  }];
  await window.qz.print(config, data);
}

function openPrintFrame(html) {
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow.document;
  doc.open();
  doc.write(html);
  doc.close();

  try {
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
  } finally {
    setTimeout(() => {
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe);
      }
    }, 1000);
  }
}

function baseStyles() {
  return `
    <style>
      @page { size: 80mm auto; margin: 0; }
      *, *::before, *::after { box-sizing: border-box; }
      body {
        font-family: 'Courier New', 'Consolas', monospace;
        width: 76mm;
        margin: 0 auto;
        padding: 6px 4px 18px;
        color: #000;
        background: #fff;
        font-size: 13px;
        line-height: 1.35;
        -webkit-print-color-adjust: exact;
      }
      .shop-header { text-align: center; margin-bottom: 6px; }
      .shop-title { font-size: 19px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; margin: 0; }
      .shop-sub { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; margin-top: 1px; }
      
      .token-badge {
        font-size: 17px; font-weight: 800; text-align: center;
        margin: 6px 0; padding: 4px; border: 1.5px dashed #000;
        text-transform: uppercase;
      }
      
      .meta-section { text-align: center; font-size: 11.5px; margin-bottom: 6px; }
      .divider-double { border-top: 2px double #000; margin: 6px 0; }
      .divider-dash { border-top: 1px dashed #000; margin: 6px 0; }
      
      table { width: 100%; border-collapse: collapse; margin: 4px 0; font-size: 12.5px; }
      th { text-align: left; border-bottom: 1px solid #000; padding: 3px 0; font-size: 11px; text-transform: uppercase; }
      td { padding: 3px 0; vertical-align: top; word-break: break-word; }
      .qty-col { width: 28px; font-weight: 700; }
      .price-col { text-align: right; width: 68px; font-weight: 600; }
      .item-notes { font-size: 10.5px; font-style: italic; color: #222; margin-top: 1px; }
      
      .summary-table { width: 100%; font-size: 13px; }
      .grand-total-box {
        border-top: 1.5px solid #000; border-bottom: 1.5px solid #000;
        padding: 5px 0; margin-top: 4px; font-size: 16px; font-weight: 800;
        display: flex; justify-content: space-between; align-items: center;
      }
      
      .footer-msg { text-align: center; font-size: 11px; margin-top: 10px; font-weight: 700; text-transform: uppercase; }
    </style>
  `;
}

/** Kitchen Order Ticket — 80mm layout. Excludes Irani category items. */
export async function printKOT(order, items) {
  // Exclude Irani category items from Kitchen KOT printer
  const kotItems = items.filter((i) => {
    const cat = String(i.category_name || i.categoryName || i.category || '').toLowerCase();
    return !cat.includes('irani');
  });

  // If no kitchen items remain after filtering Irani items, skip KOT print
  if (kotItems.length === 0) {
    console.log("Only Irani category items in order — skipping Kitchen KOT print.");
    return;
  }

  const rows = kotItems
    .map(
      (i) => `<tr>
        <td class="qty-col">${i.quantity}x</td>
        <td>
          <strong>${escapeHtml(i.item_name || i.name)}</strong>
          ${i.notes ? `<div class="item-notes">* ${escapeHtml(i.notes)}</div>` : ''}
        </td>
      </tr>`
    )
    .join('');

  const tableNo = order.cafe_tables?.table_number ?? order.table_number ?? '';
  const dateStr = new Date(order.created_at || Date.now()).toLocaleDateString();
  const timeStr = new Date(order.created_at || Date.now()).toLocaleTimeString();

  const html = `
    <html><head>${baseStyles()}</head><body>
      <div class="shop-header">
        <div class="shop-title">*** KITCHEN KOT ***</div>
      </div>
      <div class="token-badge">TOKEN #${order.token_number ?? order.tokenNumber}</div>
      <div class="meta-section">
        <strong>${order.order_type === 'DINE_IN' ? `TABLE ${tableNo}` : 'TAKEAWAY ORDER'}</strong><br/>
        Date: ${dateStr} &middot; ${timeStr}
      </div>
      <div class="divider-dash"></div>
      <table>
        <thead>
          <tr><th class="qty-col">QTY</th><th>ITEM DESCRIPTION</th></tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <div class="divider-double"></div>
    </body></html>
  `;

  const kotPrinter = getSavedKotPrinter();
  if (window.qz && kotPrinter) {
    try {
      await printQZSilent(kotPrinter, html);
      return;
    } catch (err) {
      console.warn("QZ KOT print failed, falling back to browser dialog:", err);
    }
  }
  openPrintFrame(html);
}

/** Customer-facing bill — 80mm layout for Cashier printer (Prints ALL items: Irani & other categories). */
export async function printBill(order, items, payment) {
  // Cashier printer prints ALL items in the order (both Irani and other categories)
  const printItems = items;

  const printedSubtotal = Number(order.subtotal ?? printItems.reduce(
    (sum, i) => sum + Number(i.line_total ?? (i.price * i.quantity)),
    0
  ));
  const tax = Number(order.tax_amount || order.taxAmount || 0);
  const printedTotal = Number(order.total_amount ?? (printedSubtotal + tax));

  const rows = printItems
    .map(
      (i) => `<tr>
        <td class="qty-col">${i.quantity}x</td>
        <td>
          ${escapeHtml(i.item_name || i.name)}
          ${i.notes ? `<div class="item-notes">* ${escapeHtml(i.notes)}</div>` : ''}
        </td>
        <td class="price-col">₹${Number(i.line_total ?? (i.price * i.quantity)).toFixed(2)}</td>
      </tr>`
    )
    .join('');

  const tableNo = order.cafe_tables?.table_number ?? order.table_number ?? '';
  const dateStr = new Date(order.created_at || Date.now()).toLocaleDateString();
  const timeStr = new Date(order.created_at || Date.now()).toLocaleTimeString();

  const html = `
    <html><head>${baseStyles()}</head><body>
      <div class="shop-header">
        <div class="shop-title">ISHA CAFE</div>
        <div class="shop-sub">Good Food, Good Mood!</div>
      </div>
      <div class="token-badge">TOKEN #${order.token_number ?? order.tokenNumber}</div>
      <div class="meta-section">
        Order #${order.order_number || 'POS'} &middot; ${order.order_type === 'DINE_IN' ? `Table ${tableNo}` : 'TAKEAWAY'}<br/>
        Date: ${dateStr} ${timeStr}
      </div>
      <div class="divider-dash"></div>
      <table>
        <thead>
          <tr><th class="qty-col">QTY</th><th>ITEM</th><th class="price-col">AMOUNT</th></tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <div class="divider-dash"></div>
      <table class="summary-table">
        <tr><td>Subtotal</td><td class="price-col">₹${printedSubtotal.toFixed(2)}</td></tr>
        ${
          tax > 0
            ? `<tr><td>Tax / GST</td><td class="price-col">₹${tax.toFixed(2)}</td></tr>`
            : ''
        }
      </table>
      <div class="grand-total-box">
        <span>TOTAL</span>
        <span>₹${printedTotal.toFixed(2)}</span>
      </div>
      ${payment ? `<div class="meta-section" style="margin-top:6px;">Paid via <strong>${payment.method}</strong></div>` : ''}
      <div class="divider-double"></div>
      <div class="footer-msg">Thank you! Visit again!</div>
    </body></html>
  `;

  const billPrinter = getSavedBillPrinter();
  if (window.qz && billPrinter) {
    try {
      await printQZSilent(billPrinter, html);
      return;
    } catch (err) {
      console.warn("QZ Bill print failed, falling back to browser dialog:", err);
    }
  }
  openPrintFrame(html);
}
