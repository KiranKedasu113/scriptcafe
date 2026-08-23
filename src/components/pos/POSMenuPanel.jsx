import { useEffect, useState } from 'react';
import { fetchMenu } from '../../services/menuService';
import { formatCurrency } from '../../utils/formatCurrency';
import { getFoodImageByName } from '../../utils/foodImages';

const CAT_ICONS = {
  'Irani': '☕', 'Momo Corner': '🥟', 'Samosa & Puffs': '🫓', 'Bread & Bun': '🍞',
  'Lassi': '🥛', 'Maggie': '🍜', 'Mocktails': '🍹', 'Burgers': '🍔',
  'Pizzas': '🍕', 'Chicken Snacks': '🍗', 'Veg Snacks': '🥦', 'Sides': '🍟',
  'Starters': '🫕', 'Sandwich': '🥪', 'Beverages': '🥤', 'Fried Rice': '🍚',
};

export function POSMenuPanel({ onAddItem }) {
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMenu()
      .then((cats) => {
        setCategories(cats);
      })
      .catch((err) => setError(err.message || 'Failed to load menu'))
      .finally(() => setLoading(false));
  }, []);

  const q = search.trim().toLowerCase();
  const activeItems = q
    ? categories.flatMap(c => c.items).filter(i => 
        i.name.toLowerCase().includes(q) || 
        (i.code && i.code.toLowerCase().includes(q))
      )
    : activeCategory === 'ALL'
    ? categories.flatMap(c => c.items)
    : (categories.find(c => c.id === activeCategory)?.items || []);

  // Keyboard listener inside search input: if exactly one item matches and they press Enter, add it!
  function handleSearchKeyDown(e) {
    if (e.key === 'Enter' && activeItems.length > 0) {
      // Add the first matching item to the cart instantly
      onAddItem(activeItems[0]);
      setSearch(''); // clear search for next shortcut
      e.preventDefault();
    }
  }

  return (
    <div className="bill-menu-col">
      {/* Search */}
      <div className="bill-search-wrapper">
        <span className="bill-search-icon">🔍</span>
        <input
          id="pos-search-input"
          placeholder="Quick search / type name or item code (Enter to add)…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleSearchKeyDown}
        />
        {search && (
          <button className="bill-search-clear" onClick={() => setSearch('')}>✕</button>
        )}
      </div>

      <div className="varieties-layout">
        {/* Category sidebar */}
        {!q && (
          <div className="cat-sidebar">
            {loading ? (
              <div className="empty-state" style={{ fontSize: 12 }}>Loading…</div>
            ) : (
              <>
                <button
                  key="ALL"
                  className={`chip${activeCategory === 'ALL' ? ' active' : ''}`}
                  onClick={() => setActiveCategory('ALL')}
                >
                  <span className="cat-icon">🍽️</span>
                  All
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    className={`chip${cat.id === activeCategory ? ' active' : ''}`}
                    onClick={() => setActiveCategory(cat.id)}
                  >
                    <span className="cat-icon">{CAT_ICONS[cat.name] || '🍽️'}</span>
                    {cat.name}
                  </button>
                ))}
              </>
            )}
          </div>
        )}

        {/* Item pick grid */}
        <div className="pick-grid">
          {error && <div className="error-banner" style={{ gridColumn: '1/-1' }}>{error}</div>}
          {loading && <div className="empty-state" style={{ gridColumn: '1/-1' }}>Loading menu…</div>}
          {!loading && activeItems.map((item) => (
            <div
              key={item.id}
              className={`pick-card${!item.is_available ? ' unavailable' : ''}`}
              onClick={() => item.is_available && onAddItem(item)}
            >
              <div className="img-box">
                <img
                  src={item.image_url || getFoodImageByName(item.name)}
                  alt={item.name}
                  loading="lazy"
                  onError={e => { e.target.src = getFoodImageByName(item.name); }}
                />
              </div>
              <div className="pick-card-name">
                <span className={`dot ${item.is_veg ? 'veg' : 'nonveg'}`} />
                {item.code && <span className="badge-code" style={{ marginRight: 4, padding: '1px 4px', fontSize: 10 }}>{item.code}</span>}
                {item.name}
                {item.unit_label && <span className="pick-unit">{item.unit_label}</span>}
              </div>
              <div className="pick-price-row">
                <span className="pick-price">{formatCurrency(item.price)}</span>
                {item.is_available
                  ? <button className="pick-add-btn" onClick={(e) => { e.stopPropagation(); onAddItem(item); }}>+ Add</button>
                  : <span className="pick-oos">Out</span>
                }
              </div>
            </div>
          ))}
          {!loading && activeItems.length === 0 && (
            <div className="empty-state" style={{ gridColumn: '1/-1' }}>No items found.</div>
          )}
        </div>
      </div>
    </div>
  );
}
