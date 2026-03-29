-- ─────────────────────────────────────────
-- FUEL
-- ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS vente_carburants (
  id              SERIAL PRIMARY KEY,
  date_vente      DATE NOT NULL,
  ssp             DECIMAL(12,3),
  ssp_cumul       DECIMAL(12,3),
  gasoil          DECIMAL(12,3),
  gasoil_cumul    DECIMAL(12,3),
  gasoil50        DECIMAL(12,3),
  gasoil50_cumul  DECIMAL(12,3),
  total_jour      DECIMAL(12,3),
  total_cumule    DECIMAL(12,3),
  uploaded_at     TIMESTAMP DEFAULT NOW(),
  UNIQUE (date_vente)
);

CREATE TABLE IF NOT EXISTS achat_carburants (
  id              SERIAL PRIMARY KEY,
  num_achat       INTEGER,
  date_achat      DATE,
  num_facture     VARCHAR(100),
  date_facture    DATE,
  total           DECIMAL(12,3),
  uploaded_at     TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS detail_achat_carburants (
  id              SERIAL PRIMARY KEY,
  achat_id        INTEGER REFERENCES achat_carburants(id) ON DELETE CASCADE,
  id_cuve         INTEGER,
  cuve            VARCHAR(50),
  quantite        DECIMAL(12,3),
  total           DECIMAL(12,3)
);

-- ─────────────────────────────────────────
-- PRODUCTS
-- ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS vente_produits (
  id              SERIAL PRIMARY KEY,
  date_vente      DATE NOT NULL,
  produit_code    VARCHAR(50),
  libelle         VARCHAR(200),
  prix            DECIMAL(12,3),
  quantite        DECIMAL(12,3),
  montant         DECIMAL(12,3),
  famille         VARCHAR(100),
  uploaded_at     TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS achat_produits (
  id              SERIAL PRIMARY KEY,
  date_achat      DATE,
  num_facture     VARCHAR(100),
  date_facture    DATE,
  total           DECIMAL(12,3),
  uploaded_at     TIMESTAMP DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- SERVICES
-- ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS vente_services (
  id              SERIAL PRIMARY KEY,
  id_service      INTEGER,
  date_vente      DATE NOT NULL,
  lib_service     VARCHAR(100),
  quantite        DECIMAL(12,3),
  ttc_vente_prod  DECIMAL(12,3),
  pxv_ttc         DECIMAL(12,3),
  uploaded_at     TIMESTAMP DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- MARGINS
-- ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS marge_carburants (
  id              SERIAL PRIMARY KEY,
  id_produit      INTEGER,
  lib_produit     VARCHAR(100),
  vht_px_achat    DECIMAL(12,5),
  vht_px_vente    DECIMAL(12,5),
  marge           DECIMAL(12,5),
  report_date     DATE,
  uploaded_at     TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS marge_produits (
  id              SERIAL PRIMARY KEY,
  id_produit      INTEGER,
  lib_produit     VARCHAR(200),
  quantite        DECIMAL(12,3),
  vht_px_achat    DECIMAL(12,3),
  vht_px_vente    DECIMAL(12,3),
  marge           DECIMAL(12,3),
  report_date     DATE,
  uploaded_at     TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS marge_services (
  id              SERIAL PRIMARY KEY,
  id_service      INTEGER,
  libelle         VARCHAR(100),
  quantite        DECIMAL(12,3),
  vht_px_achat    DECIMAL(12,3),
  vht_px_vente    DECIMAL(12,3),
  marge           DECIMAL(12,3),
  report_date     DATE,
  uploaded_at     TIMESTAMP DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- RECEIPTS & EXPENSES
-- ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS recettes (
  id              SERIAL PRIMARY KEY,
  date_rec        DATE NOT NULL,
  vendeur         VARCHAR(100),
  mode_pmt        VARCHAR(50),
  ttc             DECIMAL(12,3),
  uploaded_at     TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS depenses (
  id              SERIAL PRIMARY KEY,
  date_dep        DATE NOT NULL,
  vendeur         VARCHAR(100),
  type_dep        VARCHAR(200),
  ttc             DECIMAL(12,3),
  uploaded_at     TIMESTAMP DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- DAILY STATE
-- ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS daily_state (
  id              SERIAL PRIMARY KEY,
  date_stat       DATE NOT NULL,
  ttc_carb        DECIMAL(12,3),
  ttc_prt_gaz     DECIMAL(12,3),
  ht_prt_gaz      DECIMAL(12,3),
  ttc_service     DECIMAL(12,3),
  espece          DECIMAL(12,3),
  cheque          DECIMAL(12,3),
  tpe             DECIMAL(12,3),
  tpe2            DECIMAL(12,3),
  carte_b         DECIMAL(12,3),
  credit          DECIMAL(12,3),
  autres          DECIMAL(12,3),
  total_vente     DECIMAL(12,3),
  total_regle     DECIMAL(12,3),
  dep_caisse      DECIMAL(12,3),
  cred_anterieur  DECIMAL(12,3),
  solde           DECIMAL(12,3),
  uploaded_at     TIMESTAMP DEFAULT NOW(),
  UNIQUE (date_stat)
);

-- ─────────────────────────────────────────
-- UPLOAD AUDIT LOG
-- ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS upload_log (
  id              SERIAL PRIMARY KEY,
  filename        VARCHAR(200) NOT NULL,
  table_target    VARCHAR(100),
  rows_inserted   INTEGER,
  uploaded_at     TIMESTAMP DEFAULT NOW(),
  status          VARCHAR(20) DEFAULT 'success',
  error_message   TEXT
);
