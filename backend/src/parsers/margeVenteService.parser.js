module.exports = function parseMargeVenteService(rows) {
  return rows
    .filter(r => {
      const id  = r['service'] || r['Service'] || r['id_service'];
      const lib = r['Libelle'] || r['libelle'] || r['Libellé'];
      return lib && typeof id === 'number';
    })
    .map(r => ({
      id_service:   (r['service']         || r['Service']       || r['id_service'])    ?? null,
      libelle:      (r['Libelle']         || r['libelle']       || r['Libellé'])        ?? null,
      quantite:     (r['quantite']        || r['Quantite']      || r['Quantité'])       ?? null,
      vht_px_achat: r['V HT au px achat'] ?? r['V HT Px Achat'] ?? r['v_ht_px_achat'] ?? null,
      vht_px_vente: (r['V HT au px vente\r\n'] || r['V HT au px vente'] || r['V HT Px Vente'] || r['v_ht_px_vente']) ?? null,
      marge:        (r['Marge']           || r['marge'])          ?? null,
    }));
};
