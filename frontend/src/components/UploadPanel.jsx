import { useState } from 'react';
import { uploadFile } from '../api';

export default function UploadPanel({ onSuccess }) {
  const [status, setStatus]   = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    setLoading(true);
    setStatus(null);
    try {
      const { data } = await uploadFile(fd);
      setStatus({ ok: true, message: `${data.rows} lignes insérées dans ${data.table}` });
      onSuccess?.();
    } catch (err) {
      setStatus({ ok: false, message: err.response?.data?.error || err.message });
    } finally {
      setLoading(false);
      e.target.value = '';
    }
  }

  return (
    <label style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      gap: 12, padding: '40px 24px',
      border: '2px dashed var(--border)', borderRadius: 12,
      cursor: loading ? 'not-allowed' : 'pointer',
      background: 'var(--card)', transition: 'border-color .15s',
    }}>
      <input type="file" accept=".xls,.xlsx" onChange={handleChange}
        disabled={loading} style={{ display: 'none' }} />

      <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--bg)', display: 'grid', placeItems: 'center' }}>
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <path d="M11 3v11M7 7l4-4 4 4" stroke="var(--teal)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M3 16v1a2 2 0 002 2h12a2 2 0 002-2v-1" stroke="var(--muted)" strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
      </div>

      <div style={{ textAlign: 'center' }}>
        <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 4 }}>
          {loading ? 'Chargement…' : 'Déposer un fichier Excel'}
        </div>
        <div style={{ fontSize: 12, color: 'var(--muted)' }}>.xls ou .xlsx — max 10 MB</div>
      </div>

      {status && (
        <div style={{
          padding: '10px 16px', borderRadius: 8, fontSize: 13, fontWeight: 500,
          background: status.ok ? 'var(--success-bg)' : '#fff0f2',
          color:      status.ok ? 'var(--success-text)' : 'var(--red)',
        }}>
          {status.message}
        </div>
      )}
    </label>
  );
}
