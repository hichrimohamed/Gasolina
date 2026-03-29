const pool = require('../config/db');

exports.getAll = async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, name, poste, phone, active, created_at FROM workers WHERE active = true ORDER BY name ASC'
    );
    res.json(rows);
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const { name, poste, phone } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: 'Le nom est requis' });
    const { rows } = await pool.query(
      'INSERT INTO workers (name, poste, phone) VALUES ($1, $2, $3) RETURNING *',
      [name.trim(), poste?.trim() || null, phone?.trim() || null]
    );
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const { name, poste, phone } = req.body;
    const { rows } = await pool.query(
      `UPDATE workers
       SET name  = COALESCE($1, name),
           poste = COALESCE($2, poste),
           phone = COALESCE($3, phone)
       WHERE id = $4 RETURNING *`,
      [name?.trim() || null, poste?.trim() || null, phone?.trim() || null, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Employé introuvable' });
    res.json(rows[0]);
  } catch (err) { next(err); }
};

exports.deactivate = async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'UPDATE workers SET active = false WHERE id = $1 RETURNING id',
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Employé introuvable' });
    res.json({ success: true });
  } catch (err) { next(err); }
};
