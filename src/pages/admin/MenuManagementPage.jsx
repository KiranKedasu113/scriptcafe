import { useEffect, useRef, useState } from 'react';
import {
  fetchAllMenuItems, fetchCategories,
  updateMenuItem, setItemAvailability,
  createMenuItem, createCategory,
} from '../../services/adminService';
import { supabase } from '../../lib/supabase';
import { getFoodImageByName } from '../../utils/foodImages';

const BLANK = {
  code: '',
  name: '',
  category_id: '',
  price: '',
  is_veg: true,
  unit_label: '',
  image_url: '',
};

export function MenuManagementPage() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('All');
  const [newItem, setNewItem] = useState(BLANK);
  const [newCatName, setNewCatName] = useState('');
  const [savingId, setSavingId] = useState(null);
  const [toast, setToast] = useState(null);
  const [error, setError] = useState(null);
  // Row-level edits tracked as { [id]: { field: value, ... } }
  const [rowEdits, setRowEdits] = useState({});
  const fileInputRef = useRef(null);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }

  function reload() {
    Promise.all([fetchAllMenuItems(), fetchCategories()])
      .then(([i, c]) => { setItems(i); setCategories(c); })
      .catch(err => setError(err.message));
  }
  useEffect(reload, []);

  // ---- Row editing helpers ----
  function setRowField(id, field, value) {
    setRowEdits(prev => ({
      ...prev,
      [id]: { ...(prev[id] || {}), [field]: value },
    }));
  }

  function getRowVal(item, field) {
    return rowEdits[item.id]?.[field] !== undefined
      ? rowEdits[item.id][field]
      : item[field];
  }

  async function handleSaveRow(item) {
    const edits = rowEdits[item.id] || {};
    if (!Object.keys(edits).length) return;
    setSavingId(item.id);
    try {
      await updateMenuItem(item.id, edits);
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, ...edits } : i));
      setRowEdits(prev => { const n = { ...prev }; delete n[item.id]; return n; });
      showToast('Saved ✓');
    } catch (err) { setError(err.message); }
    finally { setSavingId(null); }
  }

  async function handleDeleteRow(item) {
    if (!window.confirm(`Delete "${item.name}"?`)) return;
    setSavingId(item.id);
    try {
      const { error: err } = await supabase.from('menu_items').delete().eq('id', item.id);
      if (err) throw new Error(err.message);
      setItems(prev => prev.filter(i => i.id !== item.id));
      showToast(`"${item.name}" deleted`);
    } catch (err) { setError(err.message); }
    finally { setSavingId(null); }
  }

  // ---- Add new item ----
  async function handleAddItem(e) {
    e.preventDefault();
    if (!newItem.name || !newItem.price || !newItem.category_id) {
      setError('Dish Name, Category and Price are required.');
      return;
    }
    try {
      await createMenuItem({
        code: newItem.code || null,
        name: newItem.name,
        price: Number(newItem.price),
        category_id: newItem.category_id,
        unit_label: newItem.unit_label || null,
        is_veg: newItem.is_veg,
        image_url: newItem.image_url || null,
      });
      setNewItem(BLANK);
      reload();
      showToast(`"${newItem.name}" added ✓`);
    } catch (err) { setError(err.message); }
  }

  async function handleAddCategory(e) {
    e.preventDefault();
    if (!newCatName.trim()) return;
    try {
      await createCategory({ name: newCatName.trim(), display_order: categories.length });
      setNewCatName('');
      reload();
      showToast(`Category "${newCatName}" created ✓`);
    } catch (err) { setError(err.message); }
  }

  // ---- Filter ----
  const q = search.trim().toLowerCase();
  const filtered = items.filter(i => {
    const matchCat = catFilter === 'All' || i.category_id === catFilter;
    const matchQ = !q ||
      i.name.toLowerCase().includes(q) ||
      (i.code && i.code.toLowerCase().includes(q));
    return matchCat && matchQ;
  });

  return (
    <div>
      {error && (
        <div className="adm-error">
          {error}
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}

      {/* ===== ADD NEW ITEM FORM ===== */}
      <div className="adm-add-card">
        <h3>➕ Add New Menu Item</h3>
        <form onSubmit={handleAddItem}>
          <div className="adm-add-grid">
            <div>
              <label>Item Code (Optional)</label>
              <input placeholder="e.g. 101 or M1" value={newItem.code}
                onChange={e => setNewItem({ ...newItem, code: e.target.value })} />
            </div>
            <div>
              <label>Dish Name *</label>
              <input placeholder="e.g. Crispy Paneer Roll" value={newItem.name}
                onChange={e => setNewItem({ ...newItem, name: e.target.value })} required />
            </div>
            <div>
              <label>Category *</label>
              <select value={newItem.category_id}
                onChange={e => setNewItem({ ...newItem, category_id: e.target.value })} required>
                <option value="">Select category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label>Price (₹) *</label>
              <input type="number" placeholder="120" min="0" value={newItem.price}
                onChange={e => setNewItem({ ...newItem, price: e.target.value })} required />
            </div>
            <div>
              <label>Dietary Type</label>
              <select value={newItem.is_veg ? '1' : '0'}
                onChange={e => setNewItem({ ...newItem, is_veg: e.target.value === '1' })}>
                <option value="1">🌱 Vegetarian</option>
                <option value="0">🍖 Non-Vegetarian</option>
              </select>
            </div>
            <div>
              <label>Portion / Unit (Optional)</label>
              <input placeholder="e.g. 6pcs, 200g" value={newItem.unit_label}
                onChange={e => setNewItem({ ...newItem, unit_label: e.target.value })} />
            </div>
          </div>

          {/* Image row */}
          <div style={{ marginTop: 14 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--cream-dim)', display: 'block', marginBottom: 6 }}>
              Dish Image (Paste URL or Upload Image File)
            </label>
            <div className="adm-img-row">
              <input
                placeholder="Paste food image URL here..."
                value={newItem.image_url}
                onChange={e => setNewItem({ ...newItem, image_url: e.target.value })}
                style={{ flex: 1 }}
              />
              <input type="file" accept="image/*" ref={fileInputRef} style={{ display: 'none' }}
                onChange={e => {
                  const file = e.target.files[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = ev => setNewItem({ ...newItem, image_url: ev.target.result });
                    reader.readAsDataURL(file);
                  }
                }}
              />
              <button type="button" className="adm-btn adm-btn-secondary"
                style={{ fontSize: 12, padding: '7px 12px' }}
                onClick={() => fileInputRef.current?.click()}>
                📁 Browse Image...
              </button>
              <img
                className="adm-img-preview"
                src={newItem.image_url || getFoodImageByName(newItem.name)}
                alt="Preview"
              />
            </div>
          </div>

          <div style={{ marginTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            <form onSubmit={handleAddCategory} style={{ display: 'flex', gap: 8 }}>
              <input className="adm-inline-input" placeholder="New category name…" value={newCatName}
                onChange={e => setNewCatName(e.target.value)} />
              <button type="submit" className="adm-btn adm-btn-secondary" style={{ fontSize: 12 }}>
                + Add Category
              </button>
            </form>
            <button type="submit" className="adm-btn adm-btn-primary">
              ➕ Save & Add Item to Menu
            </button>
          </div>
        </form>
      </div>

      {/* ===== EXISTING ITEMS TABLE ===== */}
      <div className="adm-panel">
        <h2>📋 Existing Menu Items &amp; Price Editor</h2>
        <p>Edit item codes, prices, dish names, categories, or image URLs directly in the table. Click <strong>Save</strong> per row to persist changes.</p>

        <div className="adm-filter-bar">
          <div className="adm-search-box">
            <span>🔍</span>
            <input id="admin-search-input" placeholder="Search dish by name or code..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="adm-cat-select" value={catFilter}
            onChange={e => setCatFilter(e.target.value)}>
            <option value="All">All Categories</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <span className="adm-count-badge">{filtered.length} items</span>
        </div>

        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th style={{ width: 70 }}>Code</th>
                <th style={{ width: 62 }}>Image</th>
                <th style={{ width: 90 }}>Type</th>
                <th>Dish Name</th>
                <th style={{ width: 160 }}>Category</th>
                <th style={{ width: 110 }}>Price (₹)</th>
                <th>Image URL</th>
                <th style={{ width: 130 }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => {
                const saving = savingId === item.id;
                const code = getRowVal(item, 'code') || '';
                const name = getRowVal(item, 'name') || '';
                const imageUrl = getRowVal(item, 'image_url') || '';
                return (
                  <tr key={item.id} className={saving ? 'adm-saving' : ''}>
                    {/* Code */}
                    <td>
                      <input className="adm-code-input" placeholder="—"
                        value={code}
                        onChange={e => setRowField(item.id, 'code', e.target.value || null)}
                      />
                    </td>
                    {/* Image thumbnail */}
                    <td>
                      <img
                        className="adm-thumb"
                        src={imageUrl || getFoodImageByName(name)}
                        alt={name}
                        width={42}
                        height={42}
                        loading="lazy"
                        onError={e => { e.target.src = getFoodImageByName(name); }}
                      />
                    </td>
                    {/* Type */}
                    <td>
                      <span className={`dot ${item.is_veg ? 'veg' : 'nonveg'}`} />
                      <span style={{ fontSize: 12, color: 'var(--cream-muted)' }}>{item.is_veg ? 'Veg' : 'Non-Veg'}</span>
                    </td>
                    {/* Dish name */}
                    <td>
                      <input className="adm-name-input"
                        value={name}
                        onChange={e => setRowField(item.id, 'name', e.target.value)}
                      />
                    </td>
                    {/* Category */}
                    <td>
                      <select className="adm-cat-row-select"
                        value={getRowVal(item, 'category_id')}
                        onChange={e => setRowField(item.id, 'category_id', e.target.value)}>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </td>
                    {/* Price */}
                    <td>
                      <input className="adm-price-input" type="number" min="0" step="0.5"
                        value={getRowVal(item, 'price')}
                        onChange={e => setRowField(item.id, 'price', Number(e.target.value))}
                      />
                    </td>
                    {/* Image URL */}
                    <td>
                      <input className="adm-img-url-input"
                        placeholder="Automatic food image"
                        value={imageUrl}
                        onChange={e => setRowField(item.id, 'image_url', e.target.value || null)}
                      />
                    </td>
                    {/* Action */}
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          className="adm-btn adm-btn-sm adm-btn-primary"
                          onClick={() => handleSaveRow(item)}
                          disabled={saving || !rowEdits[item.id]}
                        >
                          {saving ? '…' : 'Save'}
                        </button>
                        <button
                          className="adm-btn adm-btn-sm adm-btn-danger"
                          onClick={() => handleDeleteRow(item)}
                          disabled={saving}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="adm-empty">No items found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {toast && <div className="adm-toast">{toast}</div>}
    </div>
  );
}
