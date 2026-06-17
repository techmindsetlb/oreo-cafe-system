const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, 'cafe.db');
let db = new sqlite3.Database(dbPath);

db.run('PRAGMA journal_mode = WAL');
db.run('PRAGMA foreign_keys = ON');

function runAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err); else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}
function getAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => { if (err) reject(err); else resolve(row); });
  });
}
function allAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => { if (err) reject(err); else resolve(rows); });
  });
}

async function initializeDatabase() {
  await runAsync(`CREATE TABLE IF NOT EXISTS employees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL, email TEXT UNIQUE NOT NULL, password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'cashier', phone TEXT, is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`);

  await runAsync(`CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL, description TEXT, sort_order INTEGER DEFAULT 0)`);

  await runAsync(`CREATE TABLE IF NOT EXISTS menu_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL, description TEXT, price REAL NOT NULL,
    category_id INTEGER, image TEXT, is_available INTEGER DEFAULT 1,
    preparation_time INTEGER DEFAULT 5, created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id))`);

  await runAsync(`CREATE TABLE IF NOT EXISTS inventory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL, quantity REAL NOT NULL DEFAULT 0, unit TEXT NOT NULL,
    min_quantity REAL DEFAULT 10, cost_per_unit REAL DEFAULT 0,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP)`);

  await runAsync(`CREATE TABLE IF NOT EXISTS tables (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    number INTEGER UNIQUE NOT NULL, seats INTEGER DEFAULT 4,
    status TEXT DEFAULT 'available', section TEXT DEFAULT 'main',
    type TEXT NOT NULL DEFAULT 'table', hourly_rate REAL DEFAULT 0.0,
    session_start DATETIME DEFAULT NULL,
    reservation_name TEXT DEFAULT NULL, reservation_phone TEXT DEFAULT NULL)`);

  await runAsync(`CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_number INTEGER DEFAULT NULL, order_type TEXT NOT NULL DEFAULT 'takeaway',
    table_id INTEGER, employee_id INTEGER, status TEXT DEFAULT 'pending',
    subtotal REAL DEFAULT 0, discount REAL DEFAULT 0, total REAL DEFAULT 0,
    payment_method TEXT, payment_status TEXT DEFAULT 'unpaid', notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP, completed_at DATETIME,
    FOREIGN KEY (table_id) REFERENCES tables(id),
    FOREIGN KEY (employee_id) REFERENCES employees(id))`);

  await runAsync(`CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL, menu_item_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1, unit_price REAL NOT NULL,
    total_price REAL NOT NULL, notes TEXT, person_label TEXT DEFAULT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (menu_item_id) REFERENCES menu_items(id))`);

  // Table persons (split billing)
  await runAsync(`CREATE TABLE IF NOT EXISTS order_persons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL, label TEXT NOT NULL,
    paid INTEGER DEFAULT 0, paid_amount REAL DEFAULT 0, paid_method TEXT,
    paid_at DATETIME,
    FOREIGN KEY (order_id) REFERENCES orders(id))`);

  // Business day log
  await runAsync(`CREATE TABLE IF NOT EXISTS business_days (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT UNIQUE NOT NULL,
    opened_at DATETIME, closed_at DATETIME,
    status TEXT DEFAULT 'open',
    opening_cash REAL DEFAULT 0, closing_cash REAL DEFAULT 0,
    notes TEXT)`);

  // Customers table
  await runAsync(`CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`);

  // Expenses table
  await runAsync(`CREATE TABLE IF NOT EXISTS expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT NOT NULL,
    amount REAL NOT NULL,
    description TEXT DEFAULT '',
    date TEXT NOT NULL,
    employee_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id))`);

  // Settings (QR code image, etc.)
  await runAsync(`CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY, value TEXT, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP)`);

  // Menu inventory recipe linking (menu items to inventory items)
  await runAsync(`CREATE TABLE IF NOT EXISTS menu_inventory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    menu_item_id INTEGER NOT NULL,
    inventory_item_id INTEGER NOT NULL,
    quantity_needed REAL NOT NULL DEFAULT 1,
    FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE CASCADE,
    FOREIGN KEY (inventory_item_id) REFERENCES inventory(id) ON DELETE CASCADE)`);

  // POS drafts (crash-safe cart saving)
  await runAsync(`CREATE TABLE IF NOT EXISTS pos_drafts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL,
    draft_data TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id))`);

  // ── Migrations for existing DBs ──────────────────────────────────────────────
  const migrations = [
    'ALTER TABLE tables ADD COLUMN reservation_name TEXT DEFAULT NULL',
    'ALTER TABLE tables ADD COLUMN reservation_phone TEXT DEFAULT NULL',
    'ALTER TABLE orders ADD COLUMN invoice_number INTEGER DEFAULT NULL',
    'ALTER TABLE order_items ADD COLUMN person_label TEXT DEFAULT NULL',
    'ALTER TABLE categories ADD COLUMN icon TEXT DEFAULT NULL',
    'ALTER TABLE menu_items ADD COLUMN track_stock INTEGER DEFAULT 0',
    'ALTER TABLE menu_items ADD COLUMN stock_quantity INTEGER DEFAULT 0',
    'ALTER TABLE menu_items ADD COLUMN cost REAL DEFAULT 0',
    'CREATE TABLE IF NOT EXISTS pos_drafts (id INTEGER PRIMARY KEY AUTOINCREMENT, employee_id INTEGER NOT NULL, draft_data TEXT NOT NULL, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (employee_id) REFERENCES employees(id))',
  ];
  for (const m of migrations) { try { await runAsync(m); } catch {} }

  // Backfill stock for existing items: set default stock if track_stock=NULL
  await runAsync("UPDATE menu_items SET track_stock=0 WHERE track_stock IS NULL");
  await runAsync("UPDATE menu_items SET stock_quantity=0 WHERE stock_quantity IS NULL");

  // Backfill invoice numbers
  await runAsync('UPDATE orders SET invoice_number = id WHERE invoice_number IS NULL');

  // ── Seed superadmin ───────────────────────────────────────────────────────────
  const superadmin = await getAsync("SELECT id FROM employees WHERE role = 'superadmin'");
  const existingAdmin = await getAsync("SELECT id FROM employees WHERE email = 'admin@cafe.com'");
  if (!superadmin && existingAdmin) {
    // Upgrade existing admin to superadmin
    await runAsync("UPDATE employees SET role = 'superadmin', name = 'Super Admin' WHERE id = ?", [existingAdmin.id]);
  } else if (!superadmin && !existingAdmin) {
    const pw = bcrypt.hashSync('admin123', 10);
    await runAsync('INSERT INTO employees (name,email,password,role) VALUES (?,?,?,?)',
      ['Super Admin','admin@cafe.com',pw,'superadmin']);
  }

  // ── Seed categories ───────────────────────────────────────────────────────────
  const catCount = await getAsync('SELECT COUNT(*) as c FROM categories');
  if (catCount.c === 0) {
    for (const [n,d,s] of [
      ['Hot Drinks','Hot coffee, tea, and specialty beverages',1],
      ['Cold Drinks','Refreshing cold beverages',2],
      ['Snacks','Light bites and snack foods',3],
      ['Entertainment','Gaming station time charges',4],
    ]) await runAsync('INSERT INTO categories (name,description,sort_order) VALUES (?,?,?)',[n,d,s]);
  }

  // ── Seed menu items ───────────────────────────────────────────────────────────
  const menuCount = await getAsync('SELECT COUNT(*) as c FROM menu_items');
  if (menuCount.c === 0) {
    const h = await getAsync("SELECT id FROM categories WHERE name='Hot Drinks'");
    const c = await getAsync("SELECT id FROM categories WHERE name='Cold Drinks'");
    const s = await getAsync("SELECT id FROM categories WHERE name='Snacks'");
    const e = await getAsync("SELECT id FROM categories WHERE name='Entertainment'");
    for (const [n,d,p,cid,prep] of [
      ['Tea','Classic hot tea',1.50,h.id,3],
      ['Turkish Coffee','Strong traditional Turkish coffee',2.00,h.id,5],
      ['Cappuccino','Creamy espresso with steamed milk',3.50,h.id,5],
      ['Nescafe','Instant Nescafe with cream',2.50,h.id,3],
      ['Espresso','Single-shot espresso',2.00,h.id,3],
      ['Hot Chocolate','Rich hot chocolate',3.00,h.id,5],
      ['Latte','Smooth espresso with steamed milk',3.50,h.id,5],
      ['Mineral Water','Bottled mineral water',1.00,c.id,0],
      ['Coca Cola','Classic Coca Cola can',2.00,c.id,0],
      ['Fresh Orange Juice','Freshly squeezed orange juice',4.00,c.id,5],
      ['Lemonade','Fresh lemonade with mint',3.50,c.id,5],
      ['Iced Coffee','Cold brew iced coffee',3.50,c.id,3],
      ['Laziza Drink','Laziza flavored malt beverage',3.00,c.id,1],
      ['Potato Chips','Crispy salted chips',1.50,s.id,0],
      ['Cookies','Freshly baked cookies',2.00,s.id,0],
      ['Peanuts','Roasted salted peanuts',1.50,s.id,0],
      ['Sandwich','Club sandwich',5.00,s.id,10],
      ['Croissant','Butter croissant',2.50,s.id,0],
      ['Playstation Time','Per-hour Playstation usage',5.00,e.id,0],
      ['PC Time','Per-hour PC usage',3.00,e.id,0],
      ['Billiards Time','Per-hour billiards usage',8.00,e.id,0],
      ['Babyfoot Session','Per-session babyfoot',2.00,e.id,0],
    ]) await runAsync('INSERT INTO menu_items (name,description,price,category_id,preparation_time) VALUES (?,?,?,?,?)',[n,d,p,cid,prep]);
  }

  // ── Seed tables ───────────────────────────────────────────────────────────────
  const tblCount = await getAsync('SELECT COUNT(*) as c FROM tables');
  if (tblCount.c === 0) {
    for (const [num,seats,section,type,rate] of [
      [1,2,'window','table',0],[2,2,'window','table',0],
      [3,4,'main','table',0],[4,4,'main','table',0],[5,6,'main','table',0],
      [6,2,'gaming','playstation',5.00],[7,2,'gaming','playstation',5.00],
      [8,1,'pc-zone','pc',3.00],[9,1,'pc-zone','pc',3.00],
      [10,2,'lounge','billiards',8.00],[11,2,'lounge','babyfoot',2.00],
    ]) await runAsync('INSERT INTO tables (number,seats,section,type,hourly_rate) VALUES (?,?,?,?,?)',[num,seats,section,type,rate]);
  }

  // ── Seed inventory ────────────────────────────────────────────────────────────
  const invCount = await getAsync('SELECT COUNT(*) as c FROM inventory');
  if (invCount.c === 0) {
    for (const [n,q,u,m,c] of [
      ['Coffee Beans',5000,'grams',500,0.02],['Milk',20,'liters',5,1.50],
      ['Sugar',3000,'grams',500,0.005],['Cups (Small)',200,'pieces',50,0.10],
      ['Cups (Large)',150,'pieces',40,0.15],['Tea Bags',100,'pieces',20,0.05],
    ]) await runAsync('INSERT INTO inventory (name,quantity,unit,min_quantity,cost_per_unit) VALUES (?,?,?,?,?)',[n,q,u,m,c]);
  }

  // ✓ Day NOT auto-opened — user must open manually in Business Day page

  console.log('✓ Database ready (v3)');
}
// ── Close and reopen database (used for restore) ─────────────────
function closeDatabase() {
  return new Promise((resolve, reject) => {
    db.close(err => {
      if (err && err.message !== 'SQLITE_MISUSE: not an error') reject(err);
      else resolve();
    });
  });
}

function reopenDatabase() {
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(dbPath, err => {
      if (err) reject(err);
      else resolve();
    });
  });
}

module.exports = { db, runAsync, getAsync, allAsync, initializeDatabase, closeDatabase, reopenDatabase };
