const express = require('express');
const { getAsync, allAsync } = require('../database/setup');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const router = express.Router();

// ── helper: item sales for a date range ──────────────────────────────────────
async function itemSales(dateFrom, dateTo) {
  return allAsync(`
    SELECT mi.name, c.name as category, SUM(oi.quantity) as total_quantity,
           SUM(oi.total_price) as total_revenue
    FROM order_items oi
    JOIN menu_items mi ON oi.menu_item_id=mi.id
    LEFT JOIN categories c ON mi.category_id=c.id
    JOIN orders o ON oi.order_id=o.id
    WHERE DATE(o.created_at)>=? AND DATE(o.created_at)<=? AND o.status!='cancelled'
    GROUP BY oi.menu_item_id ORDER BY total_revenue DESC
  `, [dateFrom, dateTo]);
}

async function orderSummary(dateFrom, dateTo) {
  return getAsync(`
    SELECT COUNT(*) as total_orders, COALESCE(SUM(total),0) as total_revenue,
           COALESCE(SUM(subtotal),0) as subtotal, COALESCE(SUM(discount),0) as total_discounts,
           COUNT(CASE WHEN order_type='takeaway' THEN 1 END) as takeaway_orders,
           COUNT(CASE WHEN order_type='dine-in' THEN 1 END) as dinein_orders
    FROM orders WHERE DATE(created_at)>=? AND DATE(created_at)<=? AND status!='cancelled'
  `, [dateFrom, dateTo]);
}

async function dailyBreakdown(dateFrom, dateTo) {
  return allAsync(`
    SELECT DATE(created_at) as date, COUNT(*) as total_orders, COALESCE(SUM(total),0) as total_revenue
    FROM orders WHERE DATE(created_at)>=? AND DATE(created_at)<=? AND status!='cancelled'
    GROUP BY DATE(created_at) ORDER BY date
  `, [dateFrom, dateTo]);
}

// GET /daily?date=YYYY-MM-DD
router.get('/daily', authenticateToken, async (req, res) => {
  const date = req.query.date || new Date().toISOString().split('T')[0];
  try {
    const sales = await orderSummary(date, date);
    const items = await itemSales(date, date);
    const hourly = await allAsync(`
      SELECT strftime('%H',created_at) as hour, COUNT(*) as orders, SUM(total) as revenue
      FROM orders WHERE DATE(created_at)=? AND status!='cancelled'
      GROUP BY strftime('%H',created_at) ORDER BY hour
    `, [date]);
    res.json({ date, ...sales, popularItems: items, hourlySales: hourly, itemSales: items });
  } catch(e){ res.status(500).json({error:e.message}); }
});

// GET /range?from=YYYY-MM-DD&to=YYYY-MM-DD
router.get('/range', authenticateToken, async (req, res) => {
  const { from, to } = req.query;
  if (!from || !to) return res.status(400).json({error:'from and to required'});
  try {
    const summary = await orderSummary(from, to);
    const breakdown = await dailyBreakdown(from, to);
    const items = await itemSales(from, to);
    res.json({ period:'range', from, to, ...summary, dailyBreakdown: breakdown, itemSales: items });
  } catch(e){ res.status(500).json({error:e.message}); }
});

// GET /weekly
router.get('/weekly', authenticateToken, async (req, res) => {
  const to = new Date().toISOString().split('T')[0];
  const from = new Date(Date.now()-6*86400000).toISOString().split('T')[0];
  try {
    const summary = await orderSummary(from, to);
    const breakdown = await dailyBreakdown(from, to);
    const items = await itemSales(from, to);
    const totalRevenue = breakdown.reduce((s,d)=>s+d.total_revenue,0);
    const totalOrders  = breakdown.reduce((s,d)=>s+d.total_orders,0);
    res.json({ period:'weekly', from, to, totalRevenue, totalOrders, ...summary, dailyBreakdown: breakdown, itemSales: items });
  } catch(e){ res.status(500).json({error:e.message}); }
});

// GET /monthly?month=YYYY-MM (defaults to current month)
router.get('/monthly', authenticateToken, async (req, res) => {
  const month = req.query.month || new Date().toISOString().slice(0,7);
  const from = month + '-01';
  const lastDay = new Date(parseInt(month.split('-')[0]), parseInt(month.split('-')[1]), 0).getDate();
  const to = month + '-' + String(lastDay).padStart(2,'0');
  try {
    const summary = await orderSummary(from, to);
    const breakdown = await dailyBreakdown(from, to);
    const items = await itemSales(from, to);
    res.json({ period:'monthly', month, from, to, ...summary, total_revenue: summary.total_revenue,
               totalRevenue: summary.total_revenue, totalOrders: summary.total_orders,
               dailyBreakdown: breakdown, topItems: items, itemSales: items });
  } catch(e){ res.status(500).json({error:e.message}); }
});

// GET /net-profit?from=YYYY-MM-DD&to=YYYY-MM-DD
router.get('/net-profit', authenticateToken, async (req, res) => {
  const { from, to } = req.query;
  if (!from || !to) return res.status(400).json({ error: 'from and to are required' });
  try {
    const rows = await allAsync(`
      SELECT
        mi.id, mi.name, mi.cost as unit_cost,
        c.name as category,
        SUM(oi.quantity) as total_quantity,
        SUM(oi.total_price) as total_revenue,
        SUM(oi.quantity * COALESCE(mi.cost, 0)) as total_cost,
        SUM(oi.total_price) - SUM(oi.quantity * COALESCE(mi.cost, 0)) as net_profit
      FROM order_items oi
      JOIN menu_items mi ON oi.menu_item_id = mi.id
      LEFT JOIN categories c ON mi.category_id = c.id
      JOIN orders o ON oi.order_id = o.id
      WHERE DATE(o.created_at) >= ? AND DATE(o.created_at) <= ? AND o.status != 'cancelled'
      GROUP BY oi.menu_item_id
      ORDER BY net_profit DESC
    `, [from, to]);

    const summary = await getAsync(`
      SELECT
        COALESCE(SUM(oi.total_price), 0) as total_revenue,
        COALESCE(SUM(oi.quantity * COALESCE(mi.cost, 0)), 0) as total_cost,
        COALESCE(SUM(oi.total_price), 0) - COALESCE(SUM(oi.quantity * COALESCE(mi.cost, 0)), 0) as total_net_profit
      FROM order_items oi
      JOIN menu_items mi ON oi.menu_item_id = mi.id
      JOIN orders o ON oi.order_id = o.id
      WHERE DATE(o.created_at) >= ? AND DATE(o.created_at) <= ? AND o.status != 'cancelled'
    `, [from, to]);

    res.json({ from, to, ...summary, items: rows });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /employee
router.get('/employee', authenticateToken, authorizeRoles('superadmin','admin','manager'), async (req, res) => {
  try {
    const rows = await allAsync(`
      SELECT e.id,e.name,e.role,COUNT(o.id) as total_orders,COALESCE(SUM(o.total),0) as total_sales
      FROM employees e LEFT JOIN orders o ON e.id=o.employee_id AND o.status!='cancelled'
      GROUP BY e.id ORDER BY total_sales DESC`);
    res.json(rows);
  } catch(e){ res.status(500).json({error:e.message}); }
});

module.exports = router;
