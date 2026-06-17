/**
 * Reset for Client — Clears transactional data while preserving demo data.
 * Run this before delivering/selling the system to a new client.
 *
 * KEPT: employees (superadmin), categories, menu_items, inventory, tables, settings
 * CLEARED: orders, order_items, order_persons, business_days, expenses, pos_drafts, customers
 */
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database', 'cafe.db');
const db = new sqlite3.Database(dbPath);

function runAsync(sql) {
  return new Promise((resolve, reject) => {
    db.run(sql, function (err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

async function reset() {
  try {
    console.log('🗑️  Clearing transactional data...\n');

    // Order of deletion matters (foreign keys)
    const tables = [
      'order_persons',
      'order_items',
      'orders',
      'pos_drafts',
      'business_days',
      'expenses',
      'customers',
      'menu_inventory',
    ];

    let total = 0;
    for (const table of tables) {
      const result = await runAsync(`DELETE FROM ${table}`);
      console.log(`   ✗ ${table} — ${result.changes} row(s) deleted`);
      total += result.changes;
    }

    // Reset SQLite auto-increment counters so IDs start fresh
    const sequences = [
      'order_persons',
      'order_items',
      'orders',
      'pos_drafts',
      'business_days',
      'expenses',
      'customers',
      'menu_inventory',
    ];
    for (const table of sequences) {
      await runAsync(`DELETE FROM sqlite_sequence WHERE name='${table}'`);
    }
    console.log('\n📊 Auto-increment counters reset for all transactional tables.');

    // VACUUM to reclaim disk space
    await runAsync('VACUUM');
    console.log('🧹 Database VACUUM completed (disk space reclaimed).\n');

    console.log('✅ Reset complete!');
    console.log(`   Total rows removed: ${total}`);
    console.log('\n📌 Preserved data:');
    console.log('   ✅ Employees (superadmin preserved)');
    console.log('   ✅ Categories (seed data preserved)');
    console.log('   ✅ Menu Items (seed data preserved)');
    console.log('   ✅ Inventory (seed data preserved)');
    console.log('   ✅ Tables & Stations (seed data preserved)');
    console.log('   ✅ Settings (empty, ready for client)\n');
    console.log('➡️  Start the server with: node backend/server.js');
    console.log('   Login: admin@cafe.com / admin123');
    console.log('   Then open the Business Day page to start fresh.');

  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  } finally {
    db.close();
  }
}

reset();
