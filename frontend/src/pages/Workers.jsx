import { useState, useEffect } from 'react';
import { getWorkers, createWorker, updateWorker, deactivateWorker } from '../api';
import './Workers.css';

const EMPTY_FORM = { name: '', poste: '', phone: '' };

const EditIcon = () => (
  <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
    <path d="M9.5 2.5l2 2-7 7H2.5v-2l7-7z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const TrashIcon = () => (
  <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
    <path d="M2 4h10M5 4V3a1 1 0 011-1h2a1 1 0 011 1v1M11 4l-.8 7.2a1 1 0 01-1 .8H4.8a1 1 0 01-1-.8L3 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function Workers() {
  const [workers,    setWorkers]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [modalOpen,  setModalOpen]  = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form,       setForm]       = useState(EMPTY_FORM);
  const [saving,     setSaving]     = useState(false);

  function fetchWorkers() {
    setLoading(true);
    getWorkers()
      .then(r => setWorkers(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }

  useEffect(() => { fetchWorkers(); }, []);

  function openCreate() {
    setForm(EMPTY_FORM);
    setEditTarget(null);
    setModalOpen(true);
  }

  function openEdit(w) {
    setForm({ name: w.name, poste: w.poste ?? '', phone: w.phone ?? '' });
    setEditTarget(w);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditTarget(null);
    setForm(EMPTY_FORM);
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    const payload = { name: form.name.trim(), poste: form.poste.trim() || null, phone: form.phone.trim() || null };
    try {
      if (editTarget) await updateWorker(editTarget.id, payload);
      else            await createWorker(payload);
      closeModal();
      fetchWorkers();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  async function handleDeactivate(id) {
    if (!window.confirm('Retirer cet employé ?')) return;
    await deactivateWorker(id);
    fetchWorkers();
  }

  return (
    <div className="workers-page">
      <div className="page-header">
        <div>
          <h1 className="section-title">Personnel</h1>
          <p className="page-subtitle">Gestion des employés de la station</p>
        </div>
        <button className="btn-primary" onClick={openCreate}>+ Ajouter un employé</button>
      </div>

      <div className="card workers-card">
        {loading ? (
          <div className="workers-loading">Chargement…</div>
        ) : workers.length === 0 ? (
          <div className="workers-empty">Aucun employé enregistré. Commencez par en ajouter un.</div>
        ) : (
          <table className="tx-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Poste</th>
                <th>Téléphone</th>
                <th style={{ width: 80 }}></th>
              </tr>
            </thead>
            <tbody>
              {workers.map(w => (
                <tr key={w.id}>
                  <td className="workers-name">
                    <div className="workers-avatar">{w.name.slice(0,2).toUpperCase()}</div>
                    {w.name}
                  </td>
                  <td>{w.poste || <span style={{ color: 'var(--muted)' }}>—</span>}</td>
                  <td>{w.phone || <span style={{ color: 'var(--muted)' }}>—</span>}</td>
                  <td>
                    <div className="workers-actions">
                      <button className="ev-action-btn" title="Modifier" onClick={() => openEdit(w)}><EditIcon /></button>
                      <button className="ev-action-btn ev-action-btn--delete" title="Retirer" onClick={() => handleDeactivate(w.id)}><TrashIcon /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{editTarget ? 'Modifier un employé' : 'Nouvel employé'}</h2>
              <button className="modal-close-btn" onClick={closeModal}>×</button>
            </div>
            <form onSubmit={handleSave} className="modal-form">
              <label>
                Nom *
                <input
                  required
                  placeholder="Ex: Ali Ben Salah"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                />
              </label>
              <label>
                Poste
                <input
                  placeholder="Ex: Pompiste, Gérant, Caissier…"
                  value={form.poste}
                  onChange={e => setForm(f => ({ ...f, poste: e.target.value }))}
                />
              </label>
              <label>
                Téléphone
                <input
                  placeholder="Ex: 29 000 000"
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                />
              </label>
              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={closeModal}>Annuler</button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? 'Enregistrement…' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
