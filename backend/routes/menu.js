const express = require('express');
const { db, runAsync, getAsync, allAsync } = require('../database/setup');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

router.get('/categories', async (req, res) => {
  try {
    const categories = await allAsync('SELECT * FROM categories ORDER BY sort_order');
    res.json(categories);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/categories', authenticateToken, authorizeRoles('superadmin', 'admin', 'manager'), async (req, res) => {
  const { name, description, sort_order, icon } = req.body;
  if (!name) return res.status(400).json({ error: 'Category name required' });

  try {
    const result = await runAsync('INSERT INTO categories (name, description, sort_order, icon) VALUES (?, ?, ?, ?)', [name, description || null, sort_order || 0, icon || null]);
    res.status(201).json({ id: result.lastID, name, description, sort_order, icon });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/categories/:id', authenticateToken, authorizeRoles('superadmin', 'admin', 'manager'), async (req, res) => {
  const { name, description, sort_order, icon } = req.body;
  try {
    await runAsync('UPDATE categories SET name = COALESCE(?, name), description = COALESCE(?, description), sort_order = COALESCE(?, sort_order), icon = COALESCE(?, icon) WHERE id = ?', [name, description, sort_order, icon, req.params.id]);
    res.json({ message: 'Category updated' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/categories/:id', authenticateToken, authorizeRoles('superadmin', 'admin', 'manager'), async (req, res) => {
  try {
    await runAsync('DELETE FROM categories WHERE id = ?', [req.params.id]);
    res.json({ message: 'Category deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/items', async (req, res) => {
  try {
    const items = await allAsync(`
      SELECT mi.*, c.name as category_name
      FROM menu_items mi LEFT JOIN categories c ON mi.category_id = c.id
      ORDER BY c.sort_order, mi.name
    `);
    res.json(items);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/items/:id', async (req, res) => {
  try {
    const item = await getAsync(`
      SELECT mi.*, c.name as category_name
      FROM menu_items mi LEFT JOIN categories c ON mi.category_id = c.id
      WHERE mi.id = ?
    `, [req.params.id]);

    if (!item) return res.status(404).json({ error: 'Item not found' });

    const recipe = await allAsync(`
      SELECT mi.*, i.name as inventory_name, i.unit as inventory_unit
      FROM menu_inventory mi JOIN inventory i ON mi.inventory_item_id = i.id
      WHERE mi.menu_item_id = ?
    `, [req.params.id]);

    res.json({ ...item, recipe });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/items', authenticateToken, authorizeRoles('superadmin', 'admin', 'manager'), async (req, res) => {
  const { name, description, price, category_id, image, preparation_time, recipe } = req.body;
  if (!name || price === undefined) return res.status(400).json({ error: 'Name and price required' });

  try {
    const result = await runAsync(
      'INSERT INTO menu_items (name, description, price, category_id, image, preparation_time) VALUES (?, ?, ?, ?, ?, ?)',
      [name, description || null, price, category_id || null, image || null, preparation_time || 5]
    );

    const itemId = result.lastID;
    if (recipe && recipe.length > 0) {
      for (const item of recipe) {
        await runAsync('INSERT INTO menu_inventory (menu_item_id, inventory_item_id, quantity_needed) VALUES (?, ?, ?)', [itemId, item.inventory_item_id, item.quantity_needed]);
      }
    }

    res.status(201).json({ id: itemId, name, price });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/items/:id', authenticateToken, authorizeRoles('superadmin', 'admin', 'manager'), async (req, res) => {
  const { name, description, price, category_id, image, is_available, preparation_time, recipe } = req.body;
  try {
    await runAsync(`
      UPDATE menu_items SET name = COALESCE(?, name), description = COALESCE(?, description),
      price = COALESCE(?, price), category_id = COALESCE(?, category_id), image = COALESCE(?, image),
      is_available = COALESCE(?, is_available), preparation_time = COALESCE(?, preparation_time) WHERE id = ?
    `, [name, description, price, category_id, image, is_available, preparation_time, req.params.id]);

    if (recipe) {
      await runAsync('DELETE FROM menu_inventory WHERE menu_item_id = ?', [req.params.id]);
      for (const item of recipe) {
        await runAsync('INSERT INTO menu_inventory (menu_item_id, inventory_item_id, quantity_needed) VALUES (?, ?, ?)', [req.params.id, item.inventory_item_id, item.quantity_needed]);
      }
    }

    res.json({ message: 'Item updated' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/items/:id', authenticateToken, authorizeRoles('superadmin', 'admin', 'manager'), async (req, res) => {
  try {
    await runAsync('DELETE FROM menu_inventory WHERE menu_item_id = ?', [req.params.id]);
    await runAsync('DELETE FROM order_items WHERE menu_item_id = ?', [req.params.id]);
    const result = await runAsync('DELETE FROM menu_items WHERE id = ?', [req.params.id]);
    if (result.changes === 0) return res.status(404).json({ error: 'Item not found' });
    res.json({ message: 'Item deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
