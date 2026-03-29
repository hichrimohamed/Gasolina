module.exports = function parseVenteService(rows) {
  return rows
    .filter(r => r['Date'] || r['date'])
    .map(r => ({
      id_service:     r['Id_service']     ?? r['Id Service']     ?? r['id_service']     ?? null,
      date_vente:     r['Date']           || r['date'],
      lib_service:    r['Lib_service']    ?? r['Lib Service']    ?? r['lib_service']    ?? r['Libellé'] ?? null,
      quantite:       r['quantite']       ?? r['Quantite']       ?? r['Quantité']       ?? null,
      ttc_vente_prod: r['Ttc_vente_prod'] ?? r['TTC Vente Prod'] ?? r['ttc_vente_prod'] ?? null,
      pxv_ttc:        r['PXV_TTC']        ?? r['Pxv TTC']        ?? r['pxv_ttc']        ?? null,
    }));
};
