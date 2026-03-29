# Gas Station Management System — Project Documentation

**Stack:** PostgreSQL · Node.js · Express · React  
**Purpose:** Upload Excel data from a gas station management system, persist it in PostgreSQL, and display KPIs on a React dashboard.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Data Model — Excel Files Analysis](#2-data-model--excel-files-analysis)
3. [PostgreSQL Schema](#3-postgresql-schema)
4. [Project Structure](#4-project-structure)
5. [Backend — Node.js / Express](#5-backend--nodejs--express)
6. [Excel Upload Pipeline](#6-excel-upload-pipeline)
7. [API Endpoints](#7-api-endpoints)
8. [Frontend — React Dashboard](#8-frontend--react-dashboard)
9. [Data Flow Diagram](#9-data-flow-diagram)
10. [Environment & Configuration](#10-environment--configuration)

---

## 1. Project Overview

This system replaces manual Excel-based reporting for a gas station. Staff continue to produce `.xls` files for daily operations. Those files are uploaded through a web interface, parsed on the server, stored in PostgreSQL, and surfaced as charts and KPI cards on a React dashboard.

### Key Capabilities

| Capability | Description |
|---|---|
| Excel ingestion | Upload `.xls` files via a REST endpoint |
| Multi-domain data | Fuel sales, product sales, services, purchases, margins, expenses, receipts |
| Daily state | Consolidated daily snapshot (cash, TPE, credit card, balance) |
| Margin reporting | Per-product, per-service, and per-fuel margin views |
| Dashboard | React app with charts for sales, margins, and cash flow |

---

## 2. Data Model — Excel Files Analysis

The 13 source files map to 10 logical domains:

### 2.1 `venteCarburants.xls` — Fuel Sales

Columns extracted:

| Column | Type | Notes |
|---|---|---|
| `date` | DATE | Sale date |
| `ssp` | DECIMAL | Super Sans Plomb quantity |
| `cumul_ssp` | DECIMAL | Running total SSP |
| `gasoil` | DECIMAL | Gasoil quantity |
| `gasoil_50` | DECIMAL | Gasoil 50 quantity |
| `petrole` | DECIMAL | Pétrole quantity |
| `melange` | DECIMAL | Mélange quantity |
| `total_jour` | DECIMAL | Daily total |
| `total_cumule` | DECIMAL | Cumulative total |

---

### 2.2 `Détails_des_achatsCarburants.xls` — Fuel Purchase Details

| Column | Type | Notes |
|---|---|---|
| `id_cuve` | INTEGER | Tank identifier |
| `cuve` | VARCHAR | Tank name (GASOIL SS, GASOIL, SUPER SANS PLOMB) |
| `quantite` | DECIMAL | Quantity purchased |
| `total` | DECIMAL | Total purchase amount |

---

### 2.3 `Liste_des_AchatsCarburants.xls` — Fuel Purchase List

| Column | Type | Notes |
|---|---|---|
| `achat` | VARCHAR | Purchase reference |
| `date_achat` | DATE | Purchase date |
| `facture` | VARCHAR | Invoice number |
| `date_facture` | DATE | Invoice date |
| `total` | DECIMAL | Invoice total |

---

### 2.4 `Liste_des_Achats.xls` — General Purchases

| Column | Type | Notes |
|---|---|---|
| `date` | DATE | Purchase date |
| `facture` | VARCHAR | Invoice reference |
| `date_facture` | DATE | Invoice date |
| `total` | DECIMAL | Total amount |

---

### 2.5 `VenteProduit.xls` — Product Sales

| Column | Type | Notes |
|---|---|---|
| `date` | DATE | Sale date |
| `produit` | VARCHAR | Product code (e.g., F110, E001) |
| `libelle` | VARCHAR | Product label |
| `prix` | DECIMAL | Unit price |
| `quantite` | DECIMAL | Quantity sold |
| `montant` | DECIMAL | Total amount |
| `famille` | VARCHAR | Product family (e.g., ACCESSOIRES, HUILE) |

---

### 2.6 `VenteService.xls` — Service Sales

| Column | Type | Notes |
|---|---|---|
| `id_service` | INTEGER | Service identifier |
| `date` | DATE | Service date |
| `lib_service` | VARCHAR | Service label (Graissage, Spirax, Transport 20d/30d) |
| `quantite` | DECIMAL | Quantity |
| `ttc_vente_prod` | DECIMAL | Product TTC included in service |
| `pxv_ttc` | DECIMAL | Service sale price TTC |

---

### 2.7 `MargeVenteCar.XLS` — Fuel Margin Report

| Column | Type | Notes |
|---|---|---|
| `id_produit` | INTEGER | Fuel product ID |
| `lib_produit` | VARCHAR | Fuel label (SSP, GASOIL SS, GASOIL) |
| `v_ht_px_achat` | DECIMAL | Purchase value HT |
| `v_ht_px_vente` | DECIMAL | Sale value HT |
| `marge` | DECIMAL | Margin = sale − purchase |

---

### 2.8 `MargeVenteProduit.XLS` — Product Margin Report

| Column | Type | Notes |
|---|---|---|
| `id_produit` | INTEGER | Product ID |
| `lib_produit` | VARCHAR | Product label |
| `quantite` | DECIMAL | Quantity sold |
| `v_ht_px_achat` | DECIMAL | Purchase value HT |
| `v_ht_px_vente` | DECIMAL | Sale value HT |
| `marge` | DECIMAL | Margin |

---

### 2.9 `MargeVenteService.XLS` — Service Margin Report

| Column | Type | Notes |
|---|---|---|
| `service` | INTEGER | Service ID |
| `libelle` | VARCHAR | Service name |
| `quantite` | DECIMAL | Quantity |
| `v_ht_px_achat` | DECIMAL | Cost value HT |
| `v_ht_px_vente` | DECIMAL | Sale value HT |
| `marge` | DECIMAL | Margin |

---

### 2.10 `Recette.xls` — Receipts / Cash Register

| Column | Type | Notes |
|---|---|---|
| `date` | DATE | Date |
| `vendeur` | VARCHAR | Seller name (Makrem, Mouldi, Kamel, Adel, Lotfi, Omar, Jassem…) |
| `mode` | VARCHAR | Payment mode (Espèce, Traite, Carte Bancaire, Virement, Retrait T…) |
| `montant` | DECIMAL | Amount collected |

---

### 2.11 `Depense.xls` — Expenses

| Column | Type | Notes |
|---|---|---|
| `date` | DATE | Expense date |
| `vendeur` | VARCHAR | Vendor/supplier name |
| `type` | VARCHAR | Expense type (Nettoyage, Réparation, Facture STEG, Fourniture…) |
| `montant` | DECIMAL | Amount |

---

### 2.12 `Statistique.xls` / `dailystate.xls` — Daily State

Both files share the same structure (daily consolidated snapshot):

| Column | Type | Notes |
|---|---|---|
| `date` | DATE | Day |
| `ttc_carb` | DECIMAL | Fuel sales TTC |
| `ttc_prt_gaz` | DECIMAL | Products/gas TTC |
| `ht_prt_gaz` | DECIMAL | Products/gas HT |
| `ttc_service` | DECIMAL | Services TTC |
| `espece` | DECIMAL | Cash collected |
| `tpe2` | DECIMAL | TPE terminal 2 |
| `carte_b` | DECIMAL | Bank card |
| `autres` | DECIMAL | Other payments |
| `total_vente` | DECIMAL | Total sales |
| `total_r` | DECIMAL | Total receipts |
| `dep_caisse` | DECIMAL | Cash expenses |
| `cred_anter` | DECIMAL | Previous credit/balance |
| `solde` | DECIMAL | End-of-day balance |

---

## 3. PostgreSQL Schema

```sql
-- ─────────────────────────────────────────
-- FUEL
-- ─────────────────────────────────────────

CREATE TABLE vente_carburants (
  id             SERIAL PRIMARY KEY,
  date           DATE NOT NULL,
  ssp            DECIMAL(12,3),
  cumul_ssp      DECIMAL(12,3),
  gasoil         DECIMAL(12,3),
  gasoil_50      DECIMAL(12,3),
  petrole        DECIMAL(12,3),
  melange        DECIMAL(12,3),
  total_jour     DECIMAL(12,3),
  total_cumule   DECIMAL(12,3),
  uploaded_at    TIMESTAMP DEFAULT NOW()
);

CREATE TABLE achat_carburants (
  id             SERIAL PRIMARY KEY,
  achat          VARCHAR(100),
  date_achat     DATE,
  facture        VARCHAR(100),
  date_facture   DATE,
  total          DECIMAL(12,3),
  uploaded_at    TIMESTAMP DEFAULT NOW()
);

CREATE TABLE detail_achat_carburants (
  id             SERIAL PRIMARY KEY,
  achat_id       INTEGER REFERENCES achat_carburants(id) ON DELETE CASCADE,
  id_cuve        INTEGER,
  cuve           VARCHAR(50),
  quantite       DECIMAL(12,3),
  total          DECIMAL(12,3)
);

-- ─────────────────────────────────────────
-- PRODUCTS
-- ─────────────────────────────────────────

CREATE TABLE vente_produits (
  id             SERIAL PRIMARY KEY,
  date           DATE NOT NULL,
  produit        VARCHAR(50),
  libelle        VARCHAR(200),
  prix           DECIMAL(12,3),
  quantite       DECIMAL(12,3),
  montant        DECIMAL(12,3),
  famille        VARCHAR(100),
  uploaded_at    TIMESTAMP DEFAULT NOW()
);

CREATE TABLE achat_produits (
  id             SERIAL PRIMARY KEY,
  date           DATE,
  facture        VARCHAR(100),
  date_facture   DATE,
  total          DECIMAL(12,3),
  uploaded_at    TIMESTAMP DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- SERVICES
-- ─────────────────────────────────────────

CREATE TABLE vente_services (
  id             SERIAL PRIMARY KEY,
  id_service     INTEGER,
  date           DATE NOT NULL,
  lib_service    VARCHAR(100),
  quantite       DECIMAL(12,3),
  ttc_vente_prod DECIMAL(12,3),
  pxv_ttc        DECIMAL(12,3),
  uploaded_at    TIMESTAMP DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- MARGINS
-- ─────────────────────────────────────────

CREATE TABLE marge_carburants (
  id             SERIAL PRIMARY KEY,
  id_produit     INTEGER,
  lib_produit    VARCHAR(100),
  v_ht_px_achat  DECIMAL(12,5),
  v_ht_px_vente  DECIMAL(12,5),
  marge          DECIMAL(12,5),
  uploaded_at    TIMESTAMP DEFAULT NOW()
);

CREATE TABLE marge_produits (
  id             SERIAL PRIMARY KEY,
  id_produit     INTEGER,
  lib_produit    VARCHAR(200),
  quantite       DECIMAL(12,3),
  v_ht_px_achat  DECIMAL(12,3),
  v_ht_px_vente  DECIMAL(12,3),
  marge          DECIMAL(12,3),
  uploaded_at    TIMESTAMP DEFAULT NOW()
);

CREATE TABLE marge_services (
  id             SERIAL PRIMARY KEY,
  service        INTEGER,
  libelle        VARCHAR(100),
  quantite       DECIMAL(12,3),
  v_ht_px_achat  DECIMAL(12,3),
  v_ht_px_vente  DECIMAL(12,3),
  marge          DECIMAL(12,3),
  uploaded_at    TIMESTAMP DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- RECEIPTS & EXPENSES
-- ─────────────────────────────────────────

CREATE TABLE recettes (
  id             SERIAL PRIMARY KEY,
  date           DATE NOT NULL,
  vendeur        VARCHAR(100),
  mode           VARCHAR(50),
  montant        DECIMAL(12,3),
  uploaded_at    TIMESTAMP DEFAULT NOW()
);

CREATE TABLE depenses (
  id             SERIAL PRIMARY KEY,
  date           DATE NOT NULL,
  vendeur        VARCHAR(100),
  type           VARCHAR(200),
  montant        DECIMAL(12,3),
  uploaded_at    TIMESTAMP DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- DAILY STATE
-- ─────────────────────────────────────────

CREATE TABLE daily_state (
  id             SERIAL PRIMARY KEY,
  date           DATE NOT NULL UNIQUE,
  ttc_carb       DECIMAL(12,3),
  ttc_prt_gaz    DECIMAL(12,3),
  ht_prt_gaz     DECIMAL(12,3),
  ttc_service    DECIMAL(12,3),
  espece         DECIMAL(12,3),
  tpe2           DECIMAL(12,3),
  carte_b        DECIMAL(12,3),
  autres         DECIMAL(12,3),
  total_vente    DECIMAL(12,3),
  total_r        DECIMAL(12,3),
  dep_caisse     DECIMAL(12,3),
  cred_anter     DECIMAL(12,3),
  solde          DECIMAL(12,3),
  uploaded_at    TIMESTAMP DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- UPLOAD AUDIT LOG
-- ─────────────────────────────────────────

CREATE TABLE upload_log (
  id             SERIAL PRIMARY KEY,
  filename       VARCHAR(200) NOT NULL,
  table_target   VARCHAR(100),
  rows_inserted  INTEGER,
  uploaded_at    TIMESTAMP DEFAULT NOW(),
  status         VARCHAR(20) DEFAULT 'success',
  error_message  TEXT
);
```

---

## 4. Project Structure

```
gas-station-app/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js               # pg Pool configuration
│   │   ├── controllers/
│   │   │   ├── upload.controller.js
│   │   │   ├── dashboard.controller.js
│   │   │   ├── ventes.controller.js
│   │   │   ├── achats.controller.js
│   │   │   ├── marges.controller.js
│   │   │   └── dailystate.controller.js
│   │   ├── routes/
│   │   │   ├── upload.routes.js
│   │   │   ├── dashboard.routes.js
│   │   │   ├── ventes.routes.js
│   │   │   ├── achats.routes.js
│   │   │   ├── marges.routes.js
│   │   │   └── dailystate.routes.js
│   │   ├── parsers/
│   │   │   ├── venteCarburants.parser.js
│   │   │   ├── venteProduit.parser.js
│   │   │   ├── venteService.parser.js
│   │   │   ├── achatCarburants.parser.js
│   │   │   ├── achatProduits.parser.js
│   │   │   ├── margeVenteCar.parser.js
│   │   │   ├── margeVenteProduit.parser.js
│   │   │   ├── margeVenteService.parser.js
│   │   │   ├── recette.parser.js
│   │   │   ├── depense.parser.js
│   │   │   └── dailystate.parser.js
│   │   ├── middleware/
│   │   │   ├── upload.middleware.js  # multer config
│   │   │   └── error.middleware.js
│   │   └── app.js
│   ├── migrations/
│   │   └── 001_init_schema.sql
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── index.js             # axios base + endpoints
│   │   ├── components/
│   │   │   ├── KPICard.jsx
│   │   │   ├── UploadPanel.jsx
│   │   │   ├── DateRangePicker.jsx
│   │   │   └── charts/
│   │   │       ├── FuelSalesChart.jsx
│   │   │       ├── ProductSalesChart.jsx
│   │   │       ├── MarginChart.jsx
│   │   │       ├── DailyBalanceChart.jsx
│   │   │       └── PaymentBreakdownChart.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Ventes.jsx
│   │   │   ├── Achats.jsx
│   │   │   ├── Marges.jsx
│   │   │   ├── DailyState.jsx
│   │   │   └── Upload.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

---

## 5. Backend — Node.js / Express

### 5.1 `db.js` — Database Connection

```js
// backend/src/config/db.js
const { Pool } = require('pg');

const pool = new Pool({
  host:     process.env.DB_HOST,
  port:     process.env.DB_PORT,
  database: process.env.DB_NAME,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

module.exports = pool;
```

### 5.2 `app.js` — Express Entry Point

```js
// backend/src/app.js
const express = require('express');
const cors    = require('cors');
const app     = express();

app.use(cors());
app.use(express.json());

app.use('/api/upload',     require('./routes/upload.routes'));
app.use('/api/dashboard',  require('./routes/dashboard.routes'));
app.use('/api/ventes',     require('./routes/ventes.routes'));
app.use('/api/achats',     require('./routes/achats.routes'));
app.use('/api/marges',     require('./routes/marges.routes'));
app.use('/api/dailystate', require('./routes/dailystate.routes'));

app.use(require('./middleware/error.middleware'));

module.exports = app;
```

---

## 6. Excel Upload Pipeline

### 6.1 Multer Middleware

```js
// backend/src/middleware/upload.middleware.js
const multer  = require('multer');
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.originalname.match(/\.(xls|xlsx)$/i)) cb(null, true);
    else cb(new Error('Only .xls/.xlsx files are accepted'));
  },
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

module.exports = upload;
```

### 6.2 File → Parser Routing

The upload controller determines the correct parser from the filename:

```js
// backend/src/controllers/upload.controller.js
const xlsx    = require('xlsx');
const pool    = require('../config/db');
const parsers = require('../parsers');   // barrel export

const FILE_MAP = {
  'venteCarburants':             { parser: parsers.venteCarburants,    table: 'vente_carburants' },
  'VenteProduit':                { parser: parsers.venteProduit,       table: 'vente_produits' },
  'VenteService':                { parser: parsers.venteService,       table: 'vente_services' },
  'Liste_des_AchatsCarburants':  { parser: parsers.achatCarburants,    table: 'achat_carburants' },
  'Détails_des_achatsCarburants':{ parser: parsers.detailAchat,        table: 'detail_achat_carburants' },
  'Liste_des_Achats':            { parser: parsers.achatProduits,      table: 'achat_produits' },
  'MargeVenteCar':               { parser: parsers.margeVenteCar,      table: 'marge_carburants' },
  'MargeVenteProduit':           { parser: parsers.margeVenteProduit,  table: 'marge_produits' },
  'MargeVenteService':           { parser: parsers.margeVenteService,  table: 'marge_services' },
  'Recette':                     { parser: parsers.recette,            table: 'recettes' },
  'Depense':                     { parser: parsers.depense,            table: 'depenses' },
  'Statistique':                 { parser: parsers.dailyState,         table: 'daily_state' },
  'dailystate':                  { parser: parsers.dailyState,         table: 'daily_state' },
};

exports.uploadFile = async (req, res, next) => {
  try {
    const originalName = req.file.originalname.replace(/\.(xls|xlsx)$/i, '');
    const match = Object.keys(FILE_MAP).find(k =>
      originalName.toLowerCase().includes(k.toLowerCase())
    );

    if (!match) return res.status(400).json({ error: `Unknown file: ${originalName}` });

    const { parser, table } = FILE_MAP[match];

    const workbook = xlsx.read(req.file.buffer, { type: 'buffer', cellDates: true });
    const sheet    = workbook.Sheets[workbook.SheetNames[0]];
    const rawData  = xlsx.utils.sheet_to_json(sheet, { defval: null });

    const rows = parser(rawData);

    // Bulk insert with pg
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      let count = 0;
      for (const row of rows) {
        const keys   = Object.keys(row);
        const vals   = Object.values(row);
        const params = keys.map((_, i) => `$${i + 1}`).join(', ');
        await client.query(
          `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${params})`,
          vals
        );
        count++;
      }
      await client.query(
        `INSERT INTO upload_log (filename, table_target, rows_inserted)
         VALUES ($1, $2, $3)`,
        [req.file.originalname, table, count]
      );
      await client.query('COMMIT');
      res.json({ success: true, table, rows: count });
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  } catch (err) {
    next(err);
  }
};
```

### 6.3 Example Parser — `venteCarburants.parser.js`

```js
// backend/src/parsers/venteCarburants.parser.js
module.exports = function parseVenteCarburants(rows) {
  return rows
    .filter(r => r['Date'] || r['date'])
    .map(r => ({
      date:         r['Date']         || r['date'],
      ssp:          r['S S P']        ?? null,
      cumul_ssp:    r['CUMUL']        ?? null,
      gasoil:       r['GASOIL']       ?? null,
      gasoil_50:    r['GASOIL 50']    ?? null,
      petrole:      r['PETROLE']      ?? null,
      melange:      r['MELANGE']      ?? null,
      total_jour:   r['TOTAL JOUR']   ?? null,
      total_cumule: r['TOTAL CUMULE'] ?? null,
    }));
};
```

> Each parser follows the same pattern: map raw column names from the Excel to the DB column names, filter out empty rows, and return an array of plain objects.

---

## 7. API Endpoints

### Upload

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/upload` | Upload one `.xls` file (multipart/form-data, field: `file`) |
| `GET` | `/api/upload/log` | List upload history |

### Dashboard (aggregates)

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/dashboard/kpis?from=&to=` | Main KPI summary for date range |
| `GET` | `/api/dashboard/daily?from=&to=` | Daily totals for chart |

### Fuel Sales

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/ventes/carburants?from=&to=` | Fuel sales by date |
| `GET` | `/api/ventes/produits?from=&to=` | Product sales |
| `GET` | `/api/ventes/services?from=&to=` | Service sales |

### Purchases

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/achats/carburants?from=&to=` | Fuel purchase list |
| `GET` | `/api/achats/produits?from=&to=` | General purchase list |

### Margins

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/marges/carburants` | Fuel margin report |
| `GET` | `/api/marges/produits` | Product margin report |
| `GET` | `/api/marges/services` | Service margin report |

### Daily State

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/dailystate?from=&to=` | Daily consolidated state |
| `GET` | `/api/dailystate/recettes?from=&to=` | Receipts by date/seller |
| `GET` | `/api/dailystate/depenses?from=&to=` | Expenses by date/type |

---

## 8. Frontend — React Dashboard

### 8.1 Pages

| Page | Route | Description |
|---|---|---|
| Dashboard | `/` | KPI cards + main charts |
| Daily State | `/daily` | Date-range table of daily balance |
| Fuel Sales | `/ventes/carburants` | Daily fuel volumes chart |
| Product Sales | `/ventes/produits` | Product family breakdown |
| Services | `/ventes/services` | Service sales table |
| Margins | `/marges` | Margin comparison per domain |
| Purchases | `/achats` | Purchase lists |
| Upload | `/upload` | File upload panel |

### 8.2 KPI Cards (Dashboard)

Displayed for the selected date range:

- **Total Sales TTC** (Fuel + Products + Services)
- **Total Receipts** (Espèce + TPE + Carte)
- **End-of-Day Balance** (solde)
- **Total Expenses** (dep_caisse)
- **Fuel Margin** (sum of marge_carburants)
- **Product Margin** (sum of marge_produits)

### 8.3 Charts

| Chart | Data source | Library |
|---|---|---|
| Fuel Sales over time | `vente_carburants` | Recharts LineChart |
| Daily Balance | `daily_state.solde` | Recharts AreaChart |
| Payment Breakdown (pie) | `daily_state` espece/tpe/carte | Recharts PieChart |
| Margin by fuel product | `marge_carburants` | Recharts BarChart |
| Top products by margin | `marge_produits` | Recharts BarChart |
| Revenue vs Expenses | `daily_state` | Recharts ComposedChart |

### 8.4 Upload Component

```jsx
// frontend/src/pages/Upload.jsx (outline)
// - Drag-and-drop or file picker
// - Accepts .xls / .xlsx
// - POST to /api/upload
// - Shows progress, success row count, or error message
// - Displays upload_log table below
```

---

## 9. Data Flow Diagram

```
Excel File (.xls)
      │
      ▼
[React Upload Page]
  POST /api/upload  (multipart)
      │
      ▼
[Express Upload Controller]
  multer → buffer
  xlsx.read() → raw JSON rows
  filename → parser lookup
      │
      ▼
[Parser Function]
  raw rows → normalized objects
      │
      ▼
[PostgreSQL]
  BEGIN → bulk INSERT → COMMIT
  INSERT upload_log
      │
      ▼
[Express API Routes]
  GET /api/dashboard/kpis
  GET /api/ventes/carburants
  ... etc.
      │
      ▼
[React Dashboard]
  KPI Cards + Charts
```

---

## 10. Environment & Configuration

### `backend/.env`

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=gas_station
DB_USER=postgres
DB_PASSWORD=your_password
PORT=4000
```

### `backend/package.json` — Key Dependencies

```json
{
  "dependencies": {
    "express":    "^4.18",
    "pg":         "^8.11",
    "xlsx":       "^0.18",
    "multer":     "^1.4",
    "cors":       "^2.8",
    "dotenv":     "^16"
  }
}
```

### `frontend/package.json` — Key Dependencies

```json
{
  "dependencies": {
    "react":        "^18",
    "react-router-dom": "^6",
    "axios":        "^1.6",
    "recharts":     "^2.10",
    "dayjs":        "^1.11"
  }
}
```

### Running Locally

```bash
# Database
psql -U postgres -c "CREATE DATABASE gas_station;"
psql -U postgres -d gas_station -f backend/migrations/001_init_schema.sql

# Backend
cd backend && npm install && npm run dev   # nodemon, port 4000

# Frontend
cd frontend && npm install && npm run dev  # vite, port 5173
```

---

*Documentation generated from analysis of 13 source Excel files.*