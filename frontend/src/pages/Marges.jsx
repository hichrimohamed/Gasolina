import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getMargesCarb, getMargesProd, getMargesServ } from '../api';
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
  return <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>Aucune donnée</div>;
}

const SK = () => <div className="skeleton" style={{ height: 14, borderRadius: 4 }} />;

function SkeletonSummaryCard() {
  return (
    <div className="card" style={{ flex: 1 }}>
      <div className="skeleton" style={{ height: 14, width: 80, marginBottom: 12 }} />
      <div className="skeleton" style={{ height: 32, width: 160, marginBottom: 6 }} />
      <div className="skeleton" style={{ height: 11, width: 70, marginBottom: 20 }} />
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="fuel-row">
          <div className="skeleton" style={{ height: 10, width: 60 }} />
          <div className="fuel-track"><div className="skeleton" style={{ height: 6 }} /></div>
          <div className="skeleton" style={{ height: 10, width: 50 }} />
        </div>
      ))}
    </div>
  );
}

function MargeRow({ name, marge, vhtAchat, vhtVente, extra, grid }) {
  const isPositive = +marge > 0;
  return (
    <div className="tx-row" style={{ gridTemplateColumns: grid }}>
      <div style={{ fontSize: 13, fontWeight: 500 }}>{name}</div>
      {extra}
      <div style={mono}>{fmtDT(vhtAchat)}</div>
      <div style={mono}>{fmtDT(vhtVente)}</div>
      <div style={{ ...mono, fontWeight: 600, color: isPositive ? 'var(--success-text)' : 'var(--red)' }}>
        {isPositive ? '+' : ''}{fmtDT(marge)}
      </div>
    </div>
  );
}

function SummaryCard({ title, icon, rows, nameKey, total }) {
  return (
    <div className="card" style={{ flex: 1 }}>
      <div className="section-title" style={{ marginBottom: 12 }}>
        {icon}
        {title}
      </div>
      <div style={{ fontSize: 28, fontWeight: 600, marginBottom: 4 }}>
        {fmtDT(total)}{' '}
        <span style={{ fontSize: 13, color: total >= 0 ? 'var(--success-text)' : 'var(--red)', fontWeight: 500 }}>DT</span>
      </div>
      <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 16 }}>Marge totale</div>
      <div className="fuel-bars">
        {rows.slice(0, 5).map((r, i) => {
          const maxM = Math.max(...rows.map(x => Math.abs(+x.marge || 0)), 1);
          const pct  = Math.round((Math.abs(+r.marge || 0) / maxM) * 100);
          return (
            <div key={i} className="fuel-row">
              <span className="fuel-label">{r[nameKey] ?? '—'}</span>
              <div className="fuel-track">
                <div className="fuel-fill" style={{ width: `${pct}%`, background: +r.marge >= 0 ? 'var(--green)' : 'var(--red)' }} />
              </div>
              <span className="fuel-val">{fmtDT(r.marge)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Marges() {
  const { registerExport } = useExport();
  const [params] = useSearchParams();
  const q = (params.get('q') ?? '').toLowerCase();

  const [carb, setCarb] = useState([]);
  const [prod, setProd] = useState([]);
  const [serv, setServ] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getMargesCarb(), getMargesProd(), getMargesServ()])
      .then(([c, p, s]) => { setCarb(c.data); setProd(p.data); setServ(s.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const totalCarb = carb.reduce((s, r) => s + (+r.marge || 0), 0);
  const totalProd = prod.reduce((s, r) => s + (+r.marge || 0), 0);
  const totalServ = serv.reduce((s, r) => s + (+r.marge || 0), 0);

  const filteredCarb = q ? carb.filter(r => (r.lib_produit ?? '').toLowerCase().includes(q)) : carb;
  const filteredProd = q ? prod.filter(r => (r.lib_produit ?? '').toLowerCase().includes(q)) : prod;
  const filteredServ = q ? serv.filter(r => (r.libelle ?? '').toLowerCase().includes(q)) : serv;

  useEffect(() => {
    registerExport(() => downloadCSV([...filteredCarb, ...filteredProd, ...filteredServ], 'marges.csv'));
  }, [filteredCarb, filteredProd, filteredServ]); // eslint-disable-line

  const carbIcon = <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ marginRight: 8 }}><path d="M9 3C9 3 4 8.5 4 11.5a5 5 0 0010 0C14 8.5 9 3 9 3z" stroke="var(--teal)" strokeWidth="1.3"/></svg>;
  const prodIcon = <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ marginRight: 8 }}><path d="M2 5h12M2 8h8M2 11h6" stroke="var(--teal)" strokeWidth="1.3" strokeLinecap="round"/></svg>;
  const servIcon = <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ marginRight: 8 }}><path d="M3 12V7l5-4 5 4v5a1 1 0 01-1 1H4a1 1 0 01-1-1z" stroke="var(--teal)" strokeWidth="1.3"/></svg>;

  return (
    <>
      {/* Summary cards */}
      <div className="grid-3">
        {loading ? (
          <><SkeletonSummaryCard /><SkeletonSummaryCard /><SkeletonSummaryCard /></>
        ) : (
          <>
            <SummaryCard title="Carburants" icon={carbIcon} rows={carb} nameKey="lib_produit" total={totalCarb} />
            <SummaryCard title="Produits"   icon={prodIcon} rows={prod} nameKey="lib_produit" total={totalProd} />
            <SummaryCard title="Services"   icon={servIcon} rows={serv} nameKey="libelle"     total={totalServ} />
          </>
        )}
      </div>

      {/* Detail tables */}
      <div className="card">
        <div className="section-header">
          <div className="section-title">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 12l4-4 3 3 5-6" stroke="var(--teal)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Marges Carburants
          </div>
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>{filteredCarb.length} produits</span>
        </div>
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="tx-row" style={{ gridTemplateColumns: '2fr 1.2fr 1.2fr 1.2fr 1.3fr' }}>
              <SK /><SK /><SK /><SK /><SK />
            </div>
          ))
        ) : (
          <>
            <THead cols={['Produit', 'VHT Px Achat', 'VHT Px Vente', 'Marge', 'Rapport']}
                   grid="2fr 1.2fr 1.2fr 1.2fr 1.3fr" />
            {filteredCarb.length === 0 ? <Empty /> : filteredCarb.map(r => (
              <MargeRow key={r.id} grid="2fr 1.2fr 1.2fr 1.2fr 1.3fr"
                name={r.lib_produit} marge={r.marge} vhtAchat={r.v_ht_px_achat} vhtVente={r.v_ht_px_vente}
                extra={<div style={{ fontSize: 12, color: 'var(--muted)' }}>{fmtDate(r.report_date)}</div>}
              />
            ))}
          </>
        )}
      </div>

      <div className="card">
        <div className="section-header">
          <div className="section-title">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 12l4-4 3 3 5-6" stroke="var(--teal)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Marges Produits
          </div>
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>{filteredProd.length} produits</span>
        </div>
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="tx-row" style={{ gridTemplateColumns: '2fr 0.8fr 1.2fr 1.2fr 1.2fr 1.3fr' }}>
              <SK /><SK /><SK /><SK /><SK /><SK />
            </div>
          ))
        ) : (
          <>
            <THead cols={['Produit', 'Qté', 'VHT Px Achat', 'VHT Px Vente', 'Marge', 'Rapport']}
                   grid="2fr 0.8fr 1.2fr 1.2fr 1.2fr 1.3fr" />
            {filteredProd.length === 0 ? <Empty /> : filteredProd.map(r => (
              <div key={r.id} className="tx-row" style={{ gridTemplateColumns: '2fr 0.8fr 1.2fr 1.2fr 1.2fr 1.3fr' }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{r.lib_produit ?? '—'}</div>
                <div style={mono}>{r.quantite ?? '—'}</div>
                <div style={mono}>{fmtDT(r.v_ht_px_achat)}</div>
                <div style={mono}>{fmtDT(r.v_ht_px_vente)}</div>
                <div style={{ ...mono, fontWeight: 600, color: +r.marge >= 0 ? 'var(--success-text)' : 'var(--red)' }}>
                  {+r.marge >= 0 ? '+' : ''}{fmtDT(r.marge)}
                </div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>{fmtDate(r.report_date)}</div>
              </div>
            ))}
          </>
        )}
      </div>

      <div className="card">
        <div className="section-header">
          <div className="section-title">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 12l4-4 3 3 5-6" stroke="var(--teal)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Marges Services
          </div>
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>{filteredServ.length} services</span>
        </div>
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="tx-row" style={{ gridTemplateColumns: '2fr 0.8fr 1.2fr 1.2fr 1.2fr 1.3fr' }}>
              <SK /><SK /><SK /><SK /><SK /><SK />
            </div>
          ))
        ) : (
          <>
            <THead cols={['Service', 'Qté', 'VHT Px Achat', 'VHT Px Vente', 'Marge', 'Rapport']}
                   grid="2fr 0.8fr 1.2fr 1.2fr 1.2fr 1.3fr" />
            {filteredServ.length === 0 ? <Empty /> : filteredServ.map(r => (
              <div key={r.id} className="tx-row" style={{ gridTemplateColumns: '2fr 0.8fr 1.2fr 1.2fr 1.2fr 1.3fr' }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{r.libelle ?? '—'}</div>
                <div style={mono}>{r.quantite ?? '—'}</div>
                <div style={mono}>{fmtDT(r.v_ht_px_achat)}</div>
                <div style={mono}>{fmtDT(r.v_ht_px_vente)}</div>
                <div style={{ ...mono, fontWeight: 600, color: +r.marge >= 0 ? 'var(--success-text)' : 'var(--red)' }}>
                  {+r.marge >= 0 ? '+' : ''}{fmtDT(r.marge)}
                </div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>{fmtDate(r.report_date)}</div>
              </div>
            ))}
          </>
        )}
      </div>
    </>
  );
}
