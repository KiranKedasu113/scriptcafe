import { useEffect, useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { fetchTables, addTable, setTableActive } from '../../services/adminService';

const BASE_URL = `${window.location.origin}/menu`;

function generateQRUrl(token) {
  return `${BASE_URL}?t=${token}`;
}

export function TableManagementPage() {
  const [tables, setTables] = useState([]);
  const [error, setError] = useState(null);
  const [newTableNum, setNewTableNum] = useState('');
  const [bulkStart, setBulkStart] = useState('1');
  const [bulkEnd, setBulkEnd] = useState('10');
  const [toast, setToast] = useState(null);
  const [adding, setAdding] = useState(false);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }

  function reload() {
    fetchTables()
      .then(setTables)
      .catch(err => setError(err.message));
  }
  useEffect(reload, []);

  async function handleAddTable(e) {
    e.preventDefault();
    if (!newTableNum) return;
    const exists = tables.some(t => String(t.table_number) === String(newTableNum));
    if (exists) {
      setError(`Table ${newTableNum} already exists!`);
      return;
    }
    setAdding(true);
    try {
      await addTable(newTableNum);
      setNewTableNum('');
      reload();
      showToast(`Table ${newTableNum} added ✓`);
    } catch (err) { setError(err.message); }
    finally { setAdding(false); }
  }

  async function handleBulkAdd(e) {
    e.preventDefault();
    const start = parseInt(bulkStart);
    const end = parseInt(bulkEnd);
    if (isNaN(start) || isNaN(end) || start > end) return;
    setAdding(true);
    try {
      let addedCount = 0;
      for (let n = start; n <= end; n++) {
        const tableStr = String(n);
        const exists = tables.some(t => String(t.table_number) === tableStr);
        if (exists) continue; // Skip existing tables without throwing error

        await addTable(tableStr);
        addedCount++;
      }
      reload();
      if (addedCount > 0) {
        showToast(`Tables generated successfully ✓`);
      } else {
        showToast(`All tables in range already exist.`);
      }
    } catch (err) { setError(err.message); }
    finally { setAdding(false); }
  }

  async function handleToggleActive(table) {
    try {
      await setTableActive(table.id, !table.is_active);
      reload();
    } catch (err) { setError(err.message); }
  }

  function copyLink(table) {
    navigator.clipboard.writeText(generateQRUrl(table.qr_token));
    showToast('QR link copied ✓');
  }

  // Sort tables numerically so they list: 1, 2, 3... instead of alphabetically: 1, 10, 11...
  const sortedTables = [...tables].sort((a, b) => {
    return parseInt(a.table_number, 10) - parseInt(b.table_number, 10);
  });

  const activeTables = sortedTables.filter(t => t.is_active);

  return (
    <div>
      {error && <div className="adm-error">{error} <button onClick={() => setError(null)}>✕</button></div>}

      <div className="adm-panel">
        <h2>▦ Table QR Code Generator</h2>
        <p>Manage and generate printable QR codes for your cafe tables. Customers scan these to open the menu with their table pre-selected.</p>

        <div className="adm-form-grid">
          {/* Single table */}
          <div className="adm-form-group" style={{ gridColumn: '1/-1' }}>
            <label>Add Single Table</label>
            <form onSubmit={handleAddTable} style={{ display: 'flex', gap: 10 }}>
              <input placeholder="Table number (e.g. 21)" value={newTableNum}
                onChange={e => setNewTableNum(e.target.value)} style={{ flex: 1, maxWidth: 220 }} />
              <button className="adm-btn adm-btn-primary" type="submit" disabled={adding}>
                ➕ Add Table
              </button>
            </form>
          </div>

          {/* Bulk range */}
          <div className="adm-form-group">
            <label>Start Table Number</label>
            <input type="number" min="1" value={bulkStart} onChange={e => setBulkStart(e.target.value)} />
          </div>
          <div className="adm-form-group">
            <label>End Table Number</label>
            <input type="number" min="1" value={bulkEnd} onChange={e => setBulkEnd(e.target.value)} />
          </div>
        </div>

        <div style={{ marginTop: 16, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="adm-btn adm-btn-primary" onClick={handleBulkAdd} disabled={adding}>
            🔄 Generate Range QRs
          </button>
          <button className="adm-btn adm-btn-secondary" onClick={() => window.print()}>
            🖨️ Print All QR Codes
          </button>
        </div>

        {/* QR grid */}
        <div className="adm-qr-grid" id="qrPrintSection">
          {activeTables.map(table => (
            <div key={table.id} className="adm-qr-card">
              <QRCodeSVG
                value={generateQRUrl(table.qr_token)}
                size={150}
                bgColor="#ffffff"
                fgColor="#241a08"
                level="M"
                style={{ display: 'block', margin: '0 auto 8px' }}
              />
              <div className="adm-qr-label">Table {table.table_number}</div>
              <div className="adm-qr-sub">Isha Cafe · Scan to Order</div>
              <div className="adm-qr-actions">
                <button className="adm-btn adm-btn-sm adm-btn-secondary" onClick={() => copyLink(table)}>
                  📋 Copy Link
                </button>
                <button
                  className={`adm-btn adm-btn-sm ${table.is_active ? 'adm-btn-danger' : 'adm-btn-primary'}`}
                  onClick={() => handleToggleActive(table)}
                >
                  {table.is_active ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          ))}
          {sortedTables.filter(t => !t.is_active).map(table => (
            <div key={table.id} className="adm-qr-card inactive">
              <div className="adm-qr-label">Table {table.table_number}</div>
              <div className="adm-qr-sub" style={{ color: 'var(--red)' }}>Inactive</div>
              <div className="adm-qr-actions">
                <button className="adm-btn adm-btn-sm adm-btn-primary" onClick={() => handleToggleActive(table)}>
                  Activate
                </button>
              </div>
            </div>
          ))}
          {tables.length === 0 && (
            <div className="adm-empty" style={{ gridColumn: '1/-1' }}>No tables yet. Add one above.</div>
          )}
        </div>
      </div>

      {toast && <div className="adm-toast">{toast}</div>}
    </div>
  );
}
