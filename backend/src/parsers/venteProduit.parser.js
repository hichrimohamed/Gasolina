module.exports = function parseVenteProduit(rows) {
  return rows
    .filter(r => r['Date'] || r['date'])
    .map(r => ({
      date_vente:   r['Date']     || r['date'],
      produit_code: (r['Produit'] || r['produit']) ?? null,
      libelle:      (r['Libelle'] || r['libelle']  || r['Libellé']) ?? null,
      prix:         (r['Prix']    || r['prix'])     ?? null,
      quantite:     (r['Quantite']|| r['quantite'] || r['Quantité']) ?? null,
      montant:      (r['Montant'] || r['montant'])  ?? null,
      famille:      (r['Famille'] || r['famille'])  ?? null,
    }));
};
