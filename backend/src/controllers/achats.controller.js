const pool = require('../config/db');

exports.getCarburants = async (req, res, next) => {
  try {
    const { from, to } = req.query;
    const { rows } = await pool.query(
      `SELECT id,
              num_achat    AS achat,
              date_achat,
              num_facture  AS facture,
              date_facture, total
       FROM achat_carburants
       WHERE date_achat BETWEEN $1 AND $2
       ORDER BY date_achat ASC`,
      [from, to]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

exports.getProduits = async (req, res, next) => {
  try {
    const { from, to } = req.query;
    const { rows } = await pool.query(
      `SELECT id,
              date_achat   AS date,
              num_facture  AS facture,
              date_facture, total
       FROM achat_produits
       WHERE date_achat BETWEEN $1 AND $2
       ORDER BY date_achat ASC`,
      [from, to]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
};
