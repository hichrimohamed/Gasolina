import { useState, useEffect, useCallback } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { getCalendarEvents, createCalendarEvent, updateCalendarEvent, deleteCalendarEvent, getWorkers } from '../api';
import './Calendar.css';

const localizer = momentLocalizer(moment);

function fmtDT(n) {
  if (n === null || n === undefined || isNaN(+n)) return null;
  return (+n).toLocaleString('fr-TN', { minimumFractionDigits: 3, maximumFractionDigits: 3 }) + ' DT';
}

function fmtEventDate(d) {
  if (!d) return '—';
  return new Intl.DateTimeFormat('fr-TN', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(d));
}

function toDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}

const TYPE_LABELS   = { livraison: 'Livraison', facture: 'Facture', paiement: 'Paiement' };
const STATUS_LABELS = { pending: 'En attente', done: 'Fait', cancelled: 'Annulé' };
const EMPTY_FORM    = { type: 'livraison', title: '', event_date: '', amount: '', reference: '', notes: '', status: 'pending', worker_id: '' };

const MESSAGES = {
  today: "Aujourd'hui", previous: '‹', next: '›',
  month: 'Mois', week: 'Semaine', day: 'Jour', agenda: 'Agenda',
  date: 'Date', time: 'Heure', event: 'Événement',
  noEventsInRange: 'Aucun événement sur cette période.',
};

// ── Icons ──────────────────────────────────────────────────
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

// ── Calendar page ──────────────────────────────────────────
export default function CalendarPage() {
  const today = new Date();

  const [calDate,     setCalDate]     = useState(today);
  const [events,      setEvents]      = useState([]);
  const [workers,     setWorkers]     = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [selectedDay, setSelectedDay] = useState(null);
  const [modalOpen,   setModalOpen]   = useState(false);
  const [editTarget,  setEditTarget]  = useState(null);
  const [saving,      setSaving]      = useState(false);
  const [form,        setForm]        = useState(EMPTY_FORM);
  const [activeTab,   setActiveTab]   = useState('livraison');

  // ── Data fetching ──────────────────────────────────────
  const fetchEvents = useCallback(() => {
    setLoading(true);
    getCalendarEvents(calDate.getFullYear(), calDate.getMonth() + 1)
      .then(r => setEvents(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [calDate]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  useEffect(() => {
    getWorkers().then(r => setWorkers(r.data)).catch(console.error);
  }, []);

  // ── Map to react-big-calendar event format ─────────────
  const rbcEvents = events.map(ev => ({
    id:       ev.id,
    title:    ev.title,
    start:    new Date(ev.event_date),
    end:      new Date(ev.event_date),
    allDay:   true,
    resource: ev,
  }));

  // ── Event color by type ────────────────────────────────
  function eventStyleGetter(event) {
    const type = event.resource?.type;
    const styles = {
      livraison: { backgroundColor: '#e0f0ee', color: 'var(--teal)',         border: '1px solid #b2ddd7' },
      facture:   { backgroundColor: 'var(--pending-bg)', color: 'var(--pending-text)', border: '1px solid #f3cc8a' },
      paiement:  { backgroundColor: 'var(--success-bg)', color: 'var(--success-text)', border: '1px solid #6ee7b7' },
    };
    return { style: { ...(styles[type] ?? {}), borderRadius: 4, fontSize: 11, fontWeight: 500, padding: '1px 5px' } };
  }

  // ── Navigation: re-fetch when month changes ────────────
  function handleNavigate(date) {
    setCalDate(date);
    setSelectedDay(null);
  }

  // ── Slot / event click ─────────────────────────────────
  function handleSelectSlot({ start }) {
    setSelectedDay(start);
  }

  function handleSelectEvent(rbcEv) {
    setSelectedDay(rbcEv.start);
  }

  // ── Right panel event list ─────────────────────────────
  const sideEvents = selectedDay
    ? events.filter(ev => ev.event_date.slice(0, 10) === toDateKey(selectedDay))
    : events;

  // ── Modal handlers ─────────────────────────────────────
  function openCreate(date) {
    const dateStr = date ? toDateKey(date) : '';
    setForm({ ...EMPTY_FORM, event_date: dateStr });
    setActiveTab('livraison');
    setEditTarget(null);
    setModalOpen(true);
  }
  function openEdit(ev) {
    setForm({
      type:       ev.type,
      title:      ev.title,
      event_date: ev.event_date.slice(0, 10),
      amount:     ev.amount ?? '',
      reference:  ev.reference ?? '',
      notes:      ev.notes ?? '',
      status:     ev.status,
      worker_id:  ev.worker_id ?? '',
    });
    setActiveTab(ev.type);
    setEditTarget(ev);
    setModalOpen(true);
  }
  function closeModal() {
    setModalOpen(false);
    setEditTarget(null);
    setForm(EMPTY_FORM);
  }
  function handleTabChange(type) {
    setActiveTab(type);
    setForm(f => ({ ...f, type }));
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    const payload = {
      type:       form.type,
      title:      form.title.trim(),
      event_date: form.event_date,
      amount:     form.amount !== '' ? parseFloat(form.amount) : null,
      reference:  form.reference.trim() || null,
      notes:      form.notes.trim() || null,
      status:     form.status,
      worker_id:  form.worker_id !== '' ? parseInt(form.worker_id) : null,
    };
    try {
      if (editTarget) await updateCalendarEvent(editTarget.id, payload);
      else            await createCalendarEvent(payload);
      closeModal();
      fetchEvents();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Supprimer cet événement ?')) return;
    await deleteCalendarEvent(id);
    fetchEvents();
  }

  // ── Render ─────────────────────────────────────────────
  return (
    <div className="calendar-page">

      {/* ── LEFT: react-big-calendar ── */}
      <div className="calendar-main card">
        <Calendar
          localizer={localizer}
          events={rbcEvents}
          date={calDate}
          onNavigate={handleNavigate}
          defaultView="month"
          views={['month', 'week', 'agenda']}
          selectable
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          eventPropGetter={eventStyleGetter}
          messages={MESSAGES}
          style={{ height: 560 }}
        />
        {loading && (
          <div style={{ textAlign: 'center', color: 'var(--muted)', fontSize: 12, marginTop: 10 }}>
            Chargement…
          </div>
        )}
      </div>

      {/* ── RIGHT: Event panel ── */}
      <div className="calendar-side">
        <div className="side-header">
          <div className="section-title" style={{ fontSize: 13 }}>
            {selectedDay ? fmtEventDate(selectedDay) : moment(calDate).format('MMMM YYYY')}
          </div>
          <button className="btn-primary" style={{ padding: '7px 14px', fontSize: 12 }} onClick={() => openCreate(selectedDay)}>
            + Ajouter
          </button>
        </div>

        <div className="side-events">
          {!loading && sideEvents.length === 0 && (
            <div className="side-empty">Aucun événement{selectedDay ? ' ce jour' : ' ce mois'}</div>
          )}
          {sideEvents.map(ev => (
            <div key={ev.id} className="ev-card">
              <div className="ev-card-top">
                <span className={`ev-type-badge ev-type-badge--${ev.type}`}>{TYPE_LABELS[ev.type]}</span>
                <div className="ev-card-actions">
                  <button className="ev-action-btn" title="Modifier" onClick={() => openEdit(ev)}><EditIcon /></button>
                  <button className="ev-action-btn ev-action-btn--delete" title="Supprimer" onClick={() => handleDelete(ev.id)}><TrashIcon /></button>
                </div>
              </div>
              <div className="ev-card-title">{ev.title}</div>
              {ev.reference && <div className="ev-card-ref">{ev.reference}</div>}
              <div className="ev-card-meta">
                <span>{fmtEventDate(ev.event_date)}</span>
                {ev.amount && <span className="ev-card-amount">{fmtDT(ev.amount)}</span>}
              </div>
              <span className={`status-badge ${ev.status === 'done' ? 'success' : ev.status === 'cancelled' ? 'cancelled' : 'pending'}`}>
                {STATUS_LABELS[ev.status]}
              </span>
              {ev.worker_name && (
                <div className="ev-card-worker">
                  <svg width="11" height="11" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
                    <circle cx="8" cy="6" r="3" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M3 14c0-2.8 2.2-5 5-5s5 2.2 5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  {ev.worker_name}
                </div>
              )}
              {ev.task_count > 0 && (
                <div className="ev-card-tasks">
                  <svg width="11" height="11" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
                    <rect x="2" y="2" width="7" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M10 9l1.5 1.5L14 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {ev.task_count} tâche{ev.task_count > 1 ? 's' : ''}
                </div>
              )}
              {ev.notes && <div className="ev-card-notes">{ev.notes}</div>}
            </div>
          ))}
        </div>
      </div>

      {/* ── MODAL ── */}
      {modalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{editTarget ? "Modifier l'événement" : 'Nouvel événement'}</h2>
              <button className="modal-close-btn" onClick={closeModal}>×</button>
            </div>

            <div className="tab-group" style={{ marginBottom: 18 }}>
              {['livraison', 'facture', 'paiement'].map(t => (
                <div
                  key={t}
                  className={`tab${activeTab === t ? ' active' : ''}`}
                  onClick={() => handleTabChange(t)}
                >
                  {TYPE_LABELS[t]}
                </div>
              ))}
            </div>

            <form onSubmit={handleSave} className="modal-form">
              <label>
                Titre *
                <input
                  required
                  placeholder={activeTab === 'livraison' ? 'Ex: Livraison Gasoil' : activeTab === 'facture' ? 'Ex: Facture fournisseur' : 'Ex: Règlement facture'}
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                />
              </label>

              <label>
                Date *
                <input
                  type="date"
                  required
                  value={form.event_date}
                  onChange={e => setForm(f => ({ ...f, event_date: e.target.value }))}
                />
              </label>

              <label>
                {activeTab === 'livraison' ? 'Fournisseur / Référence' : activeTab === 'facture' ? 'N° Facture' : 'Destinataire / Référence'}
                <input
                  placeholder={activeTab === 'livraison' ? 'Ex: Total Énergies' : activeTab === 'facture' ? 'Ex: F-2026-0042' : 'Ex: Fournisseur X'}
                  value={form.reference}
                  onChange={e => setForm(f => ({ ...f, reference: e.target.value }))}
                />
              </label>

              {(activeTab === 'facture' || activeTab === 'paiement') && (
                <label>
                  Montant (DT)
                  <input
                    type="number"
                    step="0.001"
                    min="0"
                    placeholder="0.000"
                    value={form.amount}
                    onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                  />
                </label>
              )}

              <label>
                Statut
                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                  <option value="pending">En attente</option>
                  <option value="done">Fait</option>
                  <option value="cancelled">Annulé</option>
                </select>
              </label>

              {workers.length > 0 && (
                <label>
                  Responsable
                  <select value={form.worker_id} onChange={e => setForm(f => ({ ...f, worker_id: e.target.value }))}>
                    <option value="">— Non assigné —</option>
                    {workers.map(w => (
                      <option key={w.id} value={w.id}>{w.name}{w.poste ? ` (${w.poste})` : ''}</option>
                    ))}
                  </select>
                </label>
              )}

              <label>
                Notes
                <textarea
                  placeholder="Informations supplémentaires…"
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
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
