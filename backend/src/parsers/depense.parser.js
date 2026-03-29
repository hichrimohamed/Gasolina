module.exports = function parseDepense(rows) {
  return rows
    .filter(r => r['Date'] || r['date'])
    .map(r => {
      // Normalise keys: strip surrounding whitespace
      const norm = {};
      for (const [k, v] of Object.entries(r)) norm[k.trim()] = v;
      return {
        date_dep: norm['Date']    || norm['date'],
        vendeur:  (norm['Vendeur'] || norm['vendeur']) ?? null,
        type_dep: (norm['Type']    || norm['type']    || norm['Type Dep']) ?? null,
        ttc:      (norm['Montant'] || norm['montant'] || norm['TTC'] || norm['ttc']) ?? null,
      };
    });
};
