module.exports = function parseAchatProduits(rows) {
  return rows
    .filter(r => r['Date'] || r['date'])
    .map(r => ({
      date_achat:   r['Date']         || r['date'],
      num_facture:  r['N° Facture']   ?? r['Facture']     ?? r['Num Facture'] ?? r['num_facture'] ?? null,
      date_facture: (r['Date Facture']|| r['date_facture']) ?? null,
      total:        (r['Total']       || r['total'])       ?? null,
    }));
};
