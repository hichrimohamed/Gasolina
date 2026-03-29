module.exports = function parseVenteCarburants(rows) {
  return rows
    .filter(r => r['Date'] || r['date'])
    .map(r => ({
      date_vente:     r['Date']         || r['date'],
      ssp:            r['S S P']        ?? null,
      ssp_cumul:      r['CUMUL']        ?? null,
      gasoil:         r['GASOIL']       ?? null,
      gasoil_cumul:   r['CUMUL_1']      ?? null,
      gasoil50:       r['GASOIL 50']    ?? null,
      gasoil50_cumul: r['CUMUL ']       ?? null,
      total_jour:     r['TOTAL JOUR']   ?? null,
      total_cumule:   r['TOTAL CUMULE'] ?? null,
    }));
};
