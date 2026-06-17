const express = require('express');
const { runAsync, getAsync, allAsync } = require('../database/setup');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const router = express.Router();

async function nextInvoiceNumber() {
  // Invoice numbers reset per day: count today's orders + 1
  const today = new Date().toISOString().split('T')[0];
  const row = await getAsync("SELECT COUNT(*) as c FROM orders WHERE DATE(created_at)=?",[today]);
  return (row?.c || 0) + 1;
}
function fmtInv(n) { return '#' + String(n).padStart(4,'0'); }

// GET all
router.get('/', authenticateToken, async (req, res) => {
  const { status, order_type, date, table_id, date_from, date_to } = req.query;
  let q = `SELECT o.*,e.name as employee_name,t.number as table_number FROM orders o
    LEFT JOIN employees e ON o.employee_id=e.id LEFT JOIN tables t ON o.table_id=t.id WHERE 1=1`;
  const p = [];
  if (status)    { q += ' AND o.status=?';              p.push(status); }
  if (order_type){ q += ' AND o.order_type=?';          p.push(order_type); }
  if (date)      { q += ' AND DATE(o.created_at)=?';    p.push(date); }
  if (table_id)  { q += ' AND o.table_id=?';            p.push(table_id); }
  if (date_from) { q += ' AND DATE(o.created_at)>=?';   p.push(date_from); }
  if (date_to)   { q += ' AND DATE(o.created_at)<=?';   p.push(date_to); }
  q += ' ORDER BY o.created_at DESC';
  try { res.json(await allAsync(q,p)); } catch(e){ res.status(500).json({error:e.message}); }
});

// GET single
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const order = await getAsync(`SELECT o.*,e.name as employee_name,t.number as table_number
      FROM orders o LEFT JOIN employees e ON o.employee_id=e.id LEFT JOIN tables t ON o.table_id=t.id
      WHERE o.id=?`,[req.params.id]);
    if (!order) return res.status(404).json({error:'Not found'});
    const items = await allAsync(`SELECT oi.*,mi.name,mi.name as item_name,c.name as category_name
      FROM order_items oi JOIN menu_items mi ON oi.menu_item_id=mi.id
      LEFT JOIN categories c ON mi.category_id=c.id WHERE oi.order_id=?`,[req.params.id]);
    const persons = await allAsync('SELECT * FROM order_persons WHERE order_id=? ORDER BY id',[req.params.id]);
    res.json({...order,items,persons,invoice_formatted:fmtInv(order.invoice_number||order.id)});
  } catch(e){ res.status(500).json({error:e.message}); }
});

// POST create
router.post('/', authenticateToken, async (req, res) => {
  const { order_type, table_id, items, notes, discount, payment_method, persons } = req.body;
  if (!items?.length) return res.status(400).json({error:'No items'});
  try {
    // Check business day is open before allowing orders
    const today = new Date().toISOString().split('T')[0];
    const day = await getAsync("SELECT * FROM business_days WHERE date=? AND status='open'",[today]);
    if (!day) return res.status(400).json({error:'Business day is not open. Please open the day first.'});
    let subtotal=0;
    const oItems=[];
    for (const item of items) {
      const mi = await getAsync('SELECT * FROM menu_items WHERE id=?',[item.menu_item_id]);
      if (!mi) return res.status(400).json({error:`Item ${item.menu_item_id} not found`});
      const up = item.unit_price!=null ? item.unit_price : mi.price;
      subtotal += up*item.quantity;
      oItems.push({...item, unit_price:up, total_price:up*item.quantity});
    }
    const total = Math.max(0, subtotal - (discount||0));
    const inv = await nextInvoiceNumber();
    const pStatus = payment_method ? 'paid' : 'unpaid';
    const r = await runAsync(
      `INSERT INTO orders (order_type,table_id,employee_id,status,subtotal,discount,total,notes,invoice_number,payment_method,payment_status)
       VALUES (?,?,?,'pending',?,?,?,?,?,?,?)`,
      [order_type||'takeaway', table_id||null, req.user.id, subtotal, discount||0, total, notes||null, inv, payment_method||null, pStatus]
    );
    const oid = r.lastID;
    for (const item of oItems) {
      await runAsync('INSERT INTO order_items (order_id,menu_item_id,quantity,unit_price,total_price,notes,person_label) VALUES (?,?,?,?,?,?,?)',
        [oid,item.menu_item_id,item.quantity,item.unit_price,item.total_price,item.notes||null,item.person_label||null]);
    }
    // Create persons if provided
    if (persons?.length) {
      for (const p of persons) {
        await runAsync('INSERT INTO order_persons (order_id,label) VALUES (?,?)',[oid,p.label]);
      }
    }
    if (table_id && order_type==='dine-in') await runAsync("UPDATE tables SET status='occupied' WHERE id=?",[table_id]);
    res.status(201).json({id:oid, invoice_number:inv, invoice_formatted:fmtInv(inv), total, subtotal});
  } catch(e){ res.status(500).json({error:e.message}); }
});

// POST add items
router.post('/:id/items', authenticateToken, async (req, res) => {
  const { items } = req.body;
  if (!items?.length) return res.status(400).json({error:'No items'});
  try {
    const order = await getAsync('SELECT * FROM orders WHERE id=?',[req.params.id]);
    if (!order) return res.status(404).json({error:'Not found'});
    if (order.payment_status==='paid') return res.status(400).json({error:'Already paid'});
    let added=0;
    for (const item of items) {
      const mi = await getAsync('SELECT * FROM menu_items WHERE id=?',[item.menu_item_id]);
      if (!mi) continue;
      const up = item.unit_price!=null ? item.unit_price : mi.price;
      const tp = up*item.quantity;
      added += tp;
      await runAsync('INSERT INTO order_items (order_id,menu_item_id,quantity,unit_price,total_price,person_label) VALUES (?,?,?,?,?,?)',
        [req.params.id,item.menu_item_id,item.quantity,up,tp,item.person_label||null]);
    }
    await runAsync('UPDATE orders SET subtotal=subtotal+?,total=total+? WHERE id=?',[added,added,req.params.id]);
    const updated = await getAsync('SELECT * FROM orders WHERE id=?',[req.params.id]);
    res.json({message:'Items added',total:updated.total,subtotal:updated.subtotal});
  } catch(e){ res.status(500).json({error:e.message}); }
});

// POST add person
router.post('/:id/persons', authenticateToken, async (req, res) => {
  const { label } = req.body;
  if (!label) return res.status(400).json({error:'Label required'});
  try {
    const r = await runAsync('INSERT INTO order_persons (order_id,label) VALUES (?,?)',[req.params.id,label]);
    res.json({id:r.lastID,order_id:parseInt(req.params.id),label,paid:0,paid_amount:0});
  } catch(e){ res.status(500).json({error:e.message}); }
});

// PUT pay person share
router.put('/:id/persons/:pid/pay', authenticateToken, async (req, res) => {
  const { method } = req.body;
  try {
    const person = await getAsync('SELECT * FROM order_persons WHERE id=? AND order_id=?',[req.params.pid,req.params.id]);
    if (!person) return res.status(404).json({error:'Person not found'});
    if (person.paid) return res.status(400).json({error:'Already paid'});
    // Calculate this person's total from order_items where person_label matches
    const personItems = await allAsync('SELECT * FROM order_items WHERE order_id=? AND person_label=?',[req.params.id,person.label]);
    const personTotal = personItems.reduce((s,i)=>s+i.total_price,0);
    await runAsync("UPDATE order_persons SET paid=1,paid_amount=?,paid_method=?,paid_at=CURRENT_TIMESTAMP WHERE id=?",[personTotal,method,req.params.pid]);
    // Check if all persons paid
    const unpaid = await getAsync('SELECT COUNT(*) as c FROM order_persons WHERE order_id=? AND paid=0',[req.params.id]);
    const personCount = await getAsync('SELECT COUNT(*) as c FROM order_persons WHERE order_id=?',[req.params.id]);
    if (personCount.c > 0 && unpaid.c === 0) {
      await runAsync("UPDATE orders SET payment_status='paid',payment_method='split',status='completed',completed_at=CURRENT_TIMESTAMP WHERE id=?",[req.params.id]);
      const order = await getAsync('SELECT * FROM orders WHERE id=?',[req.params.id]);
      if (order.table_id) await runAsync("UPDATE tables SET status='available' WHERE id=?",[order.table_id]);
    }
    res.json({message:'Person paid',person_total:personTotal,person_label:person.label});
  } catch(e){ res.status(500).json({error:e.message}); }
});

// PUT status
// PUT mark as unpaid (for Orders page quick action)
router.put('/:id/mark-unpaid', authenticateToken, async (req, res) => {
  try {
    const order = await getAsync('SELECT * FROM orders WHERE id=?',[req.params.id]);
    if (!order) return res.status(404).json({error:'Not found'});
    if (order.payment_status!=='paid') return res.status(400).json({error:'Order is not paid'});
    await runAsync("UPDATE orders SET payment_method=null,payment_status='unpaid',completed_at=NULL WHERE id=?",[req.params.id]);
    if (order.table_id) {
      await runAsync("UPDATE tables SET status='occupied' WHERE id=?",[order.table_id]);
    }
    res.json({message:'Order marked as unpaid'});
  } catch(e){ res.status(500).json({error:e.message}); }
});

// PUT mark as paid (for Orders page quick action)
router.put('/:id/mark-paid', authenticateToken, async (req, res) => {
  try {
    const order = await getAsync('SELECT * FROM orders WHERE id=?',[req.params.id]);
    if (!order) return res.status(404).json({error:'Not found'});
    if (order.payment_status==='paid') return res.status(400).json({error:'Already paid'});
    const method = req.body.payment_method || 'cash';
    await runAsync("UPDATE orders SET payment_method=?,payment_status='paid',status='completed',completed_at=CURRENT_TIMESTAMP WHERE id=?",[method,req.params.id]);
    if (order.table_id) {
      const unpaid = await getAsync("SELECT COUNT(*) as c FROM orders WHERE table_id=? AND payment_status!='paid' AND id!=?",[order.table_id,req.params.id]);
      if (unpaid.c===0) await runAsync("UPDATE tables SET status='available' WHERE id=?",[order.table_id]);
    }
    res.json({message:'Order marked as paid'});
  } catch(e){ res.status(500).json({error:e.message}); }
});

router.put('/:id/status', authenticateToken, async (req, res) => {
  const { status } = req.body;
  if (!['pending','preparing','ready','completed','cancelled'].includes(status))
    return res.status(400).json({error:'Invalid status'});
  try {
    const order = await getAsync('SELECT * FROM orders WHERE id=?',[req.params.id]);
    if (!order) return res.status(404).json({error:'Not found'});
    if (status==='completed') await runAsync('UPDATE orders SET status=?,completed_at=CURRENT_TIMESTAMP WHERE id=?',[status,req.params.id]);
    else await runAsync('UPDATE orders SET status=? WHERE id=?',[status,req.params.id]);
    if (status==='completed' && order.table_id) {
      const active = await getAsync("SELECT COUNT(*) as c FROM orders WHERE table_id=? AND status NOT IN ('completed','cancelled') AND id!=?",[order.table_id,req.params.id]);
      if (active.c===0) await runAsync("UPDATE tables SET status='available' WHERE id=?",[order.table_id]);
    }
    res.json({message:'Status updated'});
  } catch(e){ res.status(500).json({error:e.message}); }
});

// PUT payment
router.put('/:id/payment', authenticateToken, async (req, res) => {
  const { payment_method } = req.body;
  if (!payment_method) return res.status(400).json({error:'Method required'});
  try {
    const order = await getAsync('SELECT * FROM orders WHERE id=?',[req.params.id]);
    if (!order) return res.status(404).json({error:'Not found'});
    await runAsync("UPDATE orders SET payment_method=?,payment_status='paid' WHERE id=?",[payment_method,req.params.id]);
    if (order.table_id) {
      const unpaid = await getAsync("SELECT COUNT(*) as c FROM orders WHERE table_id=? AND payment_status!='paid' AND id!=?",[order.table_id,req.params.id]);
      if (unpaid.c===0) await runAsync("UPDATE tables SET status='available' WHERE id=?",[order.table_id]);
    }
    const updated = await getAsync('SELECT * FROM orders WHERE id=?',[req.params.id]);
    res.json({message:'Payment recorded',invoice_formatted:fmtInv(updated.invoice_number||updated.id),total:updated.total});
  } catch(e){ res.status(500).json({error:e.message}); }
});

// DELETE
router.delete('/:id', authenticateToken, authorizeRoles('superadmin','admin','manager'), async (req, res) => {
  try {
    const order = await getAsync('SELECT * FROM orders WHERE id=?',[req.params.id]);
    if (order?.table_id) await runAsync("UPDATE tables SET status='available' WHERE id=?",[order.table_id]);
    await runAsync('DELETE FROM order_persons WHERE order_id=?',[req.params.id]);
    await runAsync('DELETE FROM order_items WHERE order_id=?',[req.params.id]);
    await runAsync('DELETE FROM orders WHERE id=?',[req.params.id]);
    res.json({message:'Deleted'});
  } catch(e){ res.status(500).json({error:e.message}); }
});

module.exports = router;
