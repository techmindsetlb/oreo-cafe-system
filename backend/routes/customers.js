const express = require('express');
const { runAsync, getAsync, allAsync } = require('../database/setup');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const { search } = req.query;
    let q = 'SELECT * FROM customers ORDER BY name';
    let p = [];
    if (search) {
      q = "SELECT * FROM customers WHERE name LIKE ? OR phone LIKE ? ORDER BY name";
      p = [`%${search}%`, `%${search}%`];
    }
    res.json(await allAsync(q, p));
  } catch(e){ res.status(500).json({error:e.message}); }
});

router.post('/', authenticateToken, async (req, res) => {
  const { name, phone, email, notes } = req.body;
  if (!name) return res.status(400).json({error:'Name required'});
  try {
    const r = await runAsync(
      'INSERT INTO customers (name,phone,email,notes) VALUES (?,?,?,?)',
      [name, phone||null, email||null, notes||null]
    );
    res.status(201).json({id:r.lastID, name, phone, email, notes});
  } catch(e){ res.status(500).json({error:e.message}); }
});

router.put('/:id', authenticateToken, async (req, res) => {
  const { name, phone, email, notes } = req.body;
  try {
    await runAsync(
      'UPDATE customers SET name=COALESCE(?,name),phone=COALESCE(?,phone),email=COALESCE(?,email),notes=COALESCE(?,notes) WHERE id=?',
      [name, phone, email, notes, req.params.id]
    );
    res.json({message:'Updated'});
  } catch(e){ res.status(500).json({error:e.message}); }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await runAsync('DELETE FROM customers WHERE id=?',[req.params.id]);
    res.json({message:'Deleted'});
  } catch(e){ res.status(500).json({error:e.message}); }
});

module.exports = router;
