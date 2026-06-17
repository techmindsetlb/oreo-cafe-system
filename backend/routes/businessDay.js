const express = require('express');
const { runAsync, getAsync, allAsync } = require('../database/setup');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const router = express.Router();

// Get local date string in YYYY-MM-DD (uses server local time)
function localDate() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth()+1).padStart(2,'0');
  const d = String(now.getDate()).padStart(2,'0');
  return `${y}-${m}-${d}`;
}

// Get full local datetime string — uses local time, not UTC
function localNow() {
  const now = new Date();
  const y = now.getFullYear();
  const M = String(now.getMonth()+1).padStart(2,'0');
  const d = String(now.getDate()).padStart(2,'0');
  const h = String(now.getHours()).padStart(2,'0');
  const m = String(now.getMinutes()).padStart(2,'0');
  const s = String(now.getSeconds()).padStart(2,'0');
  return `${y}-${M}-${d}T${h}:${m}:${s}.000Z`;  // Fake-Z to keep DB happy, but uses local time
}

router.get('/today', authenticateToken, async (req, res) => {
  const today = localDate();
  try {
    let day = await getAsync('SELECT * FROM business_days WHERE date=?',[today]);
    if (!day) {
      await runAsync('INSERT OR IGNORE INTO business_days (date,status) VALUES (?,?)',[today,'closed']);
      day = await getAsync('SELECT * FROM business_days WHERE date=?',[today]);
    }
    // Auto-close if open for more than 4 hours (14400 seconds) without manual close
    if (day && day.status === 'open' && day.opened_at) {
      const AUTO_CLOSE_HOURS = 4;
      const openedTime = new Date(day.opened_at).getTime();
      const nowTime = new Date(localNow()).getTime();
      const elapsedHours = (nowTime - openedTime) / (1000 * 60 * 60);
      if (elapsedHours >= AUTO_CLOSE_HOURS) {
        await runAsync("UPDATE business_days SET status='closed',closed_at=?,closing_cash=closing_cash,notes=COALESCE(notes||' ','')||'[Auto-closed after '+?+' hours]' WHERE date=?",[localNow(), Math.floor(elapsedHours), today]);
        day = await getAsync('SELECT * FROM business_days WHERE date=?',[today]);
      }
    }
    res.json(day);
  } catch(e){ res.status(500).json({error:e.message}); }
});

router.get('/', authenticateToken, authorizeRoles('superadmin','admin','manager','cashier'), async (req, res) => {
  try { res.json(await allAsync('SELECT * FROM business_days ORDER BY date DESC LIMIT 60')); }
  catch(e){ res.status(500).json({error:e.message}); }
});

router.post('/open', authenticateToken, authorizeRoles('superadmin','admin','manager','cashier'), async (req, res) => {
  const today = localDate();
  const { opening_cash, notes } = req.body;
  try {
    // ── Close any other open day first (prevents multiple open days) ──
    const otherOpen = await allAsync("SELECT * FROM business_days WHERE status='open' AND date!=?", [today]);
    for (const d of otherOpen) {
      const opening = parseFloat(d.opening_cash || 0);
      const revRow = await getAsync("SELECT COALESCE(SUM(total),0) as rev FROM orders WHERE DATE(created_at)=? AND payment_status='paid'", [d.date]);
      const revenue = parseFloat(revRow?.rev || 0);
      const closingCash = opening + revenue;
      await runAsync("UPDATE business_days SET status='closed', closed_at=?, closing_cash=?, notes=COALESCE(notes||' ','')||'[Auto-closed — new day opened]' WHERE id=?",
        [localNow(), closingCash, d.id]);
    }

    const existing = await getAsync('SELECT * FROM business_days WHERE date=?',[today]);
    if (existing && existing.status==='open')
      return res.status(400).json({error:'Day is already open'});
    const now = localNow();
    if (existing) {
      await runAsync("UPDATE business_days SET status='open',opened_at=?,opening_cash=?,notes=?,closed_at=NULL WHERE date=?",
        [now, opening_cash||0, notes||null, today]);
    } else {
      await runAsync('INSERT INTO business_days (date,opened_at,status,opening_cash,notes) VALUES (?,?,?,?,?)',
        [today, now, 'open', opening_cash||0, notes||null]);
    }
    
    // ── Cleanup: end all active gaming sessions ─────────────────────
    const activeGaming = await allAsync("SELECT * FROM tables WHERE type!='table' AND status='occupied' AND session_start IS NOT NULL");
    for (const tb of activeGaming) {
      await runAsync("UPDATE tables SET status='available',session_start=NULL WHERE id=?",[tb.id]);
    }
    
    // ── Cleanup: free all occupied tables ───────────────────────────
    await runAsync("UPDATE tables SET status='available' WHERE type='table' AND status='occupied'");
    
    // ── Cleanup: cancel any pending/unpaid orders from previous days ─
    const unpaidToCancel = await allAsync("SELECT id FROM orders WHERE DATE(created_at)<? AND payment_status!='paid' AND status!='cancelled'", [today]);
    for (const o of unpaidToCancel) {
      const orderItems = await allAsync('SELECT menu_item_id, quantity FROM order_items WHERE order_id=?', [o.id]);
      for (const oi of orderItems) {
        await runAsync('UPDATE menu_items SET stock_quantity = stock_quantity + ? WHERE id = ? AND track_stock = 1', [oi.quantity, oi.menu_item_id]);
      }
    }
    await runAsync("UPDATE orders SET status='cancelled',notes=COALESCE(notes||' ','')||'[Auto-cancelled - new day opened]' WHERE DATE(created_at)<? AND payment_status!='paid'",[today]);
    
    res.json({message:'Day opened — all sessions ended, tables freed, pending orders cancelled', date:today, opened_at:now,
      sessions_ended:activeGaming.length, opening_cash:opening_cash||0});
  } catch(e){ res.status(500).json({error:e.message}); }
});

router.get('/expected-cash', authenticateToken, async (req, res) => {
  const today = localDate();
  try {
    const day = await getAsync('SELECT * FROM business_days WHERE date=?',[today]);
    if (!day) return res.json({expected_cash:0,opening_cash:0,revenue:0,expenses:0});
    const opening = parseFloat(day.opening_cash||0);
    // Total revenue from paid orders today
    const revRow = await getAsync("SELECT COALESCE(SUM(total),0) as rev FROM orders WHERE DATE(created_at)=? AND payment_status='paid'",[today]);
    const revenue = parseFloat(revRow?.rev||0);
    // Total expenses recorded for today
    const todayExp = await allAsync('SELECT * FROM business_days WHERE date=?',[today]);
    // Expenses are stored in localStorage on frontend, so we return opening + revenue
    const expected = opening + revenue;
    res.json({expected_cash:parseFloat(expected.toFixed(2)),opening_cash:opening,revenue:parseFloat(revenue.toFixed(2))});
  } catch(e){ res.status(500).json({error:e.message}); }
});

router.post('/close', authenticateToken, authorizeRoles('superadmin','admin','manager','cashier'), async (req, res) => {
  const today = localDate();
  const { closing_cash, notes } = req.body;
  try {
    const day = await getAsync('SELECT * FROM business_days WHERE date=?',[today]);
    if (!day || day.status!=='open')
      return res.status(400).json({error:'No open day to close'});
    const now = localNow();
    await runAsync("UPDATE business_days SET status='closed',closed_at=?,closing_cash=?,notes=COALESCE(?,notes) WHERE date=?",
      [now, closing_cash||0, notes||null, today]);
    res.json({message:'Day closed', date:today, closed_at:now});
  } catch(e){ res.status(500).json({error:e.message}); }
});

module.exports = router;
