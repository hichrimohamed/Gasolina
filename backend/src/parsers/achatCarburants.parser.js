module.exports = function parseAchatCarburants(rows) {
  return rows
    .filter(r => r['Achat'] || r['achat'] || r['Num Achat'] || r['N° Achat'])
    .map(r => ({
      num_achat:    parseInt(r['Achat'] || r['Num Achat'] || r['N° Achat'] || r['achat']) || 0,
      date_achat:   (r['Date Achat']   || r['Date achat']  || r['date_achat'] || r['Date']) ?? null,
      num_facture:  (r['Facture']      || r['Num Facture'] || r['N° Facture'] || r['num_facture']) ?? null,
      date_facture: (r['Date Facture'] || r['date_facture']) ?? null,
      total:        (r['Total']        || r['total'])        ?? null,
    }));
};
