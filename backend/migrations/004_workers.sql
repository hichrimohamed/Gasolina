CREATE TABLE IF NOT EXISTS workers (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  poste      VARCHAR(50),
  phone      VARCHAR(20),
  active     BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);
