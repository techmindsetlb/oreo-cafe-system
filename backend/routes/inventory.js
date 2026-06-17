const express = require('express');
const { runAsync, getAsync, allAsync } = require('../database/setup');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const inventory = await allAsync('SELECT * FROM inventory ORDER BY name');
    res.json(inventory);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/low', authenticateToken, async (req, res) => {
  try {
    const lowStock = await allAsync('SELECT * FROM inventory WHERE quantity <= min_quantity ORDER BY name');
    res.json(lowStock);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', authenticateToken, authorizeRoles('superadmin', 'admin', 'manager'), async (req, res) => {
  const { name, quantity, unit, min_quantity, cost_per_unit } = req.body;
  if (!name || quantity === undefined || !unit) return res.status(400).json({ error: 'Name, quantity, and unit required' });

  try {
    const result = await runAsync('INSERT INTO inventory (name, quantity, unit, min_quantity, cost_per_unit) VALUES (?, ?, ?, ?, ?)',
      [name, quantity, unit, min_quantity || 10, cost_per_unit || 0]);
    res.status(201).json({ id: result.lastID, name, quantity, unit });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', authenticateToken, authorizeRoles('superadmin', 'admin', 'manager'), async (req, res) => {
  const { name, quantity, unit, min_quantity, cost_per_unit } = req.body;
  try {
    await runAsync(`UPDATE inventory SET name = COALESCE(?, name), quantity = COALESCE(?, quantity),
      unit = COALESCE(?, unit), min_quantity = COALESCE(?, min_quantity),
      cost_per_unit = COALESCE(?, cost_per_unit), updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [name, quantity, unit, min_quantity, cost_per_unit, req.params.id]);
    res.json({ message: 'Inventory updated' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/:id/adjust', authenticateToken, async (req, res) => {
  const { adjustment } = req.body;
  if (adjustment === undefined) return res.status(400).json({ error: 'Adjustment value required' });

  try {
    const item = await getAsync('SELECT * FROM inventory WHERE id = ?', [req.params.id]);
    if (!item) return res.status(404).json({ error: 'Item not found' });

    const newQuantity = item.quantity + adjustment;
    if (newQuantity < 0) return res.status(400).json({ error: 'Insufficient stock' });

    await runAsync('UPDATE inventory SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [newQuantity, req.params.id]);
    res.json({ message: 'Stock adjusted', new_quantity: newQuantity });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', authenticateToken, authorizeRoles('superadmin', 'admin'), async (req, res) => {
  try {
    await runAsync('DELETE FROM inventory WHERE id = ?', [req.params.id]);
    res.json({ message: 'Inventory item deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
