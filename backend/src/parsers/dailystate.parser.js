module.exports = function parseDailyState(rows) {
  return rows
    .filter(r => r['Date'] || r['date'])
    .map(r => ({
      date_stat:       r['Date']           || r['date'],
      ttc_carb:        r['TTC Carb.']      ?? r['TTC Carb']      ?? r['ttc_carb']       ?? null,
      ttc_prt_gaz:     r['TTC Prt/gaz']   ?? r['TTC Prt Gaz']   ?? r['ttc_prt_gaz']    ?? null,
      ht_prt_gaz:      r['HT Prt/gaz']    ?? r['HT Prt Gaz']    ?? r['ht_prt_gaz']     ?? null,
      ttc_service:     r['TTC Service']   ?? r['ttc_service']    ?? null,
      espece:          r['Espece']         ?? r['Espèce']         ?? r['espece']         ?? null,
      cheque:          r['Chèque']         ?? r['Cheque']         ?? r['cheque']         ?? null,
      tpe:             r['TPE']            ?? r['tpe']            ?? null,
      tpe2:            r['T P E 2']        ?? r['TPE2']           ?? r['tpe2']           ?? null,
      carte_b:         r['carte_b']        ?? r['Carte B']        ?? null,
      credit:          r['Crédit']         ?? r['Credit']         ?? r['credit']         ?? null,
      autres:          r['autres']         ?? r['Autres']         ?? null,
      total_vente:     r['Total Vente']    ?? r['total_vente']    ?? null,
      total_regle:     r['Total Réglé']    ?? r['Total Regle']    ?? r['Total R']        ?? r['total_regle'] ?? null,
      dep_caisse:      r['dep_caisse']     ?? r['Dep Caisse']     ?? null,
      cred_anterieur:  r['cred/anter']     ?? r['Cred Anter']     ?? r['cred_anter']     ?? r['Cred Anterieur'] ?? null,
      solde:           r['Solde']          ?? r['solde']          ?? null,
    }));
};
