import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getKPIs, getDailyChart,
  getVentesCarb, getVentesProd, getVentesServ,
  getRecettes, getDepenses,
} from '../api';
import { useDate } from '../context/DateContext';
import { useExport } from '../context/ExportContext';
import { downloadCSV } from '../utils/csv';

// ── Formatters ────────────────────────────────────────────
function fmtDT(n) {
  if (n === null || n === undefined || isNaN(+n)) return '— DT';
  const v = +n;
  const sign = v < 0 ? '-' : '';
  return sign + Math.abs(v).toLocaleString('fr-TN', { minimumFractionDigits: 3, maximumFractionDigits: 3 }) + ' DT';
}

function fmtDate(d) {
  if (!d) return '—';
  return new Intl.DateTimeFormat('fr-TN', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(d));
}

function fmtShort(d) {
  if (!d) return '—';
  return new Intl.DateTimeFormat('fr-TN', { day: '2-digit', month: 'short' }).format(new Date(d));
}

function sumField(arr, key) {
  return arr.reduce((acc, r) => acc + (parseFloat(r[key]) || 0), 0);
}

// ── Cashflow chart ─────────────────────────────────────────
function CashflowChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontSize: 13 }}>
        Aucune donnée
      </div>
    );
  }

  const recettes   = data.map(d => parseFloat(d.total_vente) || 0);
  const depenses   = data.map(d => parseFloat(d.dep_caisse)  || 0);
  const totalRange = Math.max(...recettes, ...depenses, 1);
  const maxRec     = Math.max(...recettes, 1);
  const maxDep     = Math.max(...depenses, 1);

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ display: 'flex', gap: 0, height: 160, alignItems: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: 136, marginRight: 8, flexShrink: 0 }}>
          <span style={{ fontSize: 10, color: 'var(--muted)', fontFamily: "'DM Mono', monospace" }}>{(maxRec / 1000).toFixed(0)}K DT</span>
          <span style={{ fontSize: 10, color: 'var(--muted)', fontFamily: "'DM Mono', monospace" }}>0</span>
          <span style={{ fontSize: 10, color: 'var(--muted)', fontFamily: "'DM Mono', monospace" }}>{(maxDep / 1000).toFixed(0)}K DT</span>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 80 }}>
            {data.map((day, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                {recettes[i] > 0 && (
                  <div className="bar-pos" style={{ height: Math.max((recettes[i] / totalRange) * 80, 2) }}
                    title={`${fmtDate(day.date)}\nRecette: ${fmtDT(recettes[i])}`} />
                )}
              </div>
            ))}
          </div>
          <div style={{ height: 2, background: 'var(--border)', margin: '2px 0', flexShrink: 0 }} />
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 4, height: 54 }}>
            {data.map((day, i) => (
              <div key={i} style={{ flex: 1 }}>
                {depenses[i] > 0 && (
                  <div className="bar-neg" style={{ height: Math.max((depenses[i] / totalRange) * 54, 2) }}
                    title={`${fmtDate(day.date)}\nDépense: ${fmtDT(depenses[i])}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', paddingLeft: 48, marginTop: 8 }}>
        <span style={{ fontSize: 10, color: 'var(--muted)' }}>{fmtShort(data[0]?.date)}</span>
        <span style={{ fontSize: 10, color: 'var(--muted)' }}>{fmtShort(data[data.length - 1]?.date)}</span>
      </div>
    </div>
  );
}

const SK = () => <div className="skeleton" style={{ height: 14, borderRadius: 4 }} />;

// ── Dashboard page ────────────────────────────────────────
export default function Dashboard() {
  const { from, to } = useDate();
  const navigate = useNavigate();
  const { registerExport } = useExport();

  const [kpis,           setKpis]           = useState(null);
  const [daily,          setDaily]          = useState([]);
  const [carbRows,       setCarbRows]       = useState([]);
  const [prodRows,       setProdRows]       = useState([]);
  const [svcRows,        setSvcRows]        = useState([]);
  const [recettes,       setRecettes]       = useState([]);
  const [depenses,       setDepenses]       = useState([]);
  const [error,          setError]          = useState(false);
  const [loading,        setLoading]        = useState(true);
  const [activityFilter, setActivityFilter] = useState('all'); // 'all' | 'recettes' | 'depenses'
  const [activitySort,   setActivitySort]   = useState('desc'); // 'desc' | 'asc'

  useEffect(() => {
    setLoading(true);
    setError(false);
    Promise.all([
      getKPIs(from, to),
      getDailyChart(from, to),
      getVentesCarb(from, to),
      getVentesProd(from, to),
      getVentesServ(from, to),
      getRecettes(from, to),
      getDepenses(from, to),
    ])
      .then(([k, d, c, p, s, r, dep]) => {
        setKpis(k.data);
        setDaily(d.data);
        setCarbRows(c.data);
        setProdRows(p.data);
        setSvcRows(s.data);
        setRecettes(r.data);
        setDepenses(dep.data);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [from, to]);

  // ── Derived ───────────────────────────────────────────
  const totalCarb = sumField(carbRows, 'total_jour');
  const totalProd = sumField(prodRows, 'montant');
  const totalSvc  = sumField(svcRows,  'ttc_vente_prod');

  const cuves = [
    { libelle: 'GASOIL',    quantite: sumField(carbRows, 'gasoil') },
    { libelle: 'SSP',       quantite: sumField(carbRows, 'ssp') },
    { libelle: 'GASOIL 50', quantite: sumField(carbRows, 'gasoil_50') },
  ].filter(c => c.quantite > 0);
  const maxCuve = Math.max(...cuves.map(c => c.quantite), 1);

  const allActivity = [
    ...recettes.map(r => ({ ...r, txType: 'recette' })),
    ...depenses.map(d => ({ ...d, txType: 'depense' })),
  ];

  const activity = allActivity
    .filter(tx => activityFilter === 'all' || tx.txType === (activityFilter === 'recettes' ? 'recette' : 'depense'))
    .sort((a, b) => activitySort === 'desc'
      ? new Date(b.date) - new Date(a.date)
      : new Date(a.date) - new Date(b.date))
    .slice(0, 10);

  useEffect(() => {
    registerExport(() => downloadCSV(activity, 'activite-recente.csv'));
  }, [activity]); // eslint-disable-line

  function cycleFilter() {
    setActivityFilter(f => f === 'all' ? 'recettes' : f === 'recettes' ? 'depenses' : 'all');
  }
  function toggleSort() {
    setActivitySort(s => s === 'desc' ? 'asc' : 'desc');
  }

  const FILTER_LABEL = { all: 'Filtrer', recettes: 'Recettes', depenses: 'Dépenses' };

  if (loading) {
    return (
      <>
        <div className="skeleton" style={{ height: 110, borderRadius: 16, marginBottom: 0 }} />
        <div className="grid-2">
          <div className="card"><div className="skeleton" style={{ height: 180 }} /></div>
          <div className="ie-side">
            <div className="ie-card" style={{ flex: 1 }}><div className="skeleton" style={{ height: 60, width: '100%' }} /></div>
            <div className="ie-card" style={{ flex: 1 }}><div className="skeleton" style={{ height: 60, width: '100%' }} /></div>
          </div>
        </div>
        <div className="grid-3">
          {[0, 1, 2].map(i => <div key={i} className="card"><div className="skeleton" style={{ height: 90 }} /></div>)}
        </div>
        <div className="grid-bottom">
          <div className="card">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="tx-row">
                <SK /><SK /><SK /><SK />
              </div>
            ))}
          </div>
          <div className="card"><div className="skeleton" style={{ height: 140 }} /></div>
        </div>
      </>
    );
  }

  return (
    <>
      {error && (
        <div className="error-banner visible">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M8 5v3m0 2.5h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <span>
            Impossible de charger les données. Vérifiez que l'API est disponible sur{' '}
            <code>http://localhost:4000/api</code>.
          </span>
        </div>
      )}

      {/* HERO */}
      <div className="hero">
        <div>
          <div className="hero-label">Total Ventes (TTC)</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <div className="hero-amount">{fmtDT(kpis?.total_ventes)}</div>
          </div>
        </div>
        <div className="hero-actions">
          <button className="btn-primary" onClick={() => navigate('/ventes/carburants')}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Nouvelle Vente
          </button>
          <button className="btn-ghost" onClick={() => navigate('/marges')}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 12l3-3 3 3 4-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Statistiques
          </button>
          <button className="btn-ghost" onClick={() => navigate('/marges')}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 2v7M4 6l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 11h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Rapport
          </button>
        </div>
      </div>

      {/* CASHFLOW + INCOME/EXPENSE */}
      <div className="grid-2">
        <div className="card">
          <div className="section-header">
            <div className="section-title">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 2v5l3-3M8 7l-3-3" stroke="var(--teal)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8 14V9l3 3M8 9l-3 3" stroke="var(--green)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Flux de Trésorerie Quotidien
            </div>
            <div className="tab-group">
              <div className="tab active">Journalier</div>
              <div className="tab">Mensuel</div>
            </div>
          </div>
          <CashflowChart data={daily} />
        </div>

        <div className="ie-side">
          <div className="ie-card">
            <div className="ie-icon income">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M9 14V4M4 9l5-5 5 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <div className="ie-label">Recettes</div>
              <div className="ie-amount">{fmtDT(kpis?.total_recettes)}</div>
            </div>
          </div>
          <div className="ie-card">
            <div className="ie-icon expense">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M9 4v10M14 9l-5 5-5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <div className="ie-label">Dépenses</div>
              <div className="ie-amount">{fmtDT(kpis?.total_depenses)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="grid-3">
        <div className="card">
          <div className="stat-label">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M9 3C9 3 4 8.5 4 11.5a5 5 0 0010 0C14 8.5 9 3 9 3z" stroke="var(--muted)" strokeWidth="1.3"/>
              </svg>
              <span className="stat-name">Vente Carburants</span>
            </div>
            <span className="stat-period">Période sélectionnée</span>
          </div>
          <div className="stat-amount">{fmtDT(totalCarb)}</div>
          <div className="stat-vs">vs. période précédente</div>
          {cuves.length > 0 && (
            <div className="fuel-bars">
              {cuves.map((c, i) => (
                <div key={i} className="fuel-row">
                  <span className="fuel-label">{c.libelle}</span>
                  <div className="fuel-track">
                    <div className="fuel-fill" style={{ width: `${Math.round((c.quantite / maxCuve) * 100)}%` }} />
                  </div>
                  <span className="fuel-val">{c.quantite.toLocaleString('fr-TN')}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <div className="stat-label">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 5h12M2 8h8M2 11h6" stroke="var(--muted)" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
              <span className="stat-name">Vente Produits</span>
            </div>
            <span className="stat-period">Période sélectionnée</span>
          </div>
          <div className="stat-amount">{fmtDT(totalProd)}</div>
          <div className="stat-vs">vs. période précédente</div>
        </div>

        <div className="card">
          <div className="stat-label">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 12V7l5-4 5 4v5a1 1 0 01-1 1H4a1 1 0 01-1-1z" stroke="var(--muted)" strokeWidth="1.3"/>
              </svg>
              <span className="stat-name">Vente Services</span>
            </div>
            <span className="stat-period">Période sélectionnée</span>
          </div>
          <div className="stat-amount">{fmtDT(totalSvc)}</div>
          <div className="stat-vs">vs. période précédente</div>
        </div>
      </div>

      {/* RECENT ACTIVITY + FUEL CARD */}
      <div className="grid-bottom">
        <div className="card">
          <div className="activity-header">
            <div className="section-title">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h3l2-5 2 10 2-7 1 2h2" stroke="var(--teal)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Activité Récente
            </div>
            <div className="filter-sort">
              <button className="ctrl-btn" onClick={cycleFilter} style={activityFilter !== 'all' ? { color: 'var(--teal)', borderColor: 'var(--teal)' } : {}}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M1 3h10M3 6h6M5 9h2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
                {FILTER_LABEL[activityFilter]}
              </button>
              <button className="ctrl-btn" onClick={toggleSort}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 4h8M2 8h5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                  <path d={activitySort === 'desc' ? 'M9 6l2 2-2 2' : 'M9 10l2-2-2-2'} stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {activitySort === 'desc' ? 'Récent' : 'Ancien'}
              </button>
            </div>
          </div>

          <div className="table-header">
            <div className="th">Vendeur / Type</div>
            <div className="th">Montant</div>
            <div className="th">Statut</div>
            <div className="th">Mode Paiement</div>
          </div>

          {activity.length === 0 ? (
            <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
              Aucune activité récente
            </div>
          ) : activity.map((tx, i) => (
            <div key={i} className="tx-row">
              <div className="tx-info">
                <div className={`tx-dot ${tx.txType === 'recette' ? 'add' : 'send'}`}>
                  {tx.txType === 'recette' ? (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M6 2v8M2 6h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                    </svg>
                  ) : (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6h8M6 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
                <div>
                  <div className="tx-name">{tx.vendeur || tx.type || '—'}</div>
                  <div className="tx-sub">
                    {tx.txType === 'recette' ? 'Recette' : 'Dépense'} · {fmtDate(tx.date)}
                  </div>
                </div>
              </div>
              <div className="tx-amount" style={tx.txType === 'depense' ? { color: 'var(--red)' } : {}}>
                {fmtDT(tx.montant)}
              </div>
              <div><span className="status-badge success">Validé</span></div>
              <div><div className="tx-method">{tx.mode || '—'}</div></div>
            </div>
          ))}
        </div>

        {/* FUEL CARD */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div className="section-title">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M9 3C9 3 4 8.5 4 11.5a5 5 0 0010 0C14 8.5 9 3 9 3z" stroke="var(--teal)" strokeWidth="1.3"/>
              </svg>
              Stock Carburant
            </div>
            <span style={{ fontSize: 12, color: 'var(--teal)', fontWeight: 500, cursor: 'pointer' }} onClick={() => navigate('/ventes/carburants')}>
              Voir tout
            </span>
          </div>

          <div className="fuel-card-visual">
            <div className="fuel-type-label">Cuve principale</div>
            <div className="fuel-type-name">{cuves[0]?.libelle ?? '—'}</div>
            <div className="fuel-litres">{cuves[0] ? cuves[0].quantite.toLocaleString('fr-TN') + ' vendus' : '—'}</div>
            <div className="fuel-revenue">{fmtDT(totalCarb)}</div>
          </div>

          {cuves.length > 0 && (
            <div className="fuel-bars" style={{ marginTop: 16 }}>
              {cuves.map((c, i) => (
                <div key={i} className="fuel-row">
                  <span className="fuel-label">{c.libelle}</span>
                  <div className="fuel-track">
                    <div className="fuel-fill" style={{ width: `${Math.round((c.quantite / maxCuve) * 100)}%` }} />
                  </div>
                  <span className="fuel-val">{c.quantite.toLocaleString('fr-TN')}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
