const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db, runAsync, getAsync, allAsync } = require('../database/setup');
const { authenticateToken, authorizeRoles, JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

const VALID_ROLES = ['admin', 'manager', 'cashier', 'waiter', 'kitchen'];
// superadmin is excluded from VALID_ROLES so it cannot be assigned via the API

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'Email and password required' });

  try {
    const employee = await getAsync(
      'SELECT * FROM employees WHERE email = ? AND is_active = 1', [email]
    );
    if (!employee || !bcrypt.compareSync(password, employee.password))
      return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { id: employee.id, name: employee.name, email: employee.email, role: employee.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      employee: { id: employee.id, name: employee.name, email: employee.email, role: employee.role }
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/', authenticateToken, authorizeRoles('superadmin', 'admin', 'manager'), async (req, res) => {
  try {
    const employees = await allAsync(
      'SELECT id, name, email, role, phone, is_active, created_at FROM employees ORDER BY name'
    );
    res.json(employees);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', authenticateToken, authorizeRoles('superadmin', 'admin', 'manager'), async (req, res) => {
  const { name, email, password, role, phone } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ error: 'Name, email, and password required' });
  if (role && !VALID_ROLES.includes(role))
    return res.status(400).json({ error: `Invalid role. Valid roles: ${VALID_ROLES.join(', ')}` });

  try {
    const existing = await getAsync('SELECT id FROM employees WHERE email = ?', [email]);
    if (existing) return res.status(400).json({ error: 'Email already exists' });

    const hashedPassword = bcrypt.hashSync(password, 10);
    const result = await runAsync(
      'INSERT INTO employees (name, email, password, role, phone) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPassword, role || 'cashier', phone || null]
    );
    res.status(201).json({ id: result.lastID, name, email, role: role || 'cashier', phone });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', authenticateToken, authorizeRoles('superadmin', 'admin', 'manager'), async (req, res) => {
  const { name, email, role, phone, is_active } = req.body;
  const { id } = req.params;

  if (role && !VALID_ROLES.includes(role))
    return res.status(400).json({ error: `Invalid role. Valid roles: ${VALID_ROLES.join(', ')}` });

  // Prevent admin from changing their own role
  if (role && parseInt(id) === req.user.id)
    return res.status(400).json({ error: 'Cannot change your own role' });

  try {
    const employee = await getAsync('SELECT id, role FROM employees WHERE id = ?', [id]);
    if (!employee) return res.status(404).json({ error: 'Employee not found' });

    // Only superadmin can edit a superadmin account
    if (employee.role === 'superadmin' && req.user.role !== 'superadmin')
      return res.status(403).json({ error: 'Only superadmin can edit a superadmin account' });

    await runAsync(
      `UPDATE employees SET
        name = COALESCE(?, name), email = COALESCE(?, email),
        role = COALESCE(?, role), phone = COALESCE(?, phone),
        is_active = COALESCE(?, is_active)
       WHERE id = ?`,
      [name, email, role, phone, is_active, id]
    );
    res.json({ message: 'Employee updated' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', authenticateToken, authorizeRoles('superadmin'), async (req, res) => {
  // Prevent superadmin from deleting their own account
  if (parseInt(req.params.id) === req.user.id)
    return res.status(400).json({ error: 'Cannot delete your own account' });
  try {
    const result = await runAsync('DELETE FROM employees WHERE id = ?', [req.params.id]);
    if (result.changes === 0) return res.status(404).json({ error: 'Employee not found' });
    res.json({ message: 'Employee deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Password reset (superadmin only) ─────────────────────────────
router.post('/:id/reset-password', authenticateToken, authorizeRoles('superadmin'), async (req, res) => {
  const { password } = req.body;
  if (!password)
    return res.status(400).json({ error: 'New password is required' });
  if (password.length < 4)
    return res.status(400).json({ error: 'Password must be at least 4 characters' });

  try {
    const employee = await getAsync('SELECT id FROM employees WHERE id = ?', [req.params.id]);
    if (!employee) return res.status(404).json({ error: 'Employee not found' });

    const hashedPassword = bcrypt.hashSync(password, 10);
    await runAsync('UPDATE employees SET password = ? WHERE id = ?', [hashedPassword, req.params.id]);
    res.json({ message: 'Password reset successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
