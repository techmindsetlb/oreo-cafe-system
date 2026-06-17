const fs = require('fs');
const path = require('path');
const { runAsync, closeDatabase, reopenDatabase, initializeDatabase } = require('./database/setup');

const BACKUP_DIR = path.join(__dirname, 'backups');
const MAX_BACKUPS = 30;

function pad2(n) { return String(n).padStart(2, '0'); }

function backupTimestamp() {
  const now = new Date();
  return `${now.getFullYear()}-${pad2(now.getMonth()+1)}-${pad2(now.getDate())}T${pad2(now.getHours())}${pad2(now.getMinutes())}`;
}

async function runBackup() {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }
  const dbPath = path.join(__dirname, 'database', 'cafe.db');
  const stamp = backupTimestamp();
  const backupPath = path.join(BACKUP_DIR, `cafe-backup-${stamp}.db`);
  // Flush WAL to main db file for a consistent snapshot
  try { await runAsync("PRAGMA wal_checkpoint(TRUNCATE)"); } catch {}
  fs.copyFileSync(dbPath, backupPath);
  // Rotate old backups — keep newest MAX_BACKUPS
  const files = fs.readdirSync(BACKUP_DIR)
    .filter(f => f.startsWith('cafe-backup-') && f.endsWith('.db'))
    .map(f => ({ name: f, path: path.join(BACKUP_DIR, f), time: fs.statSync(path.join(BACKUP_DIR, f)).mtimeMs }))
    .sort((a, b) => b.time - a.time);
  if (files.length > MAX_BACKUPS) {
    for (const f of files.slice(MAX_BACKUPS)) {
      fs.unlinkSync(f.path);
    }
  }
  return backupPath;
}

function listBackups() {
  if (!fs.existsSync(BACKUP_DIR)) return [];
  return fs.readdirSync(BACKUP_DIR)
    .filter(f => f.startsWith('cafe-backup-') && f.endsWith('.db'))
    .map(f => {
      const stat = fs.statSync(path.join(BACKUP_DIR, f));
      return {
        name: f,
        size: stat.size,
        created: stat.mtime
      };
    })
    .sort((a, b) => new Date(b.created) - new Date(a.created));
}

async function restoreBackup(filename) {
  const BACKUP_DIR = path.join(__dirname, 'backups');
  // Validate filename FIRST to prevent directory traversal
  const cleanName = path.basename(filename);
  if (cleanName !== filename || !filename.startsWith('cafe-backup-') || !filename.endsWith('.db')) {
    throw new Error('Invalid backup filename');
  }
  const backupPath = path.join(BACKUP_DIR, filename);
  if (!fs.existsSync(backupPath)) {
    throw new Error(`Backup file not found: ${filename}`);
  }
  const safeBackup = path.join(BACKUP_DIR, 'pre-restore-safety.db');
  const dbPath = path.join(__dirname, 'database', 'cafe.db');
  // Safety: backup current DB before restoring
  if (fs.existsSync(dbPath)) {
    // Flush WAL for a consistent snapshot
    try { await runAsync("PRAGMA wal_checkpoint(TRUNCATE)"); } catch {}
    fs.copyFileSync(dbPath, safeBackup);
  }
  // Close current DB connection
  await closeDatabase();
  try {
    // Copy backup over current DB
    fs.copyFileSync(backupPath, dbPath);
    // Reopen and reinitialize
    await reopenDatabase();
    await initializeDatabase();
    // Remove the safety backup on success
    try { fs.unlinkSync(safeBackup); } catch {}
    return { restored: cleanName, safetyDeleted: true };
  } catch (e) {
    // Restore failed — try to recover from safety backup
    try {
      await reopenDatabase();
      if (fs.existsSync(safeBackup)) {
        fs.copyFileSync(safeBackup, dbPath);
        await initializeDatabase();
      }
      try { fs.unlinkSync(safeBackup); } catch {}
    } catch {}
    throw e;
  }
}

module.exports = { runBackup, listBackups, restoreBackup };
