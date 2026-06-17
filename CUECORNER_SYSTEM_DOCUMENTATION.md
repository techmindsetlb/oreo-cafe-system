# ☕ Cue Corner — Complete System Documentation

> **Version:** 4.0  
> **Database:** SQLite (`backend/database/cafe.db`)  
> **Backend:** Node.js / Express (port 3001)  
> **Frontend:** React (built, served by backend)  
> **Language Support:** English / العربية  

---

# 📑 Table of Contents

1. [Getting Started](#1-getting-started)
2. [System Architecture](#2-system-architecture)
3. [Authentication & Roles](#3-authentication--roles)
4. [POS (Point of Sale)](#4-pos-point-of-sale)
5. [Gaming Page](#5-gaming-page)
6. [Orders Page](#6-orders-page)
7. [Menu Management](#7-menu-management)
8. [Tables & Stations](#8-tables--stations)
9. [Inventory](#9-inventory)
10. [Reports & Accounting](#10-reports--accounting)
11. [Business Day](#11-business-day)
12. [Employees](#12-employees)
13. [Customers](#13-customers)
14. [Expenses](#14-expenses)
15. [Settings & Branding](#15-settings--branding)
16. [Crash Recovery](#16-crash-recovery)
17. [Database Schema](#17-database-schema)
18. [API Reference](#18-api-reference)
19. [Maintenance & Backups](#19-maintenance--backups)

---

# 1. Getting Started

## 1.1 Starting the System

**Using the shortcut (recommended):**
- Double-click `start.bat` on the desktop
- This starts the backend server and opens the browser
- The system runs at **http://localhost:3001**

**Manual start:**
```bash
cd "C:\Users\UserPc\Desktop\Cue Corner"
node backend/server.js
```

## 1.2 Default Login

| Email | Password | Role |
|-------|----------|------|
| `admin@cafe.com` | `admin123` | Super Admin |

## 1.3 Stopping the System

- Double-click `stop.vbs` on the desktop
- Or press `Ctrl+C` in the terminal running the server
- Or close the terminal window

## 1.4 Project Structure

```
Cue Corner/
├── backend/
│   ├── server.js                 # Main entry point, routes, schedulers
│   ├── package.json
│   ├── database/
│   │   ├── setup.js              # Schema creation, migrations, seed data
│   │   └── cafe.db               # SQLite database file
│   ├── middleware/
│   │   └── auth.js               # JWT authentication + role authorization
│   ├── routes/
│   │   ├── orders.js             # Orders CRUD + split bill + drafts
│   │   ├── tables.js             # Tables + reservations + gaming sessions
│   │   ├── reports.js            # Daily/weekly/monthly/range + net profit
│   │   ├── settings.js           # Key-value store + backups
│   │   ├── businessDay.js        # Open/close day + auto-cleanup
│   │   ├── employees.js          # CRUD + login + password reset
│   │   ├── menu.js               # Categories + items + recipes
│   │   ├── inventory.js          # Stock management + adjustments
│   │   ├── expenses.js           # Expense tracking + bulk import
│   │   └── customers.js          # Customer management
│   ├── backup.js                 # Database backup & restore logic
│   └── backups/                  # Daily backup files (keeps newest 30)
├── frontend/
│   ├── build/                    # Compiled React app (served by backend)
│   ├── src/
│   │   ├── App.js                # ALL frontend pages in one file
│   │   ├── App.css               # Complete design system
│   │   └── index.js              # React entry point
│   └── package.json
├── create_desktop_shortcut.vbs
├── create_stop_shortcut.vbs
├── start.bat
├── stop.vbs
└── start.vbs
```

---

# 2. System Architecture

## 2.1 Overview

The system is a **single-server, single-file SQLite** application. There is no separate database server — everything runs from one Node.js process that serves both the API and the frontend.

```
┌─────────────┐     HTTP (port 3001)     ┌──────────────────┐
│   Browser   │ ◄──────────────────────► │  Node/Express    │
│  (React)    │                          │  Backend Server  │
└─────────────┘                          │                  │
    ┌──────────────────┐                 │  ┌────────────┐  │
    │  localStorage    │                 │  │  SQLite DB │  │
    │  (browser cache) │                 │  │  cafe.db   │  │
    └──────────────────┘                 │  └────────────┘  │
                                         └──────────────────┘
```

## 2.2 Key Design Decisions

- **Single-file frontend:** All pages are defined in `frontend/src/App.js` (~146,000 chars). This avoids complex routing/fragmentation.
- **SQLite (no separate DB):** The database is a single file (`backend/database/cafe.db`). No PostgreSQL/MySQL needed.
- **WAL mode:** Uses Write-Ahead Logging for better concurrent read performance.
- **Built frontend:** The React app is compiled into `frontend/build/` and served as static files from the Express server. No separate frontend dev server needed.
- **Local timezone:** All dates are stored in **local server time** (Lebanon UTC+2/UTC+3), not UTC. This avoids off-by-one-day issues.

## 2.3 Startup Sequence

When `node backend/server.js` starts:
1. Express app initializes with CORS and JSON body parser (5MB limit for QR images)
2. All API route files are mounted under `/api/`
3. `initializeDatabase()` runs:
   - Creates all tables if they don't exist
   - Runs migrations for existing databases
   - Seeds superadmin account, categories, menu items, tables, and inventory (if first run)
4. Express serves the built frontend from `frontend/build/`
5. Server starts listening on port 3001
6. Two background schedulers start:
   - **Auto-close scheduler:** Checks every 15 minutes, auto-closes previous days' open business days after 3 AM
   - **Backup scheduler:** Creates a database backup every day at 4 AM

---

# 3. Authentication & Roles

## 3.1 Authentication

Uses **JWT (JSON Web Tokens)** with a 24-hour expiry.

- **Secret key:** `cafe-software-secret-key-2026` (defined in `backend/middleware/auth.js`)
- Token contains: `{ id, name, email, role }`
- On login, the token and employee info are stored in `localStorage`
- If a 401 or 403 response is received, `localStorage.clear()` is called and the user is redirected to `/login`

## 3.2 Roles & Permissions

| Role | Permissions |
|------|-------------|
| **Super Admin** | **FULL ACCESS** — all features including settings, password resets, employee management |
| **Admin** | POS, Orders (view+status), Menu (view+manage), Tables (view+manage), Reports, Inventory (view+manage), Employees, Accounting, Gaming, Business Day, Customers |
| **Manager** | POS, Orders (view+status), Menu (view), Tables (view+manage), Reports, Inventory (view), Accounting, Gaming, Business Day, Customers |
| **Cashier** | POS, Orders (view), Tables (view+manage), Gaming |
| **Waiter** | POS, Orders (view), Tables (view+manage), Gaming |
| **Kitchen** | Orders (view), Orders (update status) |

**Important:** Only **Super Admin** can:
- Delete employees
- Reset employee passwords
- Edit superadmin accounts

Only **Super Admin** and **Admin** can:
- Create/delete menu items and categories
- Manage inventory
- Access settings

## 3.3 Login API

```
POST /api/employees/login
Body: { email, password }
Response: { token, employee: { id, name, email, role } }
```

All other endpoints require the header: `Authorization: Bearer <token>`

---

# 4. POS (Point of Sale)

## 4.1 Overview

The POS page (`/pos`) is the main order-taking interface. It supports:
- Takeaway and Dine-In orders
- Multi-tab ordering (unlimited simultaneous carts)
- Split bill per person
- Cash and Mobile payment
- Open Tab (pay later)
- Kitchen dispatch printing
- Invoice printing
- **Crash-safe draft saving** (auto-saved to database)

## 4.2 Order Types

| Type | Description |
|------|-------------|
| **Takeaway** | Customer takes food to go. No table assignment. |
| **Dine-In** | Customer eats in the cafe. Requires table selection. |

## 4.3 Multi-Tab Ordering

The POS supports **unlimited independent order tabs**. Each tab has its own:
- Order type (Takeaway/Dine-In)
- Table selection
- Cart items
- Discount
- Notes
- Persons (split bill)
- Open order ID (for pay-later tabs)

**How tabs work:**
- Click "+ New Order" to add a tab
- Click on a tab to switch to it
- Each tab is color-coded when active
- Tabs with items show a badge
- Open tabs (pay-later) show a 📌 pin icon

## 4.4 Menu Selection Flow

1. Select order type (Takeaway or Dine-In)
2. For Dine-In: select a table
3. Browse categories, click a category to see its items
4. Click items to add to cart
5. Click "← Back to Menu" to browse another category

## 4.5 Cart Operations

| Action | How |
|--------|-----|
| **Add item** | Click an item card (adds 1) |
| **Increase qty** | Click `+` button on the cart row |
| **Decrease qty** | Click `−` button (removes item at 0) |
| **Clear cart** | Click "🗑 Clear" button |
| **Set discount** | Enter dollar amount in discount field |
| **Add notes** | Type in the notes textarea |

## 4.6 Split Bill (Per-Person Orders)

### Setup:
1. Before adding items, type a person's name in the "Person name…" input
2. Click "+ Person" or press Enter
3. Repeat for each additional person

### Assigning items to a person:
1. Click on a person's chip in the persons strip (it highlights)
2. Any items you click get assigned to that person
3. Click the person chip again to deselect (items go unassigned)

### Cart display:
- Items are grouped by person in the cart
- Each group shows the person's name and running total
- Each person has a "Pay Now" button for individual payment
- Paid persons show with ✅ and "PAID" badge

### During payment:
- You can pay for one person at a time
- The remaining persons' items stay in the cart
- The order stays open until all persons have paid
- Or pay the full amount to complete the entire order

## 4.7 Payment Methods

| Method | Description |
|--------|-------------|
| **Cash (💵)** | Record cash payment. Order completes immediately. |
| **Mobile (📱)** | WISH Money / mobile wallet payment. Shows QR code for customer to scan. |

### Mobile Payment Flow:
1. Click "Pay Now" → select "Mobile" (📱)
2. A modal shows the cafe's WISH Money QR code
3. Customer scans and pays the exact amount
4. Staff confirms payment received → clicks "Payment Received — Complete Order"
5. Order is marked as paid and completed

## 4.8 Open Tab (Pay Later)

- For Dine-In orders where the customer will pay later
- Creates the order with status "preparing" and payment "unpaid"
- The tab shows a 📌 pin icon
- The order appears on the Orders page and the Tables page for payment
- Customer can pay later from the Orders page or Tables page

## 4.9 Kitchen Dispatch Printing

Prints a formatted kitchen ticket with:
- Table number (or "TAKEWAY")
- Items grouped by category
- Quantities in large font
- Special instructions/notes
- Automatically triggers browser print dialog

## 4.10 Invoice Printing

Prints a formatted customer receipt with:
- Cafe brand name
- Invoice number (e.g., `#0001`)
- Date and time
- Employee name
- Items with quantities and prices
- Person labels for split orders
- Subtotal, discount, total
- Payment method
- Thank you message
- One-click browser print

---

# 5. Gaming Page

## 5.1 Overview

The Gaming page (`/gaming`) manages **gaming station sessions** (PlayStation, PC, Billiards, Babyfoot). Staff can:
- Start/end sessions on gaming stations
- Track session duration with a timer
- Add food/drink items to the gaming tab
- End session and automatically add session charges to the cart
- **Crash-safe draft saving** (auto-saved to database)

## 5.2 Station Types

| Type | Icon | Description |
|------|------|-------------|
| Playstation | 🎮 | Per-hour rate (billed in full hours) |
| PC | 🖥 | Per-hour rate (billed in full hours) |
| Billiards | 🎱 | Per-hour rate (billed in full hours) |
| Babyfoot | ⚽ | Per-session rate (billed as 1 hour minimum) |

## 5.3 Starting a Session

1. Navigate to the Gaming page
2. Click "▶ Start" on an available station
3. A session timer starts counting up
4. The session banner shows the station name and elapsed time
5. While the session is active, you can add food/drink items

## 5.4 Ending a Session

1. Click "■ End" on the active station (or the End button in the banner)
2. The session calculates charges: `ceil(hours_elapsed) × hourly_rate`
3. Babyfoot is billed as a flat 1-session charge
4. The session charge is added to the cart as an item
5. The station becomes available for the next customer

## 5.5 Gaming Tab Management

- **Multi-tab support** — each tab can manage a different station
- Stations in use by another tab are shown as "other tab" and cannot be started
- "End All Sessions" button ends ALL active gaming sessions across all stations

## 5.6 Important Notes

- **Sessions can only be started/ended from the Gaming page**, not the Tables page
- The sidebar shows a pulsing green dot when any gaming session is active
- When the timer reaches a new hour, a toast notification appears
- When a gaming session is ended, the session charge appears in the cart as an "Entertainment" category item

---

# 6. Orders Page

## 6.1 Overview

The Orders page (`/orders`) shows all orders with filtering capabilities.

## 6.2 Filters

| Filter | Options |
|--------|---------|
| **Status** | All / Pending / Preparing / Ready / Completed / Cancelled |
| **Type** | All / Takeaway / Dine-In |
| **Date** | Today / Yesterday / This Week / Custom range (from/to) |
| **Print Report** | Generates a printable report of filtered orders |

## 6.3 Order Statuses

| Status | Meaning | Color |
|--------|---------|-------|
| **Pending** | Order received, not yet in preparation | Amber |
| **Preparing** | Kitchen is working on the order | Blue |
| **Ready** | Order is ready for pickup/serving | Green |
| **Completed** | Order paid and fulfilled | Gray |
| **Cancelled** | Order was cancelled | Red |

## 6.4 Order Detail Panel

Clicking an order opens the detail panel showing:
- Invoice number, type, table number
- Employee who took the order
- Current status with buttons to change it
- All items with quantities and prices
- Person/label info for split-bill orders
- Subtotal, discount, total
- Payment status

### Actions in Detail Panel:

| Button | Description |
|--------|-------------|
| **🖨️** | Print invoice |
| **📋** | Print kitchen dispatch |
| **✓ Mark Paid** | Quick mark as paid (if unpaid) |
| **↩ Unpaid** | Revert to unpaid (if paid in error) |
| **💳 Close & Pay** | Process payment |
| **Status buttons** | Change order status (Pending → Preparing → Ready → Completed) |

## 6.5 Split Bill in Orders Page

For orders with split billing:
- Each person is shown with their items and total
- "Collect $XX" button per person to accept payment
- Shows person as "✓ Paid" once paid
- Remaining total updates automatically

---

# 7. Menu Management

## 7.1 Overview

The Menu page (`/menu`) manages the cafe's product catalog.

**Permissions:** Admin, Manager (view+edit), others (view only)

## 7.2 Categories

| Field | Description |
|-------|-------------|
| Name | Category name (e.g., "Hot Drinks", "Cold Drinks") |
| Description | Optional category description |
| Icon | Emoji icon (80+ available icons in the icon picker) |
| Sort Order | Display order (lower numbers first) |

**Default Categories:**
1. Hot Drinks
2. Cold Drinks
3. Snacks
4. Entertainment

## 7.3 Menu Items

| Field | Description |
|-------|-------------|
| Name | Item name |
| Description | Optional item description |
| Price | Selling price (in USD) |
| Category | Which category the item belongs to |
| Preparation Time | Minutes to prepare (shown on POS) |
| Available | Toggle to show/hide from POS |
| Track Stock | Enable stock tracking for this item |
| Stock Quantity | Current stock count |
| Cost | Cost per unit (for profit calculation) |
| Recipe | Link to inventory items (for COGS tracking) |

## 7.4 Stock Tracking

When "Track Stock" is enabled for an item:
- The POS shows remaining stock count
- Items with 0 stock are grayed out and cannot be ordered
- Stock decrements automatically when orders are placed
- Stock restores when orders are cancelled

---

# 8. Tables & Stations

## 8.1 Overview

The Tables page (`/tables`) manages dining tables and gaming stations.

**Permissions:** Admin, Manager, Cashier, Waiter (manage)

## 8.2 Dining Tables

| Field | Description |
|-------|-------------|
| Number | Table number |
| Seats | Maximum capacity |
| Section | Location (e.g., window, main) |
| Status | Available / Occupied / Reserved |

### Table Actions:

| Action | Description |
|--------|-------------|
| **● Occupy** | Mark table as occupied (without an order) |
| **○ Free** | Release occupied table |
| **📅 Reserve** | Reserve for a guest (name + phone) |
| **Cancel Res.** | Cancel reservation |
| **💵 Pay** | Pay open orders at this table (Cash/Mobile) |
| **🗑 Delete** | Remove table (Admin only) |

### Table Display:
- Shows open orders and total owed when occupied
- Reservation info shown when reserved
- Shows timer for gaming stations

## 8.3 Gaming Stations

Gaming stations are shown in a separate section with a note:
"→ Gaming page" — sessions can only be started/ended from the Gaming page.

| Type | Icon | Rate |
|------|------|------|
| Playstation | 🎮 | Per-hour |
| PC | 🖥 | Per-hour |
| Billiards | 🎱 | Per-hour |
| Babyfoot | ⚽ | Per-session |

---

# 9. Inventory

## 9.1 Overview

The Inventory page (`/inventory`) manages stock levels of supplies.

**Permissions:** Admin, Manager (manage), others (view only)

## 9.2 Inventory Items

| Field | Description |
|-------|-------------|
| Name | Item name (e.g., "Coffee Beans") |
| Quantity | Current stock level |
| Unit | Unit of measurement (e.g., grams, liters, pieces) |
| Min Quantity | Threshold for low-stock warning |
| Cost Per Unit | Purchase cost per unit |

## 9.3 Stock Operations

| Action | Description |
|--------|-------------|
| **Add Item** | Create a new inventory item |
| **Adjust** | Add or subtract stock (e.g., +5 or -2) |
| **Low Stock** | View all items below minimum quantity |

---

# 10. Reports & Accounting

## 10.1 Overview

The Reports page (`/reports`) provides sales analytics. The Accounting page (`/accounting`) provides financial management.

## 10.2 Report Periods

| Period | Description |
|--------|-------------|
| **Daily** | Select any date |
| **Weekly** | Current week (last 7 days) |
| **Monthly** | Select any month |
| **Custom Range** | Any from/to date range |

## 10.3 Report Data

Each report shows:
- **Total Orders** count
- **Total Revenue** in USD
- **Breakdown by type** (Takeaway vs Dine-In)
- **Daily Breakdown** (for weekly/monthly/range)
- **Sales by Item** table (name, category, quantity, revenue)
- **Hourly Sales** (for daily reports)
- **Print Report** button for clean printable format

## 10.4 Accounting Tabs

| Tab | Description |
|-----|-------------|
| **Overview** | Monthly overview with revenue, expenses, net profit |
| **Financial Summary** | Revenue data with item breakdown |
| **Expenses** | List and manage expenses |
| **Cash Flow** | Cash flow overview |
| **Net Profit** | Revenue - Cost analysis per item with margin % |
| **Mobile Pay QR** | Upload and manage mobile payment QR code |

## 10.5 Net Profit Report

Shows profit breakdown per menu item:
- Revenue per item
- Total cost (quantity × cost per unit from menu items)
- Net profit = Revenue - Cost
- Profit margin percentage
- Print button for clean report

---

# 11. Business Day

## 11.1 Overview

The Business Day system controls whether orders can be placed. When the day is closed, the system blocks order creation with an alert.

**Permissions:** Admin, Manager, Cashier

## 11.2 Opening the Day

1. Go to Business Day page (`/business-day`)
2. Click "Open Day"
3. Optionally enter opening cash amount and notes
4. The day is now open — orders can be placed

**When a day opens, the system automatically:**
1. Closes any other open days (prevents multiple open days)
2. Calculates closing cash for auto-closed days
3. Ends all active gaming sessions
4. Frees all occupied dining tables
5. Cancels all unpaid orders from previous days (restoring stock)

## 11.3 Closing the Day

1. Go to Business Day page
2. Click "Close Day"
3. Optionally enter closing cash amount
4. The day is now closed

## 11.4 Auto-Close (3 AM)

Every day after 3 AM, the server automatically:
1. Closes any business days from previous dates that are still open
2. Calculates expected closing cash (opening cash + revenue)
3. Ends all active gaming sessions
4. Frees all occupied tables
5. Cancels unpaid orders from previous days

## 11.5 Auto-Close During the Day

If a day has been open for more than **4 hours** without manual interaction, the system will auto-close it (to prevent accidentally leaving days open overnight).

## 11.6 Expected Cash

The system calculates expected cash drawer amount: `opening_cash + revenue_from_paid_orders`.

---

# 12. Employees

## 12.1 Overview

The Employees page (`/employees`) manages staff accounts.

**Permissions:** Admin (manage), Manager (view), Super Admin (full + password reset)

## 12.2 Employee Fields

| Field | Description |
|-------|-------------|
| Name | Full name |
| Email | Login email address |
| Password | Login password (only on create) |
| Role | cashier / waiter / kitchen / manager / admin |
| Phone | Optional phone number |
| Status | Active / Inactive (inactive users cannot log in) |

## 12.3 Role Descriptions (shown in UI)

| Role | Description |
|------|-------------|
| **Cashier** | POS · Orders · Tables · Gaming |
| **Waiter** | POS · Orders · Tables · Gaming |
| **Kitchen** | View Orders · Update Status |
| **Manager** | POS · Orders · Menu · Tables · Reports · Gaming · Inventory · Accounting |
| **Admin** | Full Access (excluding superadmin-only features) |
| **Super Admin** | Full Access — Settings, Users & Passwords |

## 12.4 Super Admin Features

Only the **Super Admin** account can:
- **Delete employees**
- **Reset passwords** for other employees
- Access the **Settings** page
- Edit other superadmin accounts
- Cannot delete their own account
- Cannot change their own role

---

# 13. Customers

## 13.1 Overview

The Customers page (`/customers`) manages customer records.

**Permissions:** Admin, Manager

## 13.2 Customer Fields

| Field | Description |
|-------|-------------|
| Name | Customer name |
| Phone | Optional phone number |
| Email | Optional email address |
| Notes | Optional notes |
| Since | Auto-recorded creation date |

## 13.3 Usage in POS

When adding persons to a split bill, customers from the database appear in a dropdown for quick selection.

---

# 14. Expenses

## 14.1 Overview

The Expenses section tracks business expenses.

**Permissions:** Admin, Manager (manage), others (view)

## 14.2 Expense Fields

| Field | Description |
|-------|-------------|
| Category | Rent / Utilities / Salaries / Supplies / Maintenance / Other |
| Amount | Expense amount |
| Description | Optional description |
| Date | Expense date |

## 14.3 Legacy Migration

On first load, any expenses stored in `localStorage` (`cafe_expenses`) are automatically migrated to the database. This was a fallback from an older version of the system.

---

# 15. Settings & Branding

## 15.1 Overview

The Settings page (`/settings`) allows customization of the cafe's branding.

**Permissions:** Super Admin only

## 15.2 Settings Available

| Setting | Description |
|---------|-------------|
| **App Name** | Custom cafe name displayed throughout the system |
| **Color Theme** | 8 selectable color presets (Café Classic, Coffee Roast, Soft Breeze, Blue Wave, Midnight, Forest, Sunset, Minimal) |
| **Language** | English / العربية |

## 15.3 Theme Colors

Each preset defines:
- `primary` — Main brand color (buttons, headers)
- `accent` — Secondary accent color
- `bg` — Page background
- `section` — Section/card background
- `dark` — Dark text color
- `medium` — Medium text color
- `muted` — Muted/secondary text
- `border` — Border color

---

# 16. Crash Recovery

## 16.1 Overview

The system has built-in crash recovery to prevent data loss when the laptop dies, browser closes, or server crashes.

## 16.2 Data Persistence Summary

| Data | Storage | Crash-Safe? |
|------|---------|-------------|
| Completed orders | SQLite database | ✅ Safe |
| Payments | SQLite database | ✅ Safe |
| Menu items | SQLite database | ✅ Safe |
| Inventory | SQLite database | ✅ Safe |
| Employees | SQLite database | ✅ Safe |
| Customers | SQLite database | ✅ Safe |
| Business days | SQLite database | ✅ Safe |
| Expenses | SQLite database | ✅ Safe |
| Settings/QR code | SQLite database | ✅ Safe |
| POS cart (in progress) | **SQLite database** (auto-saved) | ✅ **Safe** |
| Gaming cart (in progress) | **SQLite database** (auto-saved) | ✅ **Safe** |
| Gaming session | **SQLite database** (auto-saved) | ✅ **Safe** |
| Auth token | localStorage | ⚠️ Re-login needed |
| Employee info | localStorage | ⚠️ Re-login needed |
| Language preference | localStorage | ⚠️ Defaults to English |

## 16.3 Draft Auto-Save

Both **POS** and **Gaming** carts are automatically saved to the `pos_drafts` database table:
- Saves every **2 seconds** (debounced) when the cart changes
- Each employee has their own draft (per-employee saving)
- Draft is **deleted** after successful payment
- On page load, the draft is **restored** with a toast: "♻️ Restored your previous cart"

**What's saved in the POS draft:**
- Order type (Takeaway/Dine-In)
- Selected table
- Cart items with quantities and person assignments
- Discount amount
- Notes
- Person names
- Paid persons

**What's saved in the Gaming draft:**
- All gaming tabs and their carts
- Active tab index
- Active station session (station, start time, rate)

## 16.4 Server Crash Scenarios

| Scenario | Outcome |
|----------|---------|
| Server dies while browser is open | Cart stays in browser memory + localStorage. Once server restarts, everything works again. |
| Server dies + browser refreshed | Page won't load (server is down). Wait for restart, then draft is restored from DB. |
| Server dies mid-payment | If order was created: order exists in DB as pending/unpaid. Cart stays in browser. Can retry or pay via Orders page. If before order creation: nothing lost, cart preserved. |
| Laptop dies (complete power loss) | All DB data safe. POS/gaming drafts in DB. On restart, re-login → navigate to POS/Gaming → draft restored automatically. |

---

# 17. Database Schema

## 17.1 Tables

### employees
```sql
id            INTEGER PRIMARY KEY AUTOINCREMENT
name          TEXT NOT NULL
email         TEXT UNIQUE NOT NULL
password      TEXT NOT NULL (bcrypt hashed)
role          TEXT NOT NULL DEFAULT 'cashier'
phone         TEXT
is_active     INTEGER DEFAULT 1
created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
```

### categories
```sql
id            INTEGER PRIMARY KEY AUTOINCREMENT
name          TEXT NOT NULL
description   TEXT
sort_order    INTEGER DEFAULT 0
icon          TEXT DEFAULT NULL (emoji character)
```

### menu_items
```sql
id                INTEGER PRIMARY KEY AUTOINCREMENT
name              TEXT NOT NULL
description       TEXT
price             REAL NOT NULL
category_id       INTEGER → categories(id)
image             TEXT
is_available      INTEGER DEFAULT 1
preparation_time  INTEGER DEFAULT 5
created_at        DATETIME DEFAULT CURRENT_TIMESTAMP
track_stock       INTEGER DEFAULT 0 (0=no, 1=yes)
stock_quantity     INTEGER DEFAULT 0
cost              REAL DEFAULT 0 (per-unit cost for profit calc)
```

### inventory
```sql
id              INTEGER PRIMARY KEY AUTOINCREMENT
name            TEXT NOT NULL
quantity        REAL NOT NULL DEFAULT 0
unit            TEXT NOT NULL
min_quantity    REAL DEFAULT 10
cost_per_unit   REAL DEFAULT 0
updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP
```

### tables
```sql
id                  INTEGER PRIMARY KEY AUTOINCREMENT
number              INTEGER UNIQUE NOT NULL
seats               INTEGER DEFAULT 4
status              TEXT DEFAULT 'available' (available/occupied/reserved)
section             TEXT DEFAULT 'main'
type                TEXT NOT NULL DEFAULT 'table' (table/playstation/pc/billiards/babyfoot)
hourly_rate         REAL DEFAULT 0.0
session_start       DATETIME DEFAULT NULL
reservation_name    TEXT DEFAULT NULL
reservation_phone   TEXT DEFAULT NULL
```

### orders
```sql
id                INTEGER PRIMARY KEY AUTOINCREMENT
invoice_number    INTEGER DEFAULT NULL
order_type        TEXT NOT NULL DEFAULT 'takeaway' (takeaway/dine-in)
table_id          INTEGER → tables(id)
employee_id       INTEGER → employees(id)
status            TEXT DEFAULT 'pending' (pending/preparing/ready/completed/cancelled)
subtotal          REAL DEFAULT 0
discount          REAL DEFAULT 0
total             REAL DEFAULT 0
payment_method    TEXT
payment_status    TEXT DEFAULT 'unpaid' (unpaid/paid)
notes             TEXT
created_at        DATETIME DEFAULT CURRENT_TIMESTAMP (stored in LOCAL time)
completed_at      DATETIME
```

### order_items
```sql
id              INTEGER PRIMARY KEY AUTOINCREMENT
order_id        INTEGER NOT NULL → orders(id)
menu_item_id    INTEGER NOT NULL → menu_items(id)
quantity        INTEGER NOT NULL DEFAULT 1
unit_price      REAL NOT NULL
total_price     REAL NOT NULL
notes           TEXT
person_label    TEXT DEFAULT NULL (for split bill)
```

### order_persons
```sql
id              INTEGER PRIMARY KEY AUTOINCREMENT
order_id        INTEGER NOT NULL → orders(id)
label           TEXT NOT NULL (person's name)
paid            INTEGER DEFAULT 0 (0=no, 1=yes)
paid_amount     REAL DEFAULT 0
paid_method     TEXT
paid_at         DATETIME
```

### business_days
```sql
id              INTEGER PRIMARY KEY AUTOINCREMENT
date            TEXT UNIQUE NOT NULL (YYYY-MM-DD, local date)
opened_at       DATETIME
closed_at       DATETIME
status          TEXT DEFAULT 'open' (open/closed)
opening_cash    REAL DEFAULT 0
closing_cash    REAL DEFAULT 0
notes           TEXT
```

### customers
```sql
id              INTEGER PRIMARY KEY AUTOINCREMENT
name            TEXT NOT NULL
phone           TEXT
email           TEXT
notes           TEXT
created_at      DATETIME DEFAULT CURRENT_TIMESTAMP
```

### expenses
```sql
id              INTEGER PRIMARY KEY AUTOINCREMENT
category        TEXT NOT NULL (rent/utilities/salaries/supplies/maintenance/other)
amount          REAL NOT NULL
description     TEXT DEFAULT ''
date            TEXT NOT NULL
employee_id     INTEGER → employees(id)
created_at      DATETIME DEFAULT CURRENT_TIMESTAMP
```

### settings
```sql
key             TEXT PRIMARY KEY
value           TEXT
updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP
```

### menu_inventory (recipe linking)
```sql
id                  INTEGER PRIMARY KEY AUTOINCREMENT
menu_item_id        INTEGER NOT NULL → menu_items(id) ON DELETE CASCADE
inventory_item_id   INTEGER NOT NULL → inventory(id) ON DELETE CASCADE
quantity_needed     REAL NOT NULL DEFAULT 1
```

### pos_drafts (crash-safe cart)
```sql
id              INTEGER PRIMARY KEY AUTOINCREMENT
employee_id     INTEGER NOT NULL → employees(id)
draft_data      TEXT NOT NULL (JSON)
updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP
```

---

# 18. API Reference

## 18.1 Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/employees/login` | No | Login, returns JWT token |

## 18.2 Employees

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/employees` | Admin+ | List all employees |
| POST | `/api/employees` | Admin+ | Create employee |
| PUT | `/api/employees/:id` | Admin+ | Update employee |
| DELETE | `/api/employees/:id` | Super Admin | Delete employee |
| POST | `/api/employees/:id/reset-password` | Super Admin | Reset password |

## 18.3 Menu

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/menu/categories` | No | List categories |
| POST | `/api/menu/categories` | Admin+ | Create category |
| PUT | `/api/menu/categories/:id` | Admin+ | Update category |
| DELETE | `/api/menu/categories/:id` | Admin+ | Delete category |
| GET | `/api/menu/items` | No | List menu items |
| GET | `/api/menu/items/:id` | No | Get single item with recipe |
| POST | `/api/menu/items` | Admin+ | Create item |
| PUT | `/api/menu/items/:id` | Admin+ | Update item |
| DELETE | `/api/menu/items/:id` | Admin+ | Delete item |

## 18.4 Inventory

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/inventory` | Auth | List inventory |
| GET | `/api/inventory/low` | Auth | Low stock items |
| POST | `/api/inventory` | Admin+ | Create inventory item |
| PUT | `/api/inventory/:id` | Admin+ | Update item |
| POST | `/api/inventory/:id/adjust` | Auth | Adjust stock (+/-) |
| DELETE | `/api/inventory/:id` | Admin+ | Delete item |

## 18.5 Tables

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/tables` | Auth | List all tables |
| POST | `/api/tables` | Admin+ | Create table |
| PUT | `/api/tables/:id/status` | Auth | Change status |
| PUT | `/api/tables/:id/reserve` | Auth | Reserve table |
| PUT | `/api/tables/:id/cancel-reservation` | Auth | Cancel reservation |
| POST | `/api/tables/:id/start-session` | Auth | Start gaming session |
| POST | `/api/tables/:id/end-session` | Auth | End gaming session |
| GET | `/api/tables/gaming-sessions/active` | Auth | List active sessions |
| POST | `/api/tables/gaming-sessions/end-all` | Manager+ | End all sessions |
| DELETE | `/api/tables/:id` | Admin+ | Delete table |

## 18.6 Orders

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/orders` | Auth | List orders (with filters) |
| GET | `/api/orders/:id` | Auth | Get order with items + persons |
| POST | `/api/orders` | Auth | Create order |
| POST | `/api/orders/:id/items` | Auth | Add items to order |
| POST | `/api/orders/:id/persons` | Auth | Add person to order |
| PUT | `/api/orders/:id/persons/:pid/pay` | Auth | Pay person's share |
| PUT | `/api/orders/:id/status` | Auth | Update status |
| PUT | `/api/orders/:id/payment` | Auth | Process payment |
| PUT | `/api/orders/:id/mark-paid` | Auth | Quick mark as paid |
| PUT | `/api/orders/:id/mark-unpaid` | Auth | Revert to unpaid |
| DELETE | `/api/orders/:id` | Manager+ | Delete order |
| GET | `/api/orders/draft` | Auth | Get saved draft |
| PUT | `/api/orders/draft` | Auth | Save/update draft |
| DELETE | `/api/orders/draft` | Auth | Delete draft |

## 18.7 Reports

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/reports/daily?date=YYYY-MM-DD` | Auth | Daily report |
| GET | `/api/reports/weekly` | Auth | Weekly report |
| GET | `/api/reports/monthly?month=YYYY-MM` | Auth | Monthly report |
| GET | `/api/reports/range?from=&to=` | Auth | Custom range report |
| GET | `/api/reports/net-profit?from=&to=` | Auth | Net profit report |
| GET | `/api/reports/employee` | Manager+ | Employee sales report |

## 18.8 Business Day

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/business-day/today` | Auth | Get today's day status |
| GET | `/api/business-day` | Cashier+ | Get day history |
| POST | `/api/business-day/open` | Cashier+ | Open the day |
| POST | `/api/business-day/close` | Cashier+ | Close the day |
| GET | `/api/business-day/expected-cash` | Auth | Expected cash calculation |

## 18.9 Expenses

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/expenses` | Auth | List expenses (with filters) |
| GET | `/api/expenses/:id` | Auth | Get single expense |
| POST | `/api/expenses` | Auth | Create expense |
| POST | `/api/expenses/bulk` | Manager+ | Bulk import expenses |
| PUT | `/api/expenses/:id` | Manager+ | Update expense |
| DELETE | `/api/expenses/:id` | Manager+ | Delete expense |

## 18.10 Customers

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/customers?search=` | Auth | List/search customers |
| POST | `/api/customers` | Auth | Create customer |
| PUT | `/api/customers/:id` | Auth | Update customer |
| DELETE | `/api/customers/:id` | Auth | Delete customer |

## 18.11 Settings

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/settings/:key` | Public* | Get setting value |
| PUT | `/api/settings/:key` | Manager+ | Set setting value |
| POST | `/api/settings/backup` | Manager+ | Create manual backup |
| GET | `/api/settings/backups` | Auth | List backups |
| POST | `/api/settings/backup/restore` | Manager+ | Restore from backup |

*Public keys (app_name, color_preset, logo) can be read without authentication

---

# 19. Maintenance & Backups

## 19.1 Automatic Backups

The system automatically creates a database backup every day at **4 AM**:
- Backup files are stored in `backend/backups/`
- Filename format: `cafe-backup-YYYY-MM-DDTHHMM.db`
- Keeps the **newest 30 backups** (oldest are automatically deleted)
- WAL checkpoint runs before backup for a consistent snapshot

## 19.2 Manual Backup

1. Go to Settings page
2. Click "Create Backup"
3. A timestamped backup file is created immediately

## 19.3 Manual Restore

1. Go to Settings page
2. Find the backup in the list
3. Click "Restore" next to the desired backup
4. A **safety backup** of the current database is created before restoring
5. If restore fails, the system automatically recovers from the safety backup

## 19.4 Scheduler (Auto-Close)

The auto-close scheduler runs every 15 minutes:
- After 3 AM: automatically closes any previous days' open business days
- Frees occupied tables and gaming stations
- Cancels unpaid orders from previous days (restoring stock)
- Auto-closes days that have been open for more than 4 hours

## 19.5 Database Location

The database file is at: `backend/database/cafe.db`

**Important:** To make a manual backup, copy this file while the server is running — WAL mode allows reads during writes. For maximum safety, use the built-in backup system instead.

---

# Appendices

## A. Keyboard Shortcuts

| Key | Context | Action |
|-----|---------|--------|
| Enter | Person input | Add person |
| Click | Anywhere | Navigate |

## B. Color Presets

| Preset | Primary | Accent | Vibe |
|--------|---------|--------|------|
| Café Classic | `#6f4e37` | `#d4a574` | Warm browns & cream |
| Coffee Roast | `#4a3520` | `#c47e35` | Rich dark coffee tones |
| Soft Breeze | `#7c9eb2` | `#b8d4e3` | Light airy pastels |
| Blue Wave | `#1a5f7a` | `#4a9bbf` | Deep ocean blues |
| Midnight | `#1a1a2e` | `#e94560` | Dark & dramatic |
| Forest | `#2d5a27` | `#8fc27e` | Natural greens |
| Sunset | `#c96b3e` | `#f4a460` | Warm oranges |
| Minimal | `#333333` | `#666666` | Clean & simple |

## C. Default Menu Items

| Item | Category | Price |
|------|----------|-------|
| Tea | Hot Drinks | $1.50 |
| Turkish Coffee | Hot Drinks | $2.00 |
| Cappuccino | Hot Drinks | $3.50 |
| Nescafe | Hot Drinks | $2.50 |
| Espresso | Hot Drinks | $2.00 |
| Hot Chocolate | Hot Drinks | $3.00 |
| Latte | Hot Drinks | $3.50 |
| Mineral Water | Cold Drinks | $1.00 |
| Coca Cola | Cold Drinks | $2.00 |
| Fresh Orange Juice | Cold Drinks | $4.00 |
| Lemonade | Cold Drinks | $3.50 |
| Iced Coffee | Cold Drinks | $3.50 |
| Laziza Drink | Cold Drinks | $3.00 |
| Potato Chips | Snacks | $1.50 |
| Cookies | Snacks | $2.00 |
| Peanuts | Snacks | $1.50 |
| Sandwich | Snacks | $5.00 |
| Croissant | Snacks | $2.50 |
| Playstation Time | Entertainment | $5.00/hr |
| PC Time | Entertainment | $3.00/hr |
| Billiards Time | Entertainment | $8.00/hr |
| Babyfoot Session | Entertainment | $2.00/session |

## D. Default Inventory

| Item | Quantity | Unit |
|------|----------|------|
| Coffee Beans | 5000 | grams |
| Milk | 20 | liters |
| Sugar | 3000 | grams |
| Cups (Small) | 200 | pieces |
| Cups (Large) | 150 | pieces |
| Tea Bags | 100 | pieces |

## E. Default Tables

| Number | Type | Seats | Section | Rate |
|--------|------|-------|---------|------|
| 1 | Table | 2 | Window | — |
| 2 | Table | 2 | Window | — |
| 3 | Table | 4 | Main | — |
| 4 | Table | 4 | Main | — |
| 5 | Table | 6 | Main | — |
| 6 | Playstation | 2 | Gaming | $5.00/hr |
| 7 | Playstation | 2 | Gaming | $5.00/hr |
| 8 | PC | 1 | PC Zone | $3.00/hr |
| 9 | PC | 1 | PC Zone | $3.00/hr |
| 10 | Billiards | 2 | Lounge | $8.00/hr |
| 11 | Babyfoot | 2 | Lounge | $2.00/session |

---

*Document generated from the Cue Corner v4.0 codebase.  
For support, contact Tech Mindset Lb: [https://techmindset-lb.com/](https://techmindset-lb.com/)*
