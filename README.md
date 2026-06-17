# Café Manager v4.0

Full-stack café management — Node/Express/SQLite backend + React frontend.

## Quick Start

```bash
# Terminal 1 — Backend (port 3001)
cd backend && npm install && npm start

# Terminal 2 — Frontend (port 3000)
cd frontend && npm install && npm start
```

---

## What's New in v4

### 📱 Mobile Payment QR
- Admin uploads their payment QR (WhatsApp Pay, PayPal, etc.) in **Accounting → Mobile Pay QR**
- On POS, when customer chooses Mobile payment, the QR image displays full-screen
- Staff uploads a screenshot of the payment confirmation
- Click **Verify** then **Confirm** to complete the order

### 👥 Split Bill (Per-Person Orders)
- On POS, type a person's name and click **+ Person** before adding items
- Tap a person's chip to assign items to them, tap again to deassign
- Each person's running total shown on their chip
- In **Orders page**, each person has their own **Pay This Person** button
- Paying one person deducts their share from the remaining balance
- Order stays open until ALL persons have paid

### 🗂️ Multi-Tab POS + Multi-Tab Gaming
- POS: unlimited simultaneous order tabs, each fully independent
- Gaming: each tab can manage a different station (occupied station locked to its tab)

### 🧾 Elegant Invoice (no tax)
- Clean receipt design with italic brand name, dashed separators, invoice badge
- Shows person labels on items for split orders
- One-click browser print — works with thermal printers and PDF

### 📋 Dispatch / Kitchen Print
- In Orders page, click the 📋 button next to any order
- Prints a large-format kitchen ticket: table number, items grouped by category, notes
- Each item shows person label if split billing was used

### 📊 Reports & Accounting: Date Range + Printable
- **Daily** (pick any date), **Weekly**, **Monthly** (pick any month), **Custom Range** (any from→to)
- All views include **Sales by Item** table (name, category, qty, revenue)
- 🖨️ Print Report button generates a clean printable report
- Accounting page has the same date range controls

### 📅 Business Day Open/Close
- Sidebar link **Business Day** (admin, manager, cashier)
- Open day with optional opening cash amount and notes
- Close day with closing cash — calculates your cash drawer
- Full history of all business days in a table

### ⏱ Stopwatch Fixed
- Gaming session timer now counts up correctly using `Date.now()` delta
- Timer restores correctly after page navigation
- Active session shown in a persistent banner at the top of the Gaming page
- Sidebar shows a pulsing green dot when any session is active

### 🚫 No Session Start in Tables Page
- Gaming stations in the Tables page are read-only (show timer + status)
- "→ Gaming page" label redirects staff to the correct place
- Sessions can ONLY be started/ended from the Gaming page

---

## Role Permissions

| Role    | Access |
|---------|--------|
| Cashier | POS · Orders · Tables · Gaming · Business Day |
| Waiter  | POS · Orders · Tables · Gaming |
| Kitchen | View Orders · Update Status |
| Manager | POS · Orders · Menu · Tables · Reports · Gaming · Inventory · Business Day · Accounting |
| Admin   | Full Access |

---

## Project Structure

```
Cafe_Software_Final/
├── backend/
│   ├── database/setup.js       Schema + seed + migrations
│   ├── middleware/auth.js       JWT + role guards
│   ├── routes/
│   │   ├── orders.js           Orders + person split pay + invoice numbers
│   │   ├── tables.js           Tables + reservations + gaming sessions
│   │   ├── reports.js          Daily/weekly/monthly/range + itemSales
│   │   ├── settings.js         Key-value store (QR code image)
│   │   ├── businessDay.js      Open/close day + history
│   │   ├── employees.js        CRUD + login
│   │   ├── menu.js             Categories + items
│   │   └── inventory.js        Stock management
│   ├── server.js
│   └── package.json
└── frontend/
    ├── public/index.html
    ├── src/
    │   ├── App.js              All pages (805 lines)
    │   ├── App.css             Design system (338 lines)
    │   └── index.js
    └── package.json            proxy → localhost:3001
```
