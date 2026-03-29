import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getAchatsCarb, getAchatsProd } from '../api';
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

export default function Achats() {
  const { from, to } = useDate();
  const { registerExport } = useExport();
  const [params] = useSearchParams();
  const q = (params.get('q') ?? '').toLowerCase();

  const [carb, setCarb] = useState([]);
  const [prod, setProd] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([getAchatsCarb(from, to), getAchatsProd(from, to)])
      .then(([c, p]) => { setCarb(c.data); setProd(p.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [from, to]);

  const filteredCarb = q ? carb.filter(r => [r.facture, r.achat, r.date_achat].join(' ').toLowerCase().includes(q)) : carb;
  const filteredProd = q ? prod.filter(r => [r.facture, r.date].join(' ').toLowerCase().includes(q)) : prod;

  useEffect(() => {
    registerExport(() => downloadCSV([...filteredCarb, ...filteredProd], 'achats.csv'));
  }, [filteredCarb, filteredProd]); // eslint-disable-line

  return (
    <>
      <div className="card" style={{ padding: '16px 22px' }}>
        <div className="section-header" style={{ marginBottom: 0 }}>
          <div className="section-title">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 3h12M2 8h8M2 13h5" stroke="var(--teal)" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Achats
          </div>
        </div>
      </div>

      {/* ── CARBURANTS ── */}
      <div className="card">
        <div className="section-header">
          <div className="section-title">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M9 3C9 3 4 8.5 4 11.5a5 5 0 0010 0C14 8.5 9 3 9 3z" stroke="var(--teal)" strokeWidth="1.3"/>
            </svg>
            Achats Carburants
          </div>
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>{filteredCarb.length} achats</span>
        </div>
        {loading ? <SkeletonTable grid="1fr 1.3fr 1fr 1.3fr 1.2fr" cols={5} /> : (
          <>
            <THead cols={['N° Achat', 'Date Achat', 'N° Facture', 'Date Facture', 'Total HT']}
                   grid="1fr 1.3fr 1fr 1.3fr 1.2fr" />
            {filteredCarb.length === 0 ? <Empty /> : filteredCarb.map(r => (
              <div key={r.id} className="tx-row" style={{ gridTemplateColumns: '1fr 1.3fr 1fr 1.3fr 1.2fr' }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{r.achat ?? '—'}</div>
                <div style={{ fontSize: 13 }}>{fmtDate(r.date_achat)}</div>
                <div style={{ ...mono, color: 'var(--muted)' }}>{r.facture ?? '—'}</div>
                <div style={{ fontSize: 13 }}>{fmtDate(r.date_facture)}</div>
                <div style={{ ...mono, fontWeight: 600 }}>{fmtDT(r.total)}</div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* ── PRODUITS ── */}
      <div className="card">
        <div className="section-header">
          <div className="section-title">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 5h12M2 8h8M2 11h6" stroke="var(--teal)" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
            Achats Produits
          </div>
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>{filteredProd.length} achats</span>
        </div>
        {loading ? <SkeletonTable grid="1.3fr 1fr 1.3fr 1.2fr" cols={4} /> : (
          <>
            <THead cols={['Date', 'N° Facture', 'Date Facture', 'Total']}
                   grid="1.3fr 1fr 1.3fr 1.2fr" />
            {filteredProd.length === 0 ? <Empty /> : filteredProd.map(r => (
              <div key={r.id} className="tx-row" style={{ gridTemplateColumns: '1.3fr 1fr 1.3fr 1.2fr' }}>
                <div style={{ fontSize: 13 }}>{fmtDate(r.date)}</div>
                <div style={{ ...mono, color: 'var(--muted)' }}>{r.facture ?? '—'}</div>
                <div style={{ fontSize: 13 }}>{fmtDate(r.date_facture)}</div>
                <div style={{ ...mono, fontWeight: 600 }}>{fmtDT(r.total)}</div>
              </div>
            ))}
          </>
        )}
      </div>
    </>
  );
}
