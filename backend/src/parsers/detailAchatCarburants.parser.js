module.exports = function parseDetailAchatCarburants(rows) {
  return rows
    .filter(r => r['Cuve'] || r['cuve'])
    .map(r => ({
      id_cuve:  (r['Id Cuve'] || r['ID Cuve'] || r['id_cuve']) ?? null,
      cuve:     (r['Cuve']    || r['cuve'])     ?? null,
      quantite: (r['Quantite']|| r['quantite'] || r['Quantité']) ?? null,
      total:    (r['Total']   || r['total'])    ?? null,
    }));
};
