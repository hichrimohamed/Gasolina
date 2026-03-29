CREATE TABLE IF NOT EXISTS tasks (
  id                SERIAL PRIMARY KEY,
  title             VARCHAR(200) NOT NULL,
  description       TEXT,
  status            VARCHAR(20) NOT NULL DEFAULT 'todo'
                      CHECK (status IN ('todo', 'inprogress', 'done')),
  worker_id         INTEGER REFERENCES workers(id) ON DELETE SET NULL,
  calendar_event_id INTEGER REFERENCES calendar_events(id) ON DELETE SET NULL,
  due_date          DATE,
  created_by        INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at        TIMESTAMP DEFAULT NOW(),
  updated_at        TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS tasks_status_idx           ON tasks(status);
CREATE INDEX IF NOT EXISTS tasks_worker_id_idx        ON tasks(worker_id);
CREATE INDEX IF NOT EXISTS tasks_calendar_event_id_idx ON tasks(calendar_event_id);
