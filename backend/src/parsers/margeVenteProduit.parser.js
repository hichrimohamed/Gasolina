module.exports = function parseMargeVenteProduit(rows) {
  return rows
    .filter(r => {
      const lib = r['Lib_produit'] || r['Lib Produit'] || r['lib_produit'];
      return lib && lib !== 'Lib_produit' && lib !== 'Total' && !String(lib).startsWith('Nombre');
    })
    .map(r => ({
      id_produit:   (r['Id_produit']      || r['Id Produit']    || r['id_produit'])    ?? null,
      lib_produit:  (r['Lib_produit']     || r['Lib Produit']   || r['lib_produit'])   ?? null,
      quantite:     (r['quantite']        || r['Quantite']      || r['Quantité'])      ?? null,
      vht_px_achat: (r['V HT au px achat']|| r['V HT Px Achat'] || r['v_ht_px_achat']) ?? null,
      vht_px_vente: (r['V HT au px vente\r\n'] || r['V HT au px vente'] || r['V HT Px Vente'] || r['v_ht_px_vente']) ?? null,
      marge:        (r['Marge']           || r['marge'])          ?? null,
    }));
};
