const express = require('express');
const { runAsync, getAsync, allAsync } = require('../database/setup');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const router = express.Router();

// GET all expenses (optionally filter by date range)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { from, to, category } = req.query;
    let sql = 'SELECT * FROM expenses';
    const params = [];
    const conditions = [];

    if (from) { conditions.push('date >= ?'); params.push(from); }
    if (to) { conditions.push('date <= ?'); params.push(to); }
    if (category) { conditions.push('category = ?'); params.push(category); }

    if (conditions.length) sql += ' WHERE ' + conditions.join(' AND ');
    sql += ' ORDER BY date DESC, created_at DESC';

    const expenses = await allAsync(sql, params);
    res.json(expenses);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET a single expense
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const exp = await getAsync('SELECT * FROM expenses WHERE id = ?', [req.params.id]);
    if (!exp) return res.status(404).json({ error: 'Expense not found' });
    res.json(exp);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST create a new expense
router.post('/', authenticateToken, async (req, res) => {
  const { category, amount, description, date } = req.body;
  if (!category || amount == null || !date)
    return res.status(400).json({ error: 'Category, amount, and date required' });

  try {
    const result = await runAsync(
      'INSERT INTO expenses (category, amount, description, date, employee_id) VALUES (?, ?, ?, ?, ?)',
      [category, parseFloat(amount), description || '', date, req.user.id]
    );
    const exp = await getAsync('SELECT * FROM expenses WHERE id = ?', [result.lastID]);
    res.status(201).json(exp);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST bulk import (for migrating localStorage data)
router.post('/bulk', authenticateToken, authorizeRoles('superadmin', 'admin', 'manager'), async (req, res) => {
  const { expenses } = req.body;
  if (!Array.isArray(expenses) || !expenses.length)
    return res.status(400).json({ error: 'Array of expenses required' });

  try {
    let imported = 0;
    for (const e of expenses) {
      await runAsync(
        'INSERT INTO expenses (category, amount, description, date, employee_id, created_at) VALUES (?, ?, ?, ?, ?, ?)',
        [e.category, parseFloat(e.amount), e.description || '', e.date, req.user.id, e.created_at || new Date().toISOString()]
      );
      imported++;
    }
    res.json({ message: `${imported} expenses imported` });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// PUT update an expense
router.put('/:id', authenticateToken, authorizeRoles('superadmin', 'admin', 'manager'), async (req, res) => {
  const { category, amount, description, date } = req.body;
  try {
    const existing = await getAsync('SELECT id FROM expenses WHERE id = ?', [req.params.id]);
    if (!existing) return res.status(404).json({ error: 'Expense not found' });

    await runAsync(
      `UPDATE expenses SET
        category = COALESCE(?, category),
        amount = COALESCE(?, amount),
        description = COALESCE(?, description),
        date = COALESCE(?, date)
       WHERE id = ?`,
      [category, amount != null ? parseFloat(amount) : null, description, date, req.params.id]
    );
    const exp = await getAsync('SELECT * FROM expenses WHERE id = ?', [req.params.id]);
    res.json(exp);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// DELETE an expense
router.delete('/:id', authenticateToken, authorizeRoles('superadmin', 'admin', 'manager'), async (req, res) => {
  try {
    const result = await runAsync('DELETE FROM expenses WHERE id = ?', [req.params.id]);
    if (result.changes === 0) return res.status(404).json({ error: 'Expense not found' });
    res.json({ message: 'Expense deleted' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
