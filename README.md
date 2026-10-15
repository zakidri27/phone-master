<div align="center">

<img src="docs/assets/logo.png" alt="Phone Master" width="120" />

# Phone Master

**An offline-first desktop system for managing a mobile phone sales & repair shop**

[![Release](https://img.shields.io/github/v/release/zakidri27/phone-master?style=for-the-badge&color=6366f1)](https://github.com/zakidri27/phone-master/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-22c55e?style=for-the-badge)](LICENSE)
[![Platform](https://img.shields.io/badge/Platform-Windows-0ea5e9?style=for-the-badge)](#-installation)
[![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=nextdotjs)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react&logoColor=000)](https://react.dev)
[![Electron](https://img.shields.io/badge/Electron-Desktop-47848f?style=for-the-badge&logo=electron)](https://www.electronjs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Embedded-4169e1?style=for-the-badge&logo=postgresql&logoColor=fff)](https://www.postgresql.org)

[Product page](https://zakidri27.github.io/phone-master/) · [Download](https://github.com/zakidri27/phone-master/releases/latest) · [Report an issue](https://github.com/zakidri27/phone-master/issues)

</div>

---

## Overview

**Phone Master** is a professional **Electron desktop application** for running a phone
sales & repair shop end-to-end: inventory, point of sale, invoicing, repairs, installments,
expenses, profits and reporting.

The application is **fully offline-first**: a local Next.js server runs inside Electron and an
**embedded PostgreSQL** database is provisioned automatically on first launch — with **zero
manual configuration** for the end user.

---

## Key Features

| Module | Description |
|--------|-------------|
| 📦 **Inventory** | Manage phones and accessories with brand, model, color, storage, RAM, IMEI, cost/sell price, categories and low-stock alerts. |
| 🧾 **Point of Sale (Cashier)** | Fast invoicing, discounts, multiple payment methods and receipt printing. |
| 💰 **Sales** | Orders, customer linkage and daily/total sales tracking. |
| 🛒 **Purchases** | Supplier invoices and stock restocking. |
| 🔧 **Repairs** | Repair tickets, fault diagnosis, spare parts, technician assignment, status tracking (received → repairing → completed) and advance payments. |
| 📅 **Installments** | Down payment, monthly installment schedule, remaining balance, due dates and payment history. |
| 💸 **Expenses** | Categorized store expenses with payment methods. |
| 📈 **Profits** | Profit analysis (cost vs. sell price) and clear profitability reporting. |
| 📊 **Reports** | Detailed reports with **Excel export**. |
| 👷 **Workers** | Roles, salaries and per-page access control via **PIN**. |
| ⚙️ **Settings** | Store name, logo, currency, tax rate, receipt footer and manager PIN. |
| 🛡️ **Backup** | Database backup and restore. |

### General

- 🌐 **Bilingual (Arabic / English)** with full **RTL** support.
- 🌙 **Dark / light theme**.
- 📴 **Works offline** — your data stays on your machine.
- 🖥️ **Native desktop app** with a fast, rich interface.

---

## Modules & Pages

```text
Login  →  Dashboard  →  { Cashier · Inventory · Sales · Purchases ·
                          Repairs · Installments · Expenses · Profits ·
                          Reports · Workers · Settings · Backup }
```

**API Routes:** `auth` · `products` · `customers` · `sales` · `purchases` · `repairs` ·
`installments` · `expenses` · `profits` · `reports` · `dashboard` · `settings` · `store` ·
`workers` · `upload` · `backup` · `export-excel` · `reset` · `seed` · `health`

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **UI** | Next.js 16 · React 19 · Tailwind CSS · Lucide React |
| **Desktop** | Electron (single-instance, splash screen, security hardening) |
| **Database** | PostgreSQL (embedded) · Drizzle ORM · `pg` driver |
| **Tooling** | ExcelJS (Excel export) · date-fns · dotenv · electron-builder |

---

## Architecture

```text
┌────────────────────────────  Electron  ────────────────────────────┐
│                                                                    │
│   1) ensureDatabase()  ──►  checks DATABASE_URL, then the system   │
│                              PostgreSQL; otherwise starts an       │
│                              embedded PostgreSQL on a free local   │
│                              port (5432–5452)                       │
│                                                                    │
│   2) startNextServer() ──►  runs the Next.js server in-process     │
│                              on http://127.0.0.1:3179               │
│                                                                    │
│   3) createWindow()    ──►  secure window (contextIsolation +      │
│                              sandbox + external network blocking)  │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

- **Fully offline**: the app touches no external network; all traffic is bound to `127.0.0.1`.
- **Portable database**: if PostgreSQL is available on port 5432 it is reused; otherwise a fully
  self-contained embedded instance runs inside the user's data directory.

### Security

- `contextIsolation: true`, `nodeIntegration: false` and `sandbox: true`.
- **Blocks all external network requests** via `webRequest.onBeforeRequest`.
- Disables DevTools and function keys (`F12`, `Ctrl+Shift+I`, `Ctrl+U`, …).
- Single-instance lock to prevent running two copies at once.

---

## Installation

### End users (Windows)

1. Download the installer from the [Releases](https://github.com/zakidri27/phone-master/releases/latest) page.
2. Run `PhoneMaster-Setup-1.0.0.exe` and follow the setup steps.
3. Launch **Phone Master** — the database is provisioned automatically on first run.

> The app is not code-signed, so Windows SmartScreen may warn you. Click **More info → Run anyway**.

### For developers

```bash
# 1) Install dependencies
npm install

# 2) Run the Next.js UI in development mode
npm run dev

# 3) Launch the Electron app
npm run electron:dev

# 4) Build the production app and the Electron installer
npm run electron:build
```

**(Optional)** To use an external database, create a `.env` file next to the app:

```env
DATABASE_URL=postgresql://postgres:password@127.0.0.1:5432/app_db
```

---

## Project Structure

```text
phone-master/
├── electron/
│   ├── main.js          # Electron main process (window, security, server boot)
│   ├── preload.js       # Preload script (isolated context)
│   ├── db-setup.cjs     # PostgreSQL provisioning + schema (DDL)
│   └── bundled-pg.cjs   # Embedded PostgreSQL launcher
├── docs/                # GitHub Pages product page
│   ├── index.html
│   ├── style.css
│   └── assets/logo.png
├── package.json
├── next.config.ts
└── README.md
```

---

## Contributing

Contributions are welcome. Open an *Issue* to discuss a change, or submit a *Pull Request*.

## License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

Made with ❤️ by **Zaki** · © 2026

⭐ If you like the project, please leave a star!

</div>
