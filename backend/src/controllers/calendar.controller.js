const pool = require('../config/db');

exports.getEvents = async (req, res, next) => {
  try {
    const { year, month } = req.query;
    const from = `${year}-${String(month).padStart(2, '0')}-01`;
    const { rows } = await pool.query(
      `SELECT ce.id, ce.type, ce.title, ce.event_date, ce.amount, ce.reference,
              ce.notes, ce.status, ce.created_by, ce.created_at,
              ce.worker_id, w.name AS worker_name,
              (SELECT COUNT(*) FROM tasks t WHERE t.calendar_event_id = ce.id)::int AS task_count
       FROM calendar_events ce
       LEFT JOIN workers w ON w.id = ce.worker_id
       WHERE ce.event_date >= $1
         AND ce.event_date < ($1::date + INTERVAL '1 month')
       ORDER BY ce.event_date ASC, ce.created_at ASC`,
      [from]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

exports.createEvent = async (req, res, next) => {
  try {
    const { type, title, event_date, amount, reference, notes, status, worker_id } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO calendar_events
         (type, title, event_date, amount, reference, notes, status, created_by, worker_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [type, title, event_date, amount ?? null, reference ?? null, notes ?? null,
       status ?? 'pending', req.user.id, worker_id ?? null]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
};

exports.updateEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { type, title, event_date, amount, reference, notes, status, worker_id } = req.body;
    const { rows } = await pool.query(
      `UPDATE calendar_events
       SET type       = COALESCE($1, type),
           title      = COALESCE($2, title),
           event_date = COALESCE($3, event_date),
           amount     = COALESCE($4, amount),
           reference  = COALESCE($5, reference),
           notes      = COALESCE($6, notes),
           status     = COALESCE($7, status),
           worker_id  = $8
       WHERE id = $9
       RETURNING *`,
      [type, title, event_date, amount, reference, notes, status,
       worker_id ?? null, id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Event not found' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

exports.getAllEvents = async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, title, event_date FROM calendar_events ORDER BY event_date DESC`
    );
    res.json(rows);
  } catch (err) { next(err); }
};

exports.deleteEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rowCount } = await pool.query(
      'DELETE FROM calendar_events WHERE id = $1', [id]
    );
    if (rowCount === 0) return res.status(404).json({ error: 'Event not found' });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};
