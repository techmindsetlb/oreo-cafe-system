const express = require('express');
const { runAsync, getAsync, allAsync } = require('../database/setup');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try { res.json(await allAsync('SELECT * FROM tables ORDER BY type,number')); }
  catch(e){ res.status(500).json({error:e.message}); }
});

router.post('/', authenticateToken, authorizeRoles('admin','manager'), async (req, res) => {
  const { number, seats, section, type, hourly_rate } = req.body;
  if (!number) return res.status(400).json({error:'Number required'});
  try {
    const ex = await getAsync('SELECT id FROM tables WHERE number=?',[number]);
    if (ex) return res.status(400).json({error:'Table number already exists'});
    const r = await runAsync('INSERT INTO tables (number,seats,section,type,hourly_rate) VALUES (?,?,?,?,?)',
      [number,seats||4,section||'main',type||'table',hourly_rate||0]);
    res.status(201).json({id:r.lastID,number,seats:seats||4,section:section||'main',type:type||'table',hourly_rate:hourly_rate||0});
  } catch(e){ res.status(500).json({error:e.message}); }
});

router.put('/:id/status', authenticateToken, async (req, res) => {
  const { status } = req.body;
  if (!['available','occupied','reserved'].includes(status))
    return res.status(400).json({error:'Invalid status'});
  try { await runAsync('UPDATE tables SET status=? WHERE id=?',[status,req.params.id]); res.json({message:'Updated'}); }
  catch(e){ res.status(500).json({error:e.message}); }
});

router.put('/:id/reserve', authenticateToken, async (req, res) => {
  const { guest_name, guest_phone } = req.body;
  if (!guest_name) return res.status(400).json({error:'Name required'});
  try {
    const tb = await getAsync('SELECT * FROM tables WHERE id=?',[req.params.id]);
    if (!tb) return res.status(404).json({error:'Not found'});
    if (tb.status==='occupied') return res.status(400).json({error:'Table is occupied'});
    await runAsync("UPDATE tables SET status='reserved',reservation_name=?,reservation_phone=? WHERE id=?",
      [guest_name,guest_phone||null,req.params.id]);
    res.json({message:'Reserved',guest_name,guest_phone});
  } catch(e){ res.status(500).json({error:e.message}); }
});

router.put('/:id/cancel-reservation', authenticateToken, async (req, res) => {
  try {
    await runAsync("UPDATE tables SET status='available',reservation_name=NULL,reservation_phone=NULL WHERE id=?",[req.params.id]);
    res.json({message:'Cancelled'});
  } catch(e){ res.status(500).json({error:e.message}); }
});

router.post('/:id/start-session', authenticateToken, async (req, res) => {
  try {
    const tb = await getAsync('SELECT * FROM tables WHERE id=?',[req.params.id]);
    if (!tb) return res.status(404).json({error:'Not found'});
    if (tb.type==='table') return res.status(400).json({error:'Not a gaming station'});
    if (tb.status==='occupied') return res.status(400).json({error:'Already occupied'});
    const now = new Date().toISOString();
    await runAsync("UPDATE tables SET status='occupied',session_start=? WHERE id=?",[now,req.params.id]);
    res.json({message:'Session started',session_start:now,station:tb});
  } catch(e){ res.status(500).json({error:e.message}); }
});

// GET all active gaming sessions
router.get('/gaming-sessions/active', authenticateToken, async (req, res) => {
  try {
    const sessions = await allAsync("SELECT * FROM tables WHERE type!='table' AND status='occupied' AND session_start IS NOT NULL");
    res.json(sessions);
  } catch(e){ res.status(500).json({error:e.message}); }
});

// POST force-end ALL gaming sessions
router.post('/gaming-sessions/end-all', authenticateToken, authorizeRoles('admin','manager'), async (req, res) => {
  try {
    const active = await allAsync("SELECT * FROM tables WHERE type!='table' AND status='occupied' AND session_start IS NOT NULL");
    for (const tb of active) {
      await runAsync("UPDATE tables SET status='available',session_start=NULL WHERE id=?",[tb.id]);
    }
    res.json({message:`Ended ${active.length} gaming session(s)`, count:active.length});
  } catch(e){ res.status(500).json({error:e.message}); }
});

router.post('/:id/end-session', authenticateToken, async (req, res) => {
  try {
    const tb = await getAsync('SELECT * FROM tables WHERE id=?',[req.params.id]);
    if (!tb) return res.status(404).json({error:'Not found'});
    if (tb.type==='table') return res.status(400).json({error:'Not a gaming station'});
    if (tb.status!=='occupied'||!tb.session_start) return res.status(400).json({error:'No active session'});
    const elapsed = (Date.now()-new Date(tb.session_start).getTime())/(1000*60*60);
    const billable = tb.type==='babyfoot' ? 1 : Math.max(1,Math.ceil(elapsed));
    const charge = parseFloat((billable * tb.hourly_rate).toFixed(2));
    await runAsync("UPDATE tables SET status='available',session_start=NULL WHERE id=?",[req.params.id]);
    res.json({message:'Session ended',elapsed_hours:parseFloat(elapsed.toFixed(2)),charge,hourly_rate:tb.hourly_rate,
      type:tb.type,station_label:`${tb.type.charAt(0).toUpperCase()+tb.type.slice(1)} ${tb.number}`});
  } catch(e){ res.status(500).json({error:e.message}); }
});

// DELETE — nullify order references first to avoid FK constraint
router.delete('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    // Detach any orders referencing this table (set table_id to null)
    await runAsync('UPDATE orders SET table_id=NULL WHERE table_id=?',[req.params.id]);
    await runAsync('DELETE FROM tables WHERE id=?',[req.params.id]);
    res.json({message:'Deleted'});
  } catch(e){ res.status(500).json({error:e.message}); }
});

module.exports = router;
