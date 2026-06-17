import React, { useState, useEffect, useRef } from 'react';
import { menuAPI, ordersAPI, tablesAPI } from '../services/api';

// Icon mapping for categories
const CATEGORY_ICONS = {
  'Hot Drinks': 'fa-mug-hot',
  'Cold Drinks': 'fa-glass-water',
  'Snacks': 'fa-cookie-bite',
  'Entertainment': 'fa-gamepad',
};

// Icon + label mapping for station types
const STATION_INFO = {
  playstation: { icon: 'fa-gamepad', label: 'Playstation' },
  pc: { icon: 'fa-desktop', label: 'PC' },
  billiards: { icon: 'fa-circle', label: 'Billiards' },
  babyfoot: { icon: 'fa-futbol', label: 'Babyfoot' },
};

function POSPage() {
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [allTables, setAllTables] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [cart, setCart] = useState([]);
  const [orderType, setOrderType] = useState('takeaway');
  const [selectedTable, setSelectedTable] = useState('');
  const [notes, setNotes] = useState('');
  const [discount, setDiscount] = useState(0);
  const [showPayment, setShowPayment] = useState(false);
  const [loading, setLoading] = useState(false);
  // Session state
  const [activeSession, setActiveSession] = useState(null); // { tableId, type, sessionStart, hourlyRate }
  const [sessionElapsed, setSessionElapsed] = useState('00:00:00');
  const timerRef = useRef(null);

  useEffect(() => {
    loadData();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const loadData = async () => {
    try {
      const [catRes, itemsRes, tablesRes] = await Promise.all([
        menuAPI.getCategories(),
        menuAPI.getItems(),
        tablesAPI.getAll()
      ]);
      setCategories(catRes.data);
      setMenuItems(itemsRes.data);
      setAllTables(tablesRes.data);
    } catch (err) {
      console.error('Failed to load data:', err);
    }
  };

  // Timer helper
  const startTimer = (sessionStart) => {
    if (timerRef.current) clearInterval(timerRef.current);
    const start = new Date(sessionStart);
    const tick = () => {
      const diff = Math.floor((Date.now() - start.getTime()) / 1000);
      const h = String(Math.floor(diff / 3600)).padStart(2, '0');
      const m = String(Math.floor((diff % 3600) / 60)).padStart(2, '0');
      const s = String(diff % 60).padStart(2, '0');
      setSessionElapsed(`${h}:${m}:${s}`);
    };
    tick();
    timerRef.current = setInterval(tick, 1000);
  };

  const filteredItems = selectedCategory
    ? menuItems.filter(item => item.category_id === selectedCategory && item.is_available)
    : [];

  const addToCart = (item) => {
    const existing = cart.find(c => c.menu_item_id === item.id);
    if (existing) {
      setCart(cart.map(c => c.menu_item_id === item.id ? { ...c, quantity: c.quantity + 1 } : c));
    } else {
      setCart([...cart, { menu_item_id: item.id, name: item.name, price: item.price, quantity: 1 }]);
    }
  };

  const updateQuantity = (menuItemId, delta) => {
    setCart(cart.map(item => {
      if (item.menu_item_id === menuItemId) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : null;
      }
      return item;
    }).filter(Boolean));
  };

  const clearCart = () => {
    setCart([]);
    setDiscount(0);
    setNotes('');
    setSelectedTable('');
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax - discount;

  // Session management
  const handleStartSession = async (table) => {
    try {
      const res = await tablesAPI.startSession(table.id);
      setActiveSession({
        tableId: table.id,
        type: table.type,
        sessionStart: res.data.session_start,
        hourlyRate: table.hourly_rate,
        number: table.number,
      });
      startTimer(res.data.session_start);
      await loadData(); // Refresh tables
    } catch (err) {
      alert('Failed to start session: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleEndSession = async () => {
    if (!activeSession) return null;
    try {
      const res = await tablesAPI.endSession(activeSession.tableId);
      if (timerRef.current) clearInterval(timerRef.current);

      // Find the entertainment menu item to link to this charge
      const entCategory = categories.find(c => c.name === 'Entertainment');
      const stationLabel = STATION_INFO[activeSession.type]?.label || activeSession.type;
      const entItem = menuItems.find(i =>
        i.category_id === entCategory?.id &&
        i.name.toLowerCase().includes(stationLabel.toLowerCase().split(' ')[0])
      );

      const sessionCharge = {
        menu_item_id: entItem?.id || menuItems[0]?.id,
        name: `${stationLabel} #${activeSession.number} (${res.data.elapsed_hours}h)`,
        price: res.data.charge,
        quantity: 1,
        isSessionCharge: true,
      };

      setActiveSession(null);
      setSessionElapsed('00:00:00');
      await loadData();
      return sessionCharge;
    } catch (err) {
      alert('Failed to end session: ' + (err.response?.data?.error || err.message));
      return null;
    }
  };

  // Resume a running session when selecting an occupied station
  const handleSelectOccupiedStation = (table) => {
    setActiveSession({
      tableId: table.id,
      type: table.type,
      sessionStart: table.session_start,
      hourlyRate: table.hourly_rate,
      number: table.number,
    });
    startTimer(table.session_start);
  };

  const handleOrder = async (paymentMethod) => {
    if (cart.length === 0 && !activeSession) return;

    setLoading(true);
    try {
      let finalCart = [...cart];

      // If there's an active session, end it and add the charge
      if (activeSession) {
        const sessionCharge = await handleEndSession();
        if (sessionCharge) {
          finalCart.push(sessionCharge);
        }
      }

      if (finalCart.length === 0) {
        alert('No items to charge');
        setLoading(false);
        return;
      }

      const orderData = {
        order_type: orderType,
        table_id: orderType === 'dine-in' ? selectedTable : null,
        items: finalCart.map(item => ({
          menu_item_id: item.menu_item_id,
          quantity: item.quantity,
          ...(item.isSessionCharge ? { unit_price: item.price } : {}),
        })),
        notes,
        discount
      };

      const orderRes = await ordersAPI.create(orderData);
      await ordersAPI.processPayment(orderRes.data.id, paymentMethod);
      await ordersAPI.updateStatus(orderRes.data.id, 'completed');

      alert(`Order #${orderRes.data.id} completed! Total: $${orderRes.data.total.toFixed(2)}`);
      clearCart();
      setShowPayment(false);
      loadData();
    } catch (err) {
      alert('Failed to create order: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Separate stations by type for the table selector
  const diningTables = allTables.filter(t => t.type === 'table' && t.status === 'available');
  const gamingStations = allTables.filter(t => t.type !== 'table');

  return (
    <div className="pos-page">
      <div className="pos-menu-section">
        <div className="pos-header">
          <h2>
            {selectedCategory
              ? <><button className="btn-back" onClick={() => setSelectedCategory(null)}><i className="fa-solid fa-arrow-left"></i></button> {categories.find(c => c.id === selectedCategory)?.name}</>
              : 'Menu'}
          </h2>
          <div className="order-type-toggle">
            <button className={orderType === 'takeaway' ? 'active' : ''} onClick={() => setOrderType('takeaway')}>
              <i className="fa-solid fa-bag-shopping"></i> Takeaway
            </button>
            <button className={orderType === 'dine-in' ? 'active' : ''} onClick={() => setOrderType('dine-in')}>
              <i className="fa-solid fa-chair"></i> Dine-In
            </button>
          </div>
        </div>

        {/* Category-first grid or items grid */}
        {!selectedCategory ? (
          <div className="category-select-grid">
            {categories.map(cat => (
              <div
                key={cat.id}
                className="category-select-card"
                onClick={() => setSelectedCategory(cat.id)}
              >
                <div className="category-select-icon">
                  <i className={`fa-solid ${CATEGORY_ICONS[cat.name] || 'fa-utensils'}`}></i>
                </div>
                <div className="category-select-name">{cat.name}</div>
                <div className="category-select-count">
                  {menuItems.filter(i => i.category_id === cat.id && i.is_available).length} items
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="menu-grid">
            {filteredItems.map(item => (
              <div key={item.id} className="menu-item-card" onClick={() => addToCart(item)}>
                <div className="item-name">{item.name}</div>
                <div className="item-price">${item.price.toFixed(2)}</div>
                {item.preparation_time > 0 && (
                  <div className="item-time">
                    <i className="fa-regular fa-clock"></i> {item.preparation_time} min
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Gaming Stations Section */}
        <div className="gaming-stations-section">
          <h3><i className="fa-solid fa-gamepad"></i> Gaming Stations</h3>
          <div className="gaming-stations-grid">
            {gamingStations.map(station => {
              const info = STATION_INFO[station.type] || { icon: 'fa-question', label: station.type };
              const isOccupied = station.status === 'occupied';
              const isActiveHere = activeSession?.tableId === station.id;

              return (
                <div
                  key={station.id}
                  className={`gaming-station-card ${isOccupied ? 'occupied' : 'available'} ${isActiveHere ? 'active-session' : ''}`}
                >
                  <div className="station-icon">
                    <i className={`fa-solid ${info.icon}`}></i>
                  </div>
                  <div className="station-name">{info.label} #{station.number}</div>
                  <div className="station-rate">
                    {station.type === 'babyfoot' ? `$${station.hourly_rate.toFixed(2)}/session` : `$${station.hourly_rate.toFixed(2)}/hr`}
                  </div>
                  <div className={`station-status ${station.status}`}>
                    {isActiveHere ? sessionElapsed : station.status}
                  </div>

                  {!isOccupied && (
                    <button className="btn btn-primary btn-sm" onClick={() => handleStartSession(station)}>
                      <i className="fa-solid fa-play"></i> Start
                    </button>
                  )}
                  {isOccupied && !isActiveHere && (
                    <button className="btn btn-secondary btn-sm" onClick={() => handleSelectOccupiedStation(station)}>
                      <i className="fa-solid fa-eye"></i> View
                    </button>
                  )}
                  {isActiveHere && (
                    <button className="btn btn-danger btn-sm" onClick={async () => {
                      const charge = await handleEndSession();
                      if (charge) {
                        setCart(prev => [...prev, charge]);
                      }
                    }}>
                      <i className="fa-solid fa-stop"></i> End & Bill
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="pos-cart-section">
        <h2>Current Order</h2>

        {orderType === 'dine-in' && (
          <div className="form-group">
            <label><i className="fa-solid fa-chair"></i> Select Table</label>
            <select value={selectedTable} onChange={(e) => setSelectedTable(e.target.value)}>
              <option value="">Select table</option>
              {diningTables.map(t => (
                <option key={t.id} value={t.id}>Table {t.number} ({t.seats} seats)</option>
              ))}
            </select>
          </div>
        )}

        <div className="cart-items">
          {cart.length === 0 ? (
            <div className="empty-cart">
              <i className="fa-solid fa-basket-shopping fa-2x" style={{ marginBottom: '1rem', display: 'block', opacity: 0.5 }}></i>
              No items in cart
            </div>
          ) : (
            cart.map((item, idx) => (
              <div key={`${item.menu_item_id}-${idx}`} className={`cart-item ${item.isSessionCharge ? 'session-charge' : ''}`}>
                <span className="cart-item-name">
                  {item.isSessionCharge && <i className="fa-solid fa-gamepad" style={{ marginRight: '6px', color: 'var(--accent)' }}></i>}
                  {item.name}
                </span>
                {!item.isSessionCharge ? (
                  <div className="cart-item-controls">
                    <button onClick={() => updateQuantity(item.menu_item_id, -1)}>-</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.menu_item_id, 1)}>+</button>
                  </div>
                ) : (
                  <div className="cart-item-controls"><span style={{ opacity: 0.6, fontSize: '0.8rem' }}>session</span></div>
                )}
                <span className="cart-item-price">${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))
          )}
        </div>

        <div className="cart-summary">
          <div className="summary-row"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
          <div className="summary-row"><span>Tax (10%)</span><span>${tax.toFixed(2)}</span></div>
          <div className="summary-row discount">
            <span>Discount ($)</span>
            <input type="number" value={discount} onChange={(e) => setDiscount(Number(e.target.value))} min="0" step="0.5" />
          </div>
          <div className="summary-row total"><span>Total</span><span>${total.toFixed(2)}</span></div>
        </div>

        <div className="form-group">
          <label><i className="fa-solid fa-pen-to-square"></i> Order Notes</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add cooking instructions..." />
        </div>

        <div className="cart-actions">
          <button className="btn btn-secondary" onClick={clearCart}>
            <i className="fa-solid fa-trash-can"></i> Clear
          </button>
          <button className="btn btn-primary" onClick={() => setShowPayment(true)} disabled={(cart.length === 0 && !activeSession) || loading}>
            <i className="fa-solid fa-credit-card"></i> Pay ${total.toFixed(2)}
          </button>
        </div>

        {showPayment && (
          <div className="payment-modal">
            <h3>Select Payment Method</h3>
            <div className="payment-methods">
              <button onClick={() => handleOrder('cash')} disabled={loading}>
                <i className="fa-solid fa-money-bill-wave"></i> Cash
              </button>
              <button onClick={() => handleOrder('card')} disabled={loading}>
                <i className="fa-solid fa-credit-card"></i> Card
              </button>
              <button onClick={() => handleOrder('mobile')} disabled={loading}>
                <i className="fa-solid fa-mobile-screen-button"></i> Mobile
              </button>
            </div>
            <button className="btn btn-secondary btn-full" onClick={() => setShowPayment(false)}>
              <i className="fa-solid fa-xmark"></i> Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default POSPage;
