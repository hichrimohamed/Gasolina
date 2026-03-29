module.exports = function parseRecette(rows) {
  return rows
    .filter(r => r['Date'] || r['date'])
    .map(r => {
      // Normalise keys: strip surrounding whitespace
      const norm = {};
      for (const [k, v] of Object.entries(r)) norm[k.trim()] = v;
      return {
        date_rec: norm['Date']    || norm['date'],
        vendeur:  (norm['Vendeur'] || norm['vendeur']) ?? null,
        mode_pmt: (norm['Mode']    || norm['mode']    || norm['Mode Pmt']) ?? null,
        ttc:      (norm['Montant'] || norm['montant'] || norm['TTC'] || norm['ttc']) ?? null,
      };
    });
};
