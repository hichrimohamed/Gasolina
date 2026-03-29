# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**Full spec:** `PROJECT_DOCUMENTATION.md` — read before any structural decisions.

---

## Commands

```bash
# Backend (port 4000)
cd backend && npm run dev          # nodemon src/server.js
cd backend && npm start            # node src/server.js
cd backend && npm test             # jest --testPathPattern=src/tests

# Frontend (port 5173)
cd frontend && npm run dev         # vite
cd frontend && npm run build       # vite build
cd frontend && npm run lint        # eslint .

# DB migration
cd backend && npm run migrate      # psql via Postgres.app
```

`backend/.env` required:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=gaolina_db
DB_USER=mohamedhichri
DB_PASSWORD=
PORT=4000
```

Postgres.app binary: `/Applications/Postgres.app/Contents/Versions/latest/bin/psql`
Connect: `psql -U mohamedhichri -d gaolina_db`

---

## Architecture

**Stack:** Node.js · Express · PostgreSQL (`pg`) · `xlsx` · `multer` | React · Vite · Recharts · Axios

### Upload pipeline (critical path)
`POST /api/upload` → multer buffer (10 MB, .xls/.xlsx only, memory storage) → filename normalized → `FILE_MAP` lookup (case-insensitive substring match) → parser → bulk INSERT in single transaction → `upload_log`

The `FILE_MAP` in `upload.controller.js` maps filename substrings to `{ table, parser }`. Adding support for a new file type means adding an entry there.

### Parser conventions
All parsers live in `backend/src/parsers/` and export a function `(rows) => records[]` where `rows` comes from `xlsx.utils.sheet_to_json`.

**Known gotchas when writing or debugging parsers:**
- Excel column names often have **leading/trailing whitespace** — always normalize keys with `for (const [k,v] of Object.entries(r)) norm[k.trim()] = v` before lookup (see `recette.parser.js`, `depense.parser.js`).
- Use `??` (nullish coalescing), **not** `||`, when a field can legitimately be `0` — `||` drops zero values as falsy (hit in `marge_services.vht_px_achat`).
- Excel column names may use accented chars (`Chèque`, `Crédit`, `Réglé`), dots (`TTC Carb.`), slashes (`TTC Prt/gaz`, `cred/anter`), or underscores (`Id_service`, `Ttc_vente_prod`) — always add those exact variants as the first `??` option before spaced/lowercase fallbacks.
- `filter` rows on a date field before `map` to skip header/footer rows that xlsx picks up.

### DB schema
12 tables in `backend/migrations/001_init_schema.sql`. Key tables:
- `vente_carburants` — UNIQUE on `date_vente` (upsert on re-upload)
- `daily_state` — UNIQUE on `date_stat` (upsert on re-upload)
- `details_achats_carburants.achat_id` → `liste_des_achats_carburants.id` (nullable FK, set manually)

### Column aliasing (controllers → frontend)
DB column names differ from the original spec. Controllers alias them:
- `date_vente / date_stat / date_rec / date_dep` → `date`
- `vht_px_achat / vht_px_vente` → `v_ht_px_achat / v_ht_px_vente`
- `total_regle` → `total_r` | `cred_anterieur` → `cred_anter`
- `recette.ttc` → `montant` | `recette.mode_pmt` → `mode`
- `depense.ttc` → `montant` | `depense.type_dep` → `type`

### Frontend data flow
All API calls go through `frontend/src/api/index.js` (axios instance). Date filtering: `?from=YYYY-MM-DD&to=YYYY-MM-DD` on all list endpoints.

Routes: Dashboard · Ventes · Achats · Marges · DailyState · Upload (6 pages total, defined in `App.jsx`).

---

## Status

All backend and frontend features are complete. Testing and Docker/deployment have not been started.
