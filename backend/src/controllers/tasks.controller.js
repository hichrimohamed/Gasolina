const pool = require('../config/db');

exports.getAll = async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT t.*,
              w.name  AS worker_name,
              ce.title AS event_title,
              ce.event_date
       FROM tasks t
       LEFT JOIN workers w          ON w.id  = t.worker_id
       LEFT JOIN calendar_events ce ON ce.id = t.calendar_event_id
       ORDER BY t.created_at DESC`
    );
    res.json(rows);
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const { title, description, status, worker_id, calendar_event_id, due_date } = req.body;
    if (!title?.trim()) return res.status(400).json({ error: 'Le titre est requis' });
    const { rows } = await pool.query(
      `INSERT INTO tasks (title, description, status, worker_id, calendar_event_id, due_date, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        title.trim(),
        description?.trim() || null,
        status ?? 'todo',
        worker_id ?? null,
        calendar_event_id ?? null,
        due_date ?? null,
        req.user.id,
      ]
    );
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, status, worker_id, calendar_event_id, due_date } = req.body;
    const { rows } = await pool.query(
      `UPDATE tasks
       SET title             = COALESCE($1, title),
           description       = COALESCE($2, description),
           status            = COALESCE($3, status),
           worker_id         = $4,
           calendar_event_id = $5,
           due_date          = $6,
           updated_at        = NOW()
       WHERE id = $7
       RETURNING *`,
      [
        title?.trim() || null,
        description?.trim() || null,
        status ?? null,
        worker_id ?? null,
        calendar_event_id ?? null,
        due_date ?? null,
        id,
      ]
    );
    if (!rows.length) return res.status(404).json({ error: 'Tâche introuvable' });
    res.json(rows[0]);
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM tasks WHERE id = $1', [req.params.id]);
    if (rowCount === 0) return res.status(404).json({ error: 'Tâche introuvable' });
    res.status(204).end();
  } catch (err) { next(err); }
};
