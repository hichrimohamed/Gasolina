const pool = require('../config/db');

exports.getCarburants = async (req, res, next) => {
  try {
    const { from, to } = req.query;
    const { rows } = await pool.query(
      `SELECT id,
              date_vente      AS date,
              ssp, ssp_cumul  AS cumul_ssp,
              gasoil, gasoil_cumul,
              gasoil50        AS gasoil_50, gasoil50_cumul,
              total_jour, total_cumule
       FROM vente_carburants
       WHERE date_vente BETWEEN $1 AND $2
       ORDER BY date_vente ASC`,
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
              date_vente   AS date,
              produit_code AS produit,
              libelle, prix, quantite, montant, famille
       FROM vente_produits
       WHERE date_vente BETWEEN $1 AND $2
       ORDER BY date_vente ASC`,
      [from, to]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

exports.getServices = async (req, res, next) => {
  try {
    const { from, to } = req.query;
    const { rows } = await pool.query(
      `SELECT id, id_service,
              date_vente AS date,
              lib_service, quantite, ttc_vente_prod, pxv_ttc
       FROM vente_services
       WHERE date_vente BETWEEN $1 AND $2
       ORDER BY date_vente ASC`,
      [from, to]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
};
