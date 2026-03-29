const pool = require('../config/db');

exports.getDailyState = async (req, res, next) => {
  try {
    const { from, to } = req.query;
    const { rows } = await pool.query(
      `SELECT id,
              date_stat       AS date,
              ttc_carb, ttc_prt_gaz, ht_prt_gaz, ttc_service,
              espece, cheque, tpe, tpe2, carte_b, credit, autres,
              total_vente,
              total_regle     AS total_r,
              dep_caisse,
              cred_anterieur  AS cred_anter,
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

exports.getRecettes = async (req, res, next) => {
  try {
    const { from, to } = req.query;
    const { rows } = await pool.query(
      `SELECT id,
              date_rec  AS date,
              vendeur,
              mode_pmt  AS mode,
              ttc       AS montant
       FROM recettes
       WHERE date_rec BETWEEN $1 AND $2
       ORDER BY date_rec ASC`,
      [from, to]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

exports.getDepenses = async (req, res, next) => {
  try {
    const { from, to } = req.query;
    const { rows } = await pool.query(
      `SELECT id,
              date_dep  AS date,
              vendeur,
              type_dep  AS type,
              ttc       AS montant
       FROM depenses
       WHERE date_dep BETWEEN $1 AND $2
       ORDER BY date_dep ASC`,
      [from, to]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
};
