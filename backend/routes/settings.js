const express = require('express');
const path = require('path');
const { runAsync, getAsync } = require('../database/setup');
const { authenticateToken, authorizeRoles, JWT_SECRET } = require('../middleware/auth');
const { runBackup, listBackups, restoreBackup } = require('../backup');
const router = express.Router();

// ── Manual backup ─────────────────────────────────────────────────
router.post('/backup', authenticateToken, authorizeRoles('superadmin', 'admin','manager'), async (req, res) => {
  try {
    const bp = await runBackup();
    res.json({message:'Backup created', file:path.basename(bp)});
  } catch(e){ res.status(500).json({error:e.message}); }
});

router.post('/backup/restore', authenticateToken, authorizeRoles('superadmin', 'admin','manager'), async (req, res) => {
  try {
    const { filename } = req.body;
    if (!filename) return res.status(400).json({error:'filename is required'});
    const result = await restoreBackup(filename);
    res.json({message:'Backup restored successfully', details: result});
  } catch(e){ res.status(500).json({error:e.message}); }
});

router.get('/backups', authenticateToken, async (req, res) => {
  try {
    const backups = listBackups();
    res.json(backups);
  } catch(e){ res.status(500).json({error:e.message}); }
});

const publicKeys=['logo','color_preset','app_name'];
router.get('/:key', async (req, res) => {
  try {
    // Public keys can be read without authentication (for login page etc.)
    if(!publicKeys.includes(req.params.key)){
      const authHeader = req.headers['authorization'];
      if(!authHeader) return res.status(401).json({error:'Authentication required'});
      const token = authHeader.split(' ')[1];
      try {
        const decoded = require('jsonwebtoken').verify(token, JWT_SECRET);
        req.user = decoded;
      } catch(e) { return res.status(401).json({error:'Invalid token'}); }
    }
    const row = await getAsync('SELECT value FROM settings WHERE key=?',[req.params.key]);
    res.json({key:req.params.key, value:row?.value||null});
  } catch(e){ res.status(500).json({error:e.message}); }
});

router.put('/:key', authenticateToken, authorizeRoles('superadmin', 'admin','manager'), async (req, res) => {
  const { value } = req.body;
  try {
    await runAsync('INSERT INTO settings (key,value,updated_at) VALUES (?,?,CURRENT_TIMESTAMP) ON CONFLICT(key) DO UPDATE SET value=?,updated_at=CURRENT_TIMESTAMP',
      [req.params.key,value,value]);
    res.json({key:req.params.key,value});
  } catch(e){ res.status(500).json({error:e.message}); }
});

module.exports = router;
