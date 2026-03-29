import { useEffect, useState } from 'react';
import UploadPanel from '../components/UploadPanel';
import { getUploadLog } from '../api';

function fmtDate(d) {
  if (!d) return '—';
  return new Intl.DateTimeFormat('fr-TN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(d));
}

const TABLE_LABELS = {
  vente_carburants:       'Vente Carburants',
  vente_produits:         'Vente Produits',
  vente_services:         'Vente Services',
  achat_carburants:       'Achat Carburants',
  detail_achat_carburants:'Détail Achats Carb.',
  achat_produits:         'Achat Produits',
  marge_carburants:       'Marge Carburants',
  marge_produits:         'Marge Produits',
  marge_services:         'Marge Services',
  recettes:               'Recettes',
  depenses:               'Dépenses',
  daily_state:            'État Journalier',
};

export default function Upload() {
  const [log, setLog] = useState([]);

  function fetchLog() {
    getUploadLog().then(r => setLog(r.data)).catch(console.error);
  }

  useEffect(() => { fetchLog(); }, []);

  return (
    <>
      {/* Header */}
      <div className="card" style={{ padding: '16px 22px' }}>
        <div className="section-title">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 2v7M5 5l3-3 3 3" stroke="var(--teal)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 11v1a2 2 0 002 2h8a2 2 0 002-2v-1" stroke="var(--teal)" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          Import Fichiers Excel
        </div>
      </div>

      {/* Upload zone */}
      <div className="grid-2" style={{ gridTemplateColumns: '1fr 320px' }}>
        <div className="card">
          <div className="section-header">
            <div className="section-title">Déposer un fichier</div>
          </div>
          <UploadPanel onSuccess={fetchLog} />
          <div style={{ marginTop: 16, padding: '12px 16px', background: 'var(--bg)', borderRadius: 10, fontSize: 12, color: 'var(--muted)', lineHeight: 1.8 }}>
            <strong style={{ color: 'var(--text)', display: 'block', marginBottom: 6 }}>Fichiers acceptés :</strong>
            {Object.values(TABLE_LABELS).map(l => (
              <span key={l} style={{ display: 'inline-block', marginRight: 8, marginBottom: 4, padding: '2px 8px', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 20 }}>{l}</span>
            ))}
          </div>
        </div>

        {/* Stats card */}
        <div className="card">
          <div className="section-header">
            <div className="section-title">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 12l4-4 3 3 5-6" stroke="var(--teal)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Résumé
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: 'var(--muted)' }}>Imports totaux</span>
              <span style={{ fontSize: 20, fontWeight: 600 }}>{log.length}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: 'var(--muted)' }}>Lignes insérées</span>
              <span style={{ fontSize: 20, fontWeight: 600 }}>
                {log.reduce((s, l) => s + (l.rows_inserted || 0), 0).toLocaleString('fr-TN')}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: 'var(--muted)' }}>Dernier import</span>
              <span style={{ fontSize: 13, fontWeight: 500 }}>{log[0] ? fmtDate(log[0].uploaded_at) : '—'}</span>
            </div>
          </div>

          {/* Table breakdown */}
          <div style={{ marginTop: 20 }}>
            <div className="th" style={{ marginBottom: 10 }}>Par table</div>
            {Object.keys(TABLE_LABELS).map(table => {
              const count = log.filter(l => l.table_target === table).length;
              return count > 0 ? (
                <div key={table} className="fuel-row">
                  <span className="fuel-label">{TABLE_LABELS[table]}</span>
                  <div className="fuel-track">
                    <div className="fuel-fill" style={{ width: `${Math.round((count / log.length) * 100)}%` }} />
                  </div>
                  <span className="fuel-val">{count}×</span>
                </div>
              ) : null;
            })}
          </div>
        </div>
      </div>

      {/* Log table */}
      <div className="card">
        <div className="section-header">
          <div className="section-title">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 3h12M2 8h8M2 13h5" stroke="var(--teal)" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Historique des imports
          </div>
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>{log.length} entrées</span>
        </div>

        <div className="table-header" style={{ gridTemplateColumns: '2fr 1.5fr 1fr 1.5fr' }}>
          <div className="th">Fichier</div>
          <div className="th">Table</div>
          <div className="th">Lignes</div>
          <div className="th">Date</div>
        </div>

        {log.length === 0 ? (
          <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
            Aucun import effectué
          </div>
        ) : log.map(l => (
          <div key={l.id} className="tx-row" style={{ gridTemplateColumns: '2fr 1.5fr 1fr 1.5fr' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{l.filename}</div>
            </div>
            <div>
              <span className="status-badge success">{TABLE_LABELS[l.table_target] ?? l.table_target}</span>
            </div>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, fontWeight: 600 }}>
              {(l.rows_inserted || 0).toLocaleString('fr-TN')}
            </div>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>{fmtDate(l.uploaded_at)}</div>
          </div>
        ))}
      </div>
    </>
  );
}
