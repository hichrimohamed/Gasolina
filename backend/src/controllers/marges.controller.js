const pool = require('../config/db');

exports.getCarburants = async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, id_produit, lib_produit,
              vht_px_achat AS v_ht_px_achat,
              vht_px_vente AS v_ht_px_vente,
              marge, report_date
       FROM marge_carburants
       ORDER BY id ASC`
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

exports.getProduits = async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, id_produit, lib_produit, quantite,
              vht_px_achat AS v_ht_px_achat,
              vht_px_vente AS v_ht_px_vente,
              marge, report_date
       FROM marge_produits
       ORDER BY id ASC`
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

exports.getServices = async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, id_service, libelle, quantite,
              vht_px_achat AS v_ht_px_achat,
              vht_px_vente AS v_ht_px_vente,
              marge, report_date
       FROM marge_services
       ORDER BY id ASC`
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
};
