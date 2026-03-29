import { useEffect, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { getDailyState, getRecettes, getDepenses } from '../api';
import { useDate } from '../context/DateContext';
import { useExport } from '../context/ExportContext';
import { downloadCSV } from '../utils/csv';

function fmtDT(n) {
  if (n === null || n === undefined || isNaN(+n)) return '—';
  return (+n).toLocaleString('fr-TN', { minimumFractionDigits: 3, maximumFractionDigits: 3 });
}

function fmtDate(d) {
  if (!d) return '—';
  return new Intl.DateTimeFormat('fr-TN', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(d));
}

const mono = { fontFamily: "'DM Mono', monospace", fontSize: 12 };

function THead({ cols, grid }) {
  return (
    <div className="table-header" style={{ gridTemplateColumns: grid }}>
      {cols.map(c => <div key={c} className="th">{c}</div>)}
    </div>
  );
}

function Empty() {
  return <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>Aucune donnée pour cette période</div>;
}

const SK = () => <div className="skeleton" style={{ height: 14, borderRadius: 4 }} />;

function SkeletonTable({ grid, cols }) {
  return (
    <>
      <div className="table-header" style={{ gridTemplateColumns: grid }}>
        {Array.from({ length: cols }).map((_, i) => <div key={i} className="skeleton" style={{ height: 12, borderRadius: 4 }} />)}
      </div>
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className="tx-row" style={{ gridTemplateColumns: grid }}>
          {Array.from({ length: cols }).map((_, j) => <SK key={j} />)}
        </div>
      ))}
    </>
  );
}

export default function DailyState() {
  const { pathname } = useLocation();
  const active = pathname.includes('recette') ? 'recettes'
               : pathname.includes('depense') ? 'depenses'
               : 'etat';

  const { from, to } = useDate();
  const { registerExport } = useExport();
  const [params] = useSearchParams();
  const q = (params.get('q') ?? '').toLowerCase();

  const [rows, setRows]    = useState([]);
  const [recettes, setRec] = useState([]);
  const [depenses, setDep] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getDailyState(from, to),
      getRecettes(from, to),
      getDepenses(from, to),
    ])
      .then(([s, r, d]) => { setRows(s.data); setRec(r.data); setDep(d.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [from, to]);

  // Totals always use unfiltered arrays
  const totalVente   = rows.reduce((s, r) => s + (+r.total_vente  || 0), 0);
  const totalRegle   = rows.reduce((s, r) => s + (+r.total_r      || 0), 0);
  const totalDep     = rows.reduce((s, r) => s + (+r.dep_caisse   || 0), 0);
  const totalSolde   = rows.reduce((s, r) => s + (+r.solde        || 0), 0);
  const totalRec     = recettes.reduce((s, r) => s + (+r.montant  || 0), 0);
  const totalDepTtc  = depenses.reduce((s, r) => s + (+r.montant  || 0), 0);

  const filteredRows     = q ? rows.filter(r => (r.date ?? '').toLowerCase().includes(q)) : rows;
  const filteredRecettes = q ? recettes.filter(r => [r.vendeur, r.mode, r.date].join(' ').toLowerCase().includes(q)) : recettes;
  const filteredDepenses = q ? depenses.filter(r => [r.vendeur, r.type, r.date].join(' ').toLowerCase().includes(q)) : depenses;

  const exportData = active === 'recettes' ? filteredRecettes : active === 'depenses' ? filteredDepenses : filteredRows;
  useEffect(() => {
    registerExport(() => downloadCSV(exportData, `etat-journalier-${active}.csv`));
  }, [exportData, active]); // eslint-disable-line

  return (
    <>
      <div className="card" style={{ padding: '16px 22px' }}>
        <div className="section-header" style={{ marginBottom: 0 }}>
          <div className="section-title">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="1" y="2" width="14" height="12" rx="2" stroke="var(--teal)" strokeWidth="1.3"/>
              <path d="M4 1v2M12 1v2M1 6h14" stroke="var(--teal)" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
            {active === 'recettes' ? 'Recettes' : active === 'depenses' ? 'Dépenses' : 'État Journalier'}
          </div>
        </div>
      </div>

      {/* KPI summary row */}
      <div className="grid-3">
        <div className="card">
          <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6 }}>Total Ventes TTC</div>
          {loading
            ? <div className="skeleton" style={{ height: 28, width: 140 }} />
            : <div style={{ fontSize: 22, fontWeight: 600 }}>{fmtDT(totalVente)}<span style={{ fontSize: 12, color: 'var(--muted)', marginLeft: 4 }}>DT</span></div>
          }
        </div>
        <div className="card">
          <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6 }}>Recettes</div>
          {loading
            ? <div className="skeleton" style={{ height: 28, width: 140 }} />
            : <div style={{ fontSize: 22, fontWeight: 600, color: 'var(--success-text)' }}>{fmtDT(totalRec)}<span style={{ fontSize: 12, marginLeft: 4 }}>DT</span></div>
          }
        </div>
        <div className="card">
          <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6 }}>Dépenses</div>
          {loading
            ? <div className="skeleton" style={{ height: 28, width: 140 }} />
            : <div style={{ fontSize: 22, fontWeight: 600, color: 'var(--red)' }}>{fmtDT(totalDepTtc)}<span style={{ fontSize: 12, marginLeft: 4 }}>DT</span></div>
          }
        </div>
      </div>

      {/* ── ÉTAT JOURNALIER ── */}
      {active === 'etat' && (
        <div className="card">
          <div className="section-header">
            <div className="section-title">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h3l2-5 2 10 2-7 1 2h2" stroke="var(--teal)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              État Journalier
            </div>
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>{filteredRows.length} jours</span>
          </div>
          {loading ? <SkeletonTable grid="1.3fr 1fr 1.1fr 1fr 1.1fr 1fr 1.1fr 1fr" cols={8} /> : (
            <>
              <THead cols={['Date', 'TTC Carb.', 'TTC Prt/Gaz', 'TTC Service', 'Total Vente', 'Réglé', 'Dép. Caisse', 'Solde']}
                     grid="1.3fr 1fr 1.1fr 1fr 1.1fr 1fr 1.1fr 1fr" />
              {filteredRows.length === 0 ? <Empty /> : filteredRows.map(r => (
                <div key={r.id} className="tx-row" style={{ gridTemplateColumns: '1.3fr 1fr 1.1fr 1fr 1.1fr 1fr 1.1fr 1fr' }}>
                  <div style={{ fontSize: 13 }}>{fmtDate(r.date)}</div>
                  <div style={mono}>{fmtDT(r.ttc_carb)}</div>
                  <div style={mono}>{fmtDT(r.ttc_prt_gaz)}</div>
                  <div style={mono}>{fmtDT(r.ttc_service)}</div>
                  <div style={{ ...mono, fontWeight: 600 }}>{fmtDT(r.total_vente)}</div>
                  <div style={mono}>{fmtDT(r.total_r)}</div>
                  <div style={{ ...mono, color: 'var(--red)' }}>{fmtDT(r.dep_caisse)}</div>
                  <div style={{ ...mono, fontWeight: 600, color: +r.solde >= 0 ? 'var(--success-text)' : 'var(--red)' }}>
                    {fmtDT(r.solde)}
                  </div>
                </div>
              ))}
              {filteredRows.length > 0 && (
                <div className="tx-row" style={{ gridTemplateColumns: '1.3fr 1fr 1.1fr 1fr 1.1fr 1fr 1.1fr 1fr', background: 'var(--bg)', borderRadius: 8, marginTop: 4 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)' }}>TOTAL</div>
                  <div style={mono} /><div style={mono} /><div style={mono} />
                  <div style={{ ...mono, fontWeight: 700 }}>{fmtDT(totalVente)}</div>
                  <div style={{ ...mono, fontWeight: 700 }}>{fmtDT(totalRegle)}</div>
                  <div style={{ ...mono, fontWeight: 700, color: 'var(--red)' }}>{fmtDT(totalDep)}</div>
                  <div style={{ ...mono, fontWeight: 700, color: totalSolde >= 0 ? 'var(--success-text)' : 'var(--red)' }}>{fmtDT(totalSolde)}</div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ── RECETTES ── */}
      {active === 'recettes' && (
        <div className="card">
          <div className="section-header">
            <div className="section-title">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 4h12v8a1 1 0 01-1 1H3a1 1 0 01-1-1V4z" stroke="var(--teal)" strokeWidth="1.5"/>
                <path d="M2 4l6 4 6-4" stroke="var(--teal)" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              Recettes
            </div>
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>{filteredRecettes.length} entrées</span>
          </div>
          {loading ? <SkeletonTable grid="1.3fr 2fr 1.5fr 1.2fr" cols={4} /> : (
            <>
              <THead cols={['Date', 'Vendeur', 'Mode Paiement', 'Montant']}
                     grid="1.3fr 2fr 1.5fr 1.2fr" />
              {filteredRecettes.length === 0 ? <Empty /> : filteredRecettes.map(r => (
                <div key={r.id} className="tx-row" style={{ gridTemplateColumns: '1.3fr 2fr 1.5fr 1.2fr' }}>
                  <div style={{ fontSize: 13 }}>{fmtDate(r.date)}</div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{r.vendeur ?? '—'}</div>
                  <div><span className="status-badge success">{r.mode ?? '—'}</span></div>
                  <div style={{ ...mono, fontWeight: 600, color: 'var(--success-text)' }}>+{fmtDT(r.montant)}</div>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {/* ── DÉPENSES ── */}
      {active === 'depenses' && (
        <div className="card">
          <div className="section-header">
            <div className="section-title">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="2" y="4" width="12" height="9" rx="1.5" stroke="var(--teal)" strokeWidth="1.5"/>
                <path d="M5 4V3a1 1 0 011-1h4a1 1 0 011 1v1" stroke="var(--teal)" strokeWidth="1.5"/>
              </svg>
              Dépenses
            </div>
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>{filteredDepenses.length} entrées</span>
          </div>
          {loading ? <SkeletonTable grid="1.3fr 2fr 2fr 1.2fr" cols={4} /> : (
            <>
              <THead cols={['Date', 'Vendeur', 'Type Dépense', 'Montant']}
                     grid="1.3fr 2fr 2fr 1.2fr" />
              {filteredDepenses.length === 0 ? <Empty /> : filteredDepenses.map(r => (
                <div key={r.id} className="tx-row" style={{ gridTemplateColumns: '1.3fr 2fr 2fr 1.2fr' }}>
                  <div style={{ fontSize: 13 }}>{fmtDate(r.date)}</div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{r.vendeur ?? '—'}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>{r.type ?? '—'}</div>
                  <div style={{ ...mono, fontWeight: 600, color: 'var(--red)' }}>-{fmtDT(r.montant)}</div>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </>
  );
}
