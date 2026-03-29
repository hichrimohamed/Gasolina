import { useEffect, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { getVentesCarb, getVentesProd, getVentesServ } from '../api';
import { useDate } from '../context/DateContext';
import { useExport } from '../context/ExportContext';
import { downloadCSV } from '../utils/csv';
import FuelSalesChart    from '../components/charts/FuelSalesChart';
import ProductSalesChart from '../components/charts/ProductSalesChart';
import ServiceSalesChart from '../components/charts/ServiceSalesChart';

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

export default function Ventes() {
  const { pathname } = useLocation();
  const active = pathname.includes('produits') ? 'produits'
               : pathname.includes('services') ? 'services'
               : 'carburants';

  const { from, to } = useDate();
  const { registerExport } = useExport();
  const [params] = useSearchParams();
  const q = (params.get('q') ?? '').toLowerCase();

  const [carb, setCarb] = useState([]);
  const [prod, setProd] = useState([]);
  const [serv, setServ] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getVentesCarb(from, to),
      getVentesProd(from, to),
      getVentesServ(from, to),
    ])
      .then(([c, p, s]) => { setCarb(c.data); setProd(p.data); setServ(s.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [from, to]);

  const filteredCarb = q ? carb.filter(r => (r.date ?? '').toLowerCase().includes(q)) : carb;
  const filteredProd = q ? prod.filter(r => [r.libelle, r.famille, r.date].join(' ').toLowerCase().includes(q)) : prod;
  const filteredServ = q ? serv.filter(r => [r.lib_service, r.date].join(' ').toLowerCase().includes(q)) : serv;

  const exportData = active === 'produits' ? filteredProd : active === 'services' ? filteredServ : filteredCarb;
  useEffect(() => {
    registerExport(() => downloadCSV(exportData, `ventes-${active}.csv`));
  }, [exportData, active]); // eslint-disable-line

  return (
    <>
      <div className="card" style={{ padding: '16px 22px' }}>
        <div className="section-header" style={{ marginBottom: 0 }}>
          <div className="section-title">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M9 3C9 3 4 8.5 4 11.5a5 5 0 0010 0C14 8.5 9 3 9 3z" stroke="var(--teal)" strokeWidth="1.5"/>
            </svg>
            Ventes &mdash; {active === 'carburants' ? 'Carburants' : active === 'produits' ? 'Produits' : 'Services'}
          </div>
        </div>
      </div>

      {/* ── CARBURANTS ── */}
      {active === 'carburants' && (
        <div className="card">
          <div className="section-header">
            <div className="section-title">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M9 3C9 3 4 8.5 4 11.5a5 5 0 0010 0C14 8.5 9 3 9 3z" stroke="var(--teal)" strokeWidth="1.3"/>
              </svg>
              Vente Carburants
            </div>
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>{filteredCarb.length} jours</span>
          </div>
          {loading ? <SkeletonTable grid="1.4fr 1fr 1fr 1fr 1.2fr 1.2fr" cols={6} /> : (
            <>
              <THead cols={['Date', 'SSP', 'Gasoil', 'Gasoil 50', 'Total Jour', 'Total Cumulé']}
                     grid="1.4fr 1fr 1fr 1fr 1.2fr 1.2fr" />
              {filteredCarb.length === 0 ? <Empty /> : filteredCarb.map(r => (
                <div key={r.id} className="tx-row" style={{ gridTemplateColumns: '1.4fr 1fr 1fr 1fr 1.2fr 1.2fr' }}>
                  <div style={{ fontSize: 13 }}>{fmtDate(r.date)}</div>
                  <div style={mono}>{fmtDT(r.ssp)}</div>
                  <div style={mono}>{fmtDT(r.gasoil)}</div>
                  <div style={mono}>{fmtDT(r.gasoil_50)}</div>
                  <div style={{ ...mono, fontWeight: 600, color: 'var(--text)' }}>{fmtDT(r.total_jour)}</div>
                  <div style={{ ...mono, color: 'var(--muted)' }}>{fmtDT(r.total_cumule)}</div>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {/* ── CARBURANTS CHARTS ── */}
      {active === 'carburants' && !loading && filteredCarb.length > 0 && (
        <div className="card">
          <div className="section-header">
            <div className="section-title">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 12l3-4 3 2 3-5 3 3" stroke="var(--teal)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Graphiques — Carburants
            </div>
          </div>
          <FuelSalesChart data={filteredCarb} />
        </div>
      )}

      {/* ── PRODUITS ── */}
      {active === 'produits' && (
        <div className="card">
          <div className="section-header">
            <div className="section-title">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 5h12M2 8h8M2 11h6" stroke="var(--teal)" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
              Vente Produits
            </div>
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>{filteredProd.length} lignes</span>
          </div>
          {loading ? <SkeletonTable grid="1.2fr 2fr 1.2fr 0.8fr 1fr 1.2fr" cols={6} /> : (
            <>
              <THead cols={['Date', 'Libellé', 'Famille', 'Qté', 'Prix', 'Montant']}
                     grid="1.2fr 2fr 1.2fr 0.8fr 1fr 1.2fr" />
              {filteredProd.length === 0 ? <Empty /> : filteredProd.map(r => (
                <div key={r.id} className="tx-row" style={{ gridTemplateColumns: '1.2fr 2fr 1.2fr 0.8fr 1fr 1.2fr' }}>
                  <div style={{ fontSize: 13 }}>{fmtDate(r.date)}</div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{r.libelle ?? '—'}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>{r.famille ?? '—'}</div>
                  <div style={mono}>{r.quantite ?? '—'}</div>
                  <div style={mono}>{fmtDT(r.prix)}</div>
                  <div style={{ ...mono, fontWeight: 600 }}>{fmtDT(r.montant)}</div>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {/* ── PRODUITS CHARTS ── */}
      {active === 'produits' && !loading && filteredProd.length > 0 && (
        <div className="card">
          <div className="section-header">
            <div className="section-title">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 12l3-4 3 2 3-5 3 3" stroke="var(--teal)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Graphiques — Produits
            </div>
          </div>
          <ProductSalesChart data={filteredProd} />
        </div>
      )}

      {/* ── SERVICES ── */}
      {active === 'services' && (
        <div className="card">
          <div className="section-header">
            <div className="section-title">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 12V7l5-4 5 4v5a1 1 0 01-1 1H4a1 1 0 01-1-1z" stroke="var(--teal)" strokeWidth="1.3"/>
              </svg>
              Vente Services
            </div>
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>{filteredServ.length} lignes</span>
          </div>
          {loading ? <SkeletonTable grid="1.2fr 2.5fr 0.8fr 1.2fr 1.2fr" cols={5} /> : (
            <>
              <THead cols={['Date', 'Service', 'Qté', 'PXV TTC', 'TTC Vente']}
                     grid="1.2fr 2.5fr 0.8fr 1.2fr 1.2fr" />
              {filteredServ.length === 0 ? <Empty /> : filteredServ.map(r => (
                <div key={r.id} className="tx-row" style={{ gridTemplateColumns: '1.2fr 2.5fr 0.8fr 1.2fr 1.2fr' }}>
                  <div style={{ fontSize: 13 }}>{fmtDate(r.date)}</div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{r.lib_service ?? '—'}</div>
                  <div style={mono}>{r.quantite ?? '—'}</div>
                  <div style={mono}>{fmtDT(r.pxv_ttc)}</div>
                  <div style={{ ...mono, fontWeight: 600 }}>{fmtDT(r.ttc_vente_prod)}</div>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {/* ── SERVICES CHARTS ── */}
      {active === 'services' && !loading && filteredServ.length > 0 && (
        <div className="card">
          <div className="section-header">
            <div className="section-title">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 12l3-4 3 2 3-5 3 3" stroke="var(--teal)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Graphiques — Services
            </div>
          </div>
          <ServiceSalesChart data={filteredServ} />
        </div>
      )}
    </>
  );
}
