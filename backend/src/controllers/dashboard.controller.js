const pool = require('../config/db');

exports.getKPIs = async (req, res, next) => {
  try {
    const { from, to } = req.query;
    const { rows } = await pool.query(
      `SELECT
        COALESCE(SUM(total_vente), 0)   AS total_ventes,
        COALESCE(SUM(total_regle), 0)   AS total_recettes,
        COALESCE(SUM(solde), 0)         AS total_solde,
        COALESCE(SUM(dep_caisse), 0)    AS total_depenses
       FROM daily_state
       WHERE date_stat BETWEEN $1 AND $2`,
      [from, to]
    );

    const margins = await pool.query(
      `SELECT
        (SELECT COALESCE(SUM(marge), 0) FROM marge_carburants) AS marge_carburants,
        (SELECT COALESCE(SUM(marge), 0) FROM marge_produits)   AS marge_produits,
        (SELECT COALESCE(SUM(marge), 0) FROM marge_services)   AS marge_services`
    );

    res.json({ ...rows[0], ...margins.rows[0] });
  } catch (err) {
    next(err);
  }
};

exports.getDaily = async (req, res, next) => {
  try {
    const { from, to } = req.query;
    const { rows } = await pool.query(
      `SELECT date_stat     AS date,
              total_vente,
              total_regle   AS total_r,
              dep_caisse,
              solde
       FROM daily_state
       WHERE date_stat BETWEEN $1 AND $2
       ORDER BY date_stat ASC`,
      [from, to]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
};
