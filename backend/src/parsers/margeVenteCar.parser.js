module.exports = function parseMargeVenteCar(rows) {
  return rows
    .filter(r => {
      const id  = r['Id_produit']  || r['Id Produit']  || r['id_produit'];
      const lib = r['Lib_produit'] || r['Lib Produit'] || r['lib_produit'];
      return lib && typeof id === 'number';
    })
    .map(r => ({
      id_produit:   (r['Id_produit']      || r['Id Produit']    || r['id_produit'])    ?? null,
      lib_produit:  (r['Lib_produit']     || r['Lib Produit']   || r['lib_produit'])   ?? null,
      vht_px_achat: (r['V HT au px achat']|| r['V HT Px Achat'] || r['v_ht_px_achat']) ?? null,
      vht_px_vente: (r['V HT au px vente\r\n'] || r['V HT au px vente'] || r['V HT Px Vente'] || r['v_ht_px_vente']) ?? null,
      marge:        (r['Marge']           || r['marge'])          ?? null,
    }));
};
