import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchMenu } from '../../services/menuService';
import { validateTableToken } from '../../services/tableService';
import { useCart } from '../../context/CartContext';
import { useCreateOrder } from '../../hooks/useCreateOrder';
import { ORDER_SOURCE, ORDER_TYPE } from '../../utils/constants';
import { formatCurrency } from '../../utils/formatCurrency';
import { getFoodImageByName } from '../../utils/foodImages';
import { CafeLogo } from '../../components/common/CafeLogo';

const CAT_COLORS = {
  'Irani':          '#7c4a1e',
  'Momo Corner':    '#1e5c7c',
  'Samosa & Puffs': '#6b3d1e',
  'Bread & Bun':    '#5c4a1e',
  'Lassi':          '#4a1e6b',
  'Maggie':         '#1e6b4a',
  'Mocktails':      '#1e4a6b',
  'Burgers':        '#7c2e1e',
  'Pizzas':         '#7c1e1e',
  'Chicken Snacks': '#5c1e1e',
  'Veg Snacks':     '#2e6b1e',
  'Sides':          '#4a4a1e',
  'Starters':       '#6b1e2e',
  'Sandwich':       '#4a2e1e',
  'Beverages':      '#1e3a6b',
  'Fried Rice':     '#3a6b1e',
};

const CAT_ICONS = {
  'All':            '🍱',
  'Irani':          '☕',
  'Momo Corner':    '🥟',
  'Samosa & Puffs': '🫓',
  'Bread & Bun':    '🍞',
  'Lassi':          '🥛',
  'Maggie':         '🍜',
  'Mocktails':      '🍹',
  'Burgers':        '🍔',
  'Pizzas':         '🍕',
  'Chicken Snacks': '🍗',
  'Veg Snacks':     '🥦',
  'Sides':          '🍟',
  'Starters':       '🫕',
  'Sandwich':       '🥪',
  'Beverages':      '🥤',
  'Fried Rice':     '🍚',
};

export function MenuPage() {
  const [searchParams] = useSearchParams();
  const qrToken = searchParams.get('t');

  const { items, table, orderType, setTable, setOrderType, addItem, decreaseQuantity, increaseQuantity, getSubtotal, clearCart } = useCart();
  const { submit, isSubmitting } = useCreateOrder();

  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [tableStatus, setTableStatus] = useState(qrToken ? 'checking' : 'takeaway');
  const [tableInfo, setTableInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal / Interaction states
  const [activeDetailItem, setActiveDetailItem] = useState(null);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null); // Placed order details for confirmation popup
  const [toastMsg, setToastMsg] = useState(null);

  // Target Mini-Game states
  const [gameActive, setGameActive] = useState(false);
  const [gameScore, setGameScore] = useState(0);
  const [gameTimeLeft, setGameTimeLeft] = useState(20);
  const [gameLives, setGameLives] = useState(3);
  const [gameTargets, setGameTargets] = useState([]);
  const [gameOver, setGameOver] = useState(false);

  function triggerToast(msg) {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 1800);
  }

  // Validate table QR token
  useEffect(() => {
    let cancelled = false;
    if (!qrToken) {
      setOrderType(ORDER_TYPE.TAKEAWAY);
      setTableStatus('takeaway');
      return;
    }
    validateTableToken(qrToken)
      .then((tableObj) => {
        if (cancelled) return;
        if (!tableObj) { setTableStatus('invalid'); return; }
        setTable(tableObj);
        setOrderType(ORDER_TYPE.DINE_IN);
        setTableInfo(tableObj);
        setTableStatus('valid');
      })
      .catch(() => !cancelled && setTableStatus('invalid'));
    return () => { cancelled = true; };
  }, [qrToken, setTable, setOrderType]);

  // Load menu (excludes Irani category from customer digital menu)
  useEffect(() => {
    fetchMenu()
      .then((cats) => {
        const customerCats = cats.filter(
          (c) => !c.name.toLowerCase().includes('irani')
        );
        setCategories(customerCats);
      })
      .catch((err) => setError(err.message || 'Failed to load menu'))
      .finally(() => setLoading(false));
  }, []);

  // Mini-Game Loop & Spawner
  const spawnTarget = useCallback(() => {
    if (gameOver || gameTimeLeft <= 0 || gameLives <= 0) return;

    const id = Math.random().toString();
    const rand = Math.random();
    let type = 'food';
    const regularFoods = ['🥟', '🍔', '🍕', '🍟', '🍗', '🥤', '🥪', '🍰'];
    let emoji = regularFoods[Math.floor(Math.random() * regularFoods.length)];
    let points = 10;
    let duration = 1400;

    if (rand < 0.38) {
      type = 'bomb';
      emoji = '💣';
      duration = 1600;
    } else if (rand > 0.86) {
      type = 'gold';
      emoji = '🌟';
      points = 25;
      duration = 1000;
    }

    const newTarget = {
      id,
      emoji,
      type,
      points,
      x: Math.max(10, Math.floor(Math.random() * 300)),
      y: Math.max(40, Math.floor(Math.random() * 400)),
    };

    setGameTargets((prev) => [...prev, newTarget]);

    setTimeout(() => {
      setGameTargets((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, [gameOver, gameTimeLeft, gameLives]);

  const startMiniGame = () => {
    setGameScore(0);
    setGameTimeLeft(20);
    setGameLives(3);
    setGameTargets([]);
    setGameOver(false);
    setGameActive(true);
  };

  useEffect(() => {
    if (!gameActive || gameOver) return;

    const timerId = setInterval(() => {
      setGameTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerId);
          setGameOver(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const spawnId = setInterval(() => {
      spawnTarget();
    }, 480);

    return () => {
      clearInterval(timerId);
      clearInterval(spawnId);
    };
  }, [gameActive, gameOver, spawnTarget]);

  const handleHitTarget = (target, e) => {
    e.preventDefault();
    e.stopPropagation();

    if (target.type === 'bomb') {
      setGameLives((prev) => {
        const next = prev - 1;
        if (next <= 0) setGameOver(true);
        return next;
      });
      setGameScore((prev) => Math.max(0, prev - 50));
      const arena = document.getElementById('gameArenaBox');
      if (arena) {
        arena.classList.add('bomb-flash', 'shake-arena');
        setTimeout(() => arena.classList.remove('bomb-flash', 'shake-arena'), 300);
      }
    } else {
      setGameScore((prev) => {
        const nextScore = Math.min(200, prev + target.points);
        if (nextScore >= 200) setGameOver(true);
        return nextScore;
      });
    }

    setGameTargets((prev) => prev.filter((t) => t.id !== target.id));
  };

  // Submit Order directly from drawer
  const handlePlaceOrder = async () => {
    setCartDrawerOpen(false);
    const tokenToUse = orderType === ORDER_TYPE.DINE_IN ? (table?.qr_token || qrToken || null) : null;
    const result = await submit({
      source: ORDER_SOURCE.QR,
      orderType,
      tableQrToken: tokenToUse,
      items: items.map((i) => ({
        menuItemId: i.menuItemId,
        quantity: i.quantity,
        notes: i.notes || '',
      })),
    });

    if (result) {
      setPlacedOrder(result);
      clearCart();
    }
  };

  if (tableStatus === 'checking') return <div className="empty-state">Checking table…</div>;
  if (tableStatus === 'invalid') {
    return (
      <div className="empty-state">
        <h2>Invalid or expired table QR code</h2>
        <p>Please ask staff to rescan or reprint this table's QR code.</p>
      </div>
    );
  }
  if (loading) return <div className="empty-state">Loading menu…</div>;
  if (error) return <div className="error-banner">{error}</div>;

  const q = search.trim().toLowerCase();

  const filteredCategories = q
    ? categories.map((cat) => ({
        ...cat,
        items: cat.items.filter((i) => i.name.toLowerCase().includes(q) || (i.code && String(i.code).includes(q))),
      })).filter((cat) => cat.items.length > 0)
    : categories;

  const displayedCategories = selectedCategory === 'All'
    ? filteredCategories
    : filteredCategories.filter((cat) => cat.name === selectedCategory);

  const cartTotalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const cartSubtotalAmount = getSubtotal();

  return (
    <div className="menu-page-wrap" style={{ maxWidth: 480, margin: '0 auto', paddingBottom: 120, position: 'relative' }}>
      
      {/* 1. TABLE ID BANNER */}
      {tableInfo && (
        <div className="table-banner">
          📍 DINE-IN · TABLE {tableInfo.table_number}
        </div>
      )}

      {/* 2. BRAND HEADER */}
      <header className="mob-header" style={{ justifyContent: 'center' }}>
        <div className="brand-wrap">
          <CafeLogo size={48} className="brand-mark" />
          <div className="brand-title">
            <h1>ISHA <span>CAFE</span></h1>
            <div className="tag">Good Food, Good Mood!</div>
          </div>
        </div>
      </header>

      {/* 3. SEARCH BAR */}
      <div className="search-wrap">
        <div className="search-input-box">
          <input
            id="menu-search-input"
            placeholder="Search dishes, momos, pizzas, shakes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--cream-dim)', cursor: 'pointer' }}
              onClick={() => setSearch('')}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* 4. CATEGORY HORIZONTAL PILLS SCROLL */}
      <div className="cat-scroll-container">
        <button
          className={`cat-pill ${selectedCategory === 'All' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('All')}
        >
          <span>🍱</span> All
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`cat-pill ${selectedCategory === cat.name ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat.name)}
          >
            <span>{CAT_ICONS[cat.name] || '🍽️'}</span> {cat.name}
          </button>
        ))}
      </div>

      {/* 5. DISHES VERTICAL CARDS LIST */}
      <div className="dishes-container">
        {displayedCategories.map((cat) => (
          <div key={cat.id}>
            <div className="cat-heading">
              <span>{CAT_ICONS[cat.name] || '🍽️'}</span> {cat.name}
            </div>

            {cat.items.map((item) => (
              <div
                key={item.id}
                className={`dish-card ${!item.is_available ? 'unavailable' : ''}`}
                onClick={() => item.is_available && setActiveDetailItem(item)}
              >
                <div className="dish-img-wrap">
                  <img
                    src={item.image_url || getFoodImageByName(item.name)}
                    className="dish-img"
                    alt={item.name}
                    loading="lazy"
                    onLoad={(e) => e.target.classList.add('loaded')}
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&auto=format&fit=crop&q=80';
                      e.target.classList.add('loaded');
                    }}
                  />
                  <div className="veg-tag-badge">
                    <span className={`dot ${item.is_veg ? 'veg' : 'nonveg'}`} />
                    {item.is_veg ? 'Veg' : 'NonVeg'}
                  </div>
                </div>

                <div className="dish-details">
                  <div className="dish-title">{item.name}</div>
                  <div className="dish-unit">{item.unit_label || 'Standard portion'}</div>
                  <div className="dish-bottom">
                    <div className="dish-price">₹{item.price}</div>
                    {item.is_available ? (
                      <button
                        className="add-btn-mob"
                        onClick={(e) => {
                          e.stopPropagation();
                          addItem(item);
                          triggerToast(`Added 1x ${item.name}`);
                        }}
                      >
                        + Add
                      </button>
                    ) : (
                      <span style={{ color: 'var(--red)', fontSize: 11, fontWeight: 'bold' }}>Out of stock</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}

        {displayedCategories.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 10px', color: 'var(--cream-dim)', fontSize: 14 }}>
            No dishes found matching search.
          </div>
        )}
      </div>

      {/* 6. FLOATING BOTTOM CART BAR */}
      {cartTotalItems > 0 && (
        <div className="floating-cart-bar" onClick={() => setCartDrawerOpen(true)}>
          <div className="cart-bar-info">
            <div className="cart-bar-count">{cartTotalItems} ITEM{cartTotalItems > 1 ? 'S' : ''}</div>
            <div className="cart-bar-total">{formatCurrency(cartSubtotalAmount)}</div>
          </div>
          <div className="cart-bar-action">
            <span>View Order</span> 🛒
          </div>
        </div>
      )}

      {/* 7. MODALS OVERLAYS */}
      {(activeDetailItem || cartDrawerOpen) && (
        <div className="modal-overlay" onClick={() => { setActiveDetailItem(null); setCartDrawerOpen(false); }} />
      )}

      {/* 8. DISH DETAIL BOTTOM SHEET */}
      {activeDetailItem && (
        <div className="detail-sheet">
          <img
            src={activeDetailItem.image_url || getFoodImageByName(activeDetailItem.name)}
            className="sheet-img"
            alt={activeDetailItem.name}
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop&q=80';
            }}
          />
          <div style={{ marginBottom: 8 }}>
            <span className={`dot ${activeDetailItem.is_veg ? 'veg' : 'nonveg'}`} style={{ display: 'inline-block', marginRight: 6 }} />
            <b style={{ fontSize: 12, color: 'var(--cream-dim)' }}>
              {activeDetailItem.is_veg ? 'Vegetarian' : 'Non-Vegetarian'}
            </b>
            &nbsp;·&nbsp;
            <span style={{ fontSize: 12, color: 'var(--gold)', fontWeight: 'bold' }}>{activeDetailItem.category_name || 'Cafe Special'}</span>
          </div>
          <div className="sheet-title">{activeDetailItem.name}</div>
          <div className="sheet-desc">
            {activeDetailItem.description || 'Freshly prepared with authentic Isha Cafe spices and quality ingredients. Served hot to your table.'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 }}>
            <div style={{ fontFamily: 'Roboto Mono', color: 'var(--gold)', fontWeight: 700, fontSize: 20 }}>
              ₹{activeDetailItem.price}
            </div>
            <button
              className="order-btn"
              style={{ margin: 0, width: 'auto', padding: '12px 24px' }}
              onClick={() => {
                addItem(activeDetailItem);
                triggerToast(`Added 1x ${activeDetailItem.name}`);
                setActiveDetailItem(null);
              }}
            >
              Add to Order +
            </button>
          </div>
        </div>
      )}

      {/* 9. CART SUMMARY DRAWER */}
      {cartDrawerOpen && (
        <div className="cart-drawer">
          <div className="drawer-header">
            <h3>Your Order Summary</h3>
            <button className="close-drawer" onClick={() => setCartDrawerOpen(false)}>✕</button>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {items.map((line) => (
              <div className="cart-item-row" key={`${line.menuItemId}-${line.notes}`}>
                <div>
                  <div style={{ fontWeight: 700 }}>{line.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--gold)' }}>{formatCurrency(line.price)}</div>
                </div>
                <div className="qty-btn-group">
                  <button onClick={() => decreaseQuantity(line.menuItemId, line.notes)}>−</button>
                  <span>{line.quantity}</span>
                  <button onClick={() => increaseQuantity(line.menuItemId, line.notes)}>+</button>
                </div>
              </div>
            ))}
            {items.length === 0 && (
              <div style={{ textAlign: 'center', padding: 20, color: 'var(--cream-dim)' }}>Your cart is empty.</div>
            )}
          </div>

          <div style={{ marginTop: 16, padding: '12px 0 0', borderTop: '1.5px solid var(--line)', fontSize: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, color: 'var(--cream-dim)' }}>
              <span>Subtotal</span>
              <span>{formatCurrency(cartSubtotalAmount)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 17, color: 'var(--cream)' }}>
              <span>Total Amount</span>
              <span style={{ color: 'var(--gold)' }}>{formatCurrency(cartSubtotalAmount)}</span>
            </div>
          </div>

          <button
            className="order-btn"
            disabled={items.length === 0 || isSubmitting}
            onClick={handlePlaceOrder}
          >
            {isSubmitting ? 'Submitting Order…' : '🔔 Confirm Order & Play Target Game!'}
          </button>
        </div>
      )}

      {/* 10. ORDER PLACED CONFIRMATION POPUP */}
      {placedOrder && (
        <div className="confirm-modal-overlay">
          <div className="confirm-card">
            <div style={{ fontSize: 48, marginBottom: 6, animation: 'bounceIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>🎉</div>
            <div style={{ background: 'var(--gold)', color: '#1a1205', fontFamily: 'Poppins', fontWeight: 900, fontSize: 20, padding: '6px 16px', borderRadius: 12, display: 'inline-block', marginBottom: 8, boxShadow: '0 4px 14px rgba(216,161,58,0.4)' }}>
              TOKEN #{placedOrder.tokenNumber}
            </div>
            <h2 style={{ fontFamily: 'Poppins', fontWeight: 800, fontSize: 20, color: 'var(--cream)', margin: '0 0 4px' }}>Order Confirmed!</h2>
            <div style={{ fontSize: 13, color: 'var(--gold)', fontWeight: 700, marginBottom: 8 }}>
              📍 Table {tableInfo?.table_number ?? 'Takeaway'}
            </div>
            <p style={{ fontSize: 12.5, color: 'var(--cream-dim)', lineHeight: 1.4, margin: '0 0 16px' }}>
              Your delicious order has been received &amp; sent directly to the cashier table! 🍳
            </p>

            <div style={{ background: 'rgba(216,161,58,0.12)', border: '1px dashed var(--gold)', borderRadius: 12, padding: 12, marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: 'var(--gold)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 3 }}>🎯 Win Discount on Bill</div>
              <div style={{ fontSize: 12, color: 'var(--cream)', lineHeight: 1.35 }}>Play our Target Shooter Game now while waiting to claim your <b>Bill Discount!</b></div>
            </div>

            <button className="order-btn" style={{ margin: 0 }} onClick={() => { setPlacedOrder(null); startMiniGame(); }}>
              🎯 Play Target Game for Discount!
            </button>
          </div>
        </div>
      )}

      {/* 11. TARGET SHOOTING MINI-GAME MODAL */}
      {gameActive && (
        <div className="game-modal-overlay">
          <div className="game-container">
            <div className="game-header-bar">
              <div className="game-score-box">🎯 Points: <span>{gameScore}</span></div>
              <div style={{ fontSize: 14, letterSpacing: 2 }}>
                {'❤️'.repeat(gameLives)}{'🖤'.repeat(Math.max(0, 3 - gameLives))}
              </div>
              <div className="game-timer-box">⏳ <span>{gameTimeLeft}</span>s</div>
            </div>

            <div className="game-arena" id="gameArenaBox">
              <div style={{ position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)', fontSize: 11, color: 'var(--gold)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, pointerEvents: 'none', whiteSpace: 'nowrap' }}>
                🔥 Target Game! Hit food, avoid bombs 💣
              </div>

              {/* Floating Target Elements */}
              {gameTargets.map((target) => (
                <div
                  key={target.id}
                  className={`target-item ${target.type === 'bomb' ? 'bomb-target' : ''} ${target.type === 'gold' ? 'gold-target' : ''}`}
                  style={{ left: target.x, top: target.y }}
                  onPointerDown={(e) => handleHitTarget(target, e)}
                >
                  {target.emoji}
                </div>
              ))}
            </div>

            {/* GAME OVER SCREEN */}
            {gameOver && (
              <div className="game-over-screen">
                <div style={{ fontSize: 44, marginBottom: 4 }}>
                  {gameLives <= 0 ? '💣' : gameScore >= 200 ? '👑' : '🎉'}
                </div>
                <h2 style={{ marginBottom: 2 }}>
                  {gameLives <= 0 ? 'KABOOM!' : gameScore >= 200 ? 'MAX SCORE REACHED!' : 'Game Over!'}
                </h2>
                <div style={{ fontFamily: 'Poppins', fontSize: 24, color: 'var(--gold)', fontWeight: 800, margin: '6px 0' }}>
                  Score: {gameScore} Pts
                </div>
                <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--gold)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
                  Rank: {gameLives <= 0 ? '💥 Blown Up' : gameScore >= 200 ? '🏆 Risk Legend' : '🔥 Risk Master'}
                </div>

                {(() => {
                  const tableNum = tableInfo?.table_number || table?.table_number || placedOrder?.table_number;
                  const isDineIn = (orderType === ORDER_TYPE.DINE_IN || !!tableNum) && tableNum;
                  return (
                    <div style={{
                      fontSize: 13.5,
                      color: '#1a1205',
                      background: 'var(--gold)',
                      fontWeight: 900,
                      margin: '4px 0 12px',
                      padding: '5px 16px',
                      borderRadius: 20,
                      display: 'inline-block',
                      letterSpacing: 0.5,
                      boxShadow: '0 2px 10px rgba(216,161,58,0.3)',
                      textTransform: 'uppercase'
                    }}>
                      {isDineIn ? `📍 Table ${tableNum}` : '🛍️ Takeaway'}
                    </div>
                  );
                })()}

                <div style={{ background: 'rgba(216,161,58,0.15)', border: '1.5px dashed var(--gold)', borderRadius: 12, padding: '12px 14px', marginBottom: 14, textAlign: 'center' }}>
                  <div style={{ fontFamily: 'Poppins', fontWeight: 800, fontSize: 13.5, color: 'var(--gold)', marginBottom: 4 }}>
                    📸 NEXT VISIT DISCOUNT!
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--cream)', lineHeight: 1.4 }}>
                    Take a screenshot of this score screen &amp; show it at the billing counter on your <b>Next Visit</b> to get a Special Discount! 🎁<br />
                    <span style={{ fontSize: 11, color: 'var(--gold)', fontWeight: 700 }}>(Valid ONLY on your next visit bill!)</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10, width: '100%' }}>
                  <button className="order-btn" style={{ flex: 1, margin: 0 }} onClick={startMiniGame}>
                    🎯 Play Again
                  </button>
                  <button
                    className="order-btn"
                    style={{ flex: 1, margin: 0, background: 'var(--bg-card)', border: '1.5px solid var(--line)', color: 'var(--cream)' }}
                    onClick={() => setGameActive(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Toast Notice */}
      {toastMsg && <div className="toast-msg">{toastMsg}</div>}

    </div>
  );
}
