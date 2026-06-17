const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { initializeDatabase, getAsync, allAsync, runAsync } = require('./database/setup');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '5mb' }));  // Allow large QR image uploads

app.use('/api/employees',    require('./routes/employees'));
app.use('/api/menu',         require('./routes/menu'));
app.use('/api/inventory',    require('./routes/inventory'));
app.use('/api/tables',       require('./routes/tables'));
app.use('/api/orders',       require('./routes/orders'));
app.use('/api/reports',      require('./routes/reports'));
app.use('/api/settings',     require('./routes/settings'));
app.use('/api/business-day', require('./routes/businessDay'));
app.use('/api/customers',     require('./routes/customers'));
app.use('/api/expenses',      require('./routes/expenses'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Serve built frontend (production mode, no dev server needed) ──
const frontendBuild = path.join(__dirname, '..', 'frontend', 'build');
if (fs.existsSync(frontendBuild)) {
  app.use(express.static(frontendBuild));
  // Return JSON 404 for unmatched API routes
  app.get('/api/*', (req, res) => {
    res.status(404).json({ error: 'API endpoint not found' });
  });
  // Catch-all for client-side routing (React Router)
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendBuild, 'index.html'));
  });
  console.log('✓ Serving built frontend from ' + frontendBuild);
} else {
  console.log('⚠ Frontend build not found — run "cd frontend && npm run build"');
}

// ── Auto-close previous business days at 3 AM ──────────────────────
// Runs every 15 minutes. If it's past 3 AM local time, any business day
// from a previous date that's still "open" will be auto-closed.
function startAutoCloseScheduler() {
  const CHECK_INTERVAL_MS = 15 * 60 * 1000; // 15 minutes
  function localHour() {
    const now = new Date();
    return now.getHours();
  }
  function localDateStr() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth()+1).padStart(2,'0');
    const d = String(now.getDate()).padStart(2,'0');
    return `${y}-${m}-${d}`;
  }
  async function autoClose() {
    try {
      const hour = localHour();
      // Only auto-close after 3 AM. No upper bound — if server restarts at noon
      // this will still catch up and close any previous days that were missed.
      if (hour < 3) return;

      const today = localDateStr();
      const openDays = await allAsync("SELECT * FROM business_days WHERE status='open' AND date<?", [today]);
      if (!openDays.length) return;

      for (const day of openDays) {
        // Calculate expected closing cash = opening_cash + revenue from paid orders on that day
        const opening = parseFloat(day.opening_cash || 0);
        const revRow = await getAsync("SELECT COALESCE(SUM(total),0) as rev FROM orders WHERE DATE(created_at)=? AND payment_status='paid'", [day.date]);
        const revenue = parseFloat(revRow?.rev || 0);
        const closingCash = opening + revenue;

        const now = new Date();
        const closedAt = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}T${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}.000Z`;
        const note = `[Auto-closed at 3AM — $${closingCash.toFixed(2)}]`;

        await runAsync(
          "UPDATE business_days SET status='closed', closed_at=?, closing_cash=?, notes=COALESCE(notes||' ','')||? WHERE id=?",
          [closedAt, closingCash, note, day.id]
        );
        console.log(`Auto-closed business day ${day.date} (opening: $${opening}, closing: $${closingCash.toFixed(2)})`);
      }

      // ── Cleanup: end all active gaming sessions ───────────────────
      const activeGaming = await allAsync("SELECT * FROM tables WHERE type!='table' AND status='occupied' AND session_start IS NOT NULL");
      for (const tb of activeGaming) {
        await runAsync("UPDATE tables SET status='available',session_start=NULL WHERE id=?",[tb.id]);
      }

      // ── Cleanup: free all occupied tables ─────────────────────────
      await runAsync("UPDATE tables SET status='available' WHERE type='table' AND status='occupied'");

      // ── Cleanup: cancel unpaid orders from previous days ──────────
      const unpaidToCancel = await allAsync("SELECT id FROM orders WHERE DATE(created_at)<? AND payment_status!='paid' AND status!='cancelled'", [today]);
      for (const o of unpaidToCancel) {
        // Restore stock for each order before cancelling
        const orderItems = await allAsync('SELECT menu_item_id, quantity FROM order_items WHERE order_id=?', [o.id]);
        for (const oi of orderItems) {
          await runAsync('UPDATE menu_items SET stock_quantity = stock_quantity + ? WHERE id = ? AND track_stock = 1', [oi.quantity, oi.menu_item_id]);
        }
      }
      await runAsync("UPDATE orders SET status='cancelled',notes=COALESCE(notes||' ','')||'[Auto-cancelled - day auto-closed]' WHERE DATE(created_at)<? AND payment_status!='paid'",[today]);

      if (activeGaming.length > 0) {
        console.log(`Auto-closed ${activeGaming.length} gaming session(s)`);
      }
    } catch(e) {
      console.error('Auto-close scheduler error:', e.message);
    }
  }
  // Run immediately on start, then every 15 min
  autoClose();
  setInterval(autoClose, CHECK_INTERVAL_MS);
  console.log('✓ Auto-close scheduler started (checks every 15 min, runs after 3 AM)');
}

// ── Automatic database backup ─────────────────────────────────────
const { runBackup, listBackups } = require('./backup');

function startBackupScheduler() {
  const CHECK_INTERVAL_MS = 15 * 60 * 1000; // 15 minutes
  async function backupCheck() {
    try {
      const hour = new Date().getHours();
      if (hour !== 4) return;
      const todayStr = new Date().toISOString().split('T')[0];
      const existing = listBackups().filter(b => b.name.includes(todayStr));
      if (existing.length > 0) return;
      const bp = await runBackup();
      console.log(`✓ Backup created: ${path.basename(bp)}`);
    } catch (e) { console.error('Backup scheduler error:', e.message); }
  }
  backupCheck();
  setInterval(backupCheck, CHECK_INTERVAL_MS);
  console.log('✓ Backup scheduler started (daily at 4 AM, keeps last 30 backups)');
}

initializeDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Cafe Manager v4 running on http://localhost:${PORT}`);
  });
  startAutoCloseScheduler();
  startBackupScheduler();
}).catch(err => {
  console.error('DB init failed:', err);
  process.exit(1);
});
