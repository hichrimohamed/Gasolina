-- ─────────────────────────────────────────
-- CALENDAR EVENTS
-- ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS calendar_events (
  id          SERIAL PRIMARY KEY,
  type        VARCHAR(20)  NOT NULL CHECK (type IN ('livraison', 'facture', 'paiement')),
  title       VARCHAR(200) NOT NULL,
  event_date  DATE         NOT NULL,
  amount      DECIMAL(12,3),
  reference   VARCHAR(100),
  notes       TEXT,
  status      VARCHAR(20)  NOT NULL DEFAULT 'pending'
              CHECK (status IN ('pending', 'done', 'cancelled')),
  created_by  INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at  TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_calendar_events_date ON calendar_events(event_date);
