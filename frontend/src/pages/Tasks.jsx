import { useState, useEffect, useCallback } from 'react';
import { getTasks, createTask, updateTask, deleteTask, getWorkers, getAllCalendarEvents } from '../api';
import './Tasks.css';

const COLUMNS = [
  { key: 'todo',       label: 'À faire',  },
  { key: 'inprogress', label: 'En cours', },
  { key: 'done',       label: 'Fait',     },
];

const PREV_STATUS = { inprogress: 'todo', done: 'inprogress' };
const NEXT_STATUS = { todo: 'inprogress', inprogress: 'done' };

const EMPTY_FORM = {
  title: '', description: '', status: 'todo',
  worker_id: '', calendar_event_id: '', due_date: '',
};

function fmtDate(d) {
  if (!d) return null;
  return new Intl.DateTimeFormat('fr-TN', { day: '2-digit', month: 'short', year: 'numeric' })
    .format(new Date(d));
}

function isPast(d) {
  if (!d) return false;
  return new Date(d) < new Date(new Date().toDateString());
}

// ── Icons ──────────────────────────────────────────────────
const ArrowLeftIcon = () => (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
    <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const ArrowRightIcon = () => (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
    <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
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
const PersonIcon = () => (
  <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="6" r="3" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M3 14c0-2.8 2.2-5 5-5s5 2.2 5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);
const CalIcon = () => (
  <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
    <rect x="2" y="3" width="12" height="11" rx="2" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M5 1v4M11 1v4M2 7h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);
const LinkIcon = () => (
  <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
    <path d="M6 10l4-4M9 4h3v3M7 12H4a2 2 0 010-4h2M9 4a2 2 0 010 4h-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// ── Task card ──────────────────────────────────────────────
function TaskCard({ task, onEdit, onDelete, onMove }) {
  const overdue = isPast(task.due_date) && task.status !== 'done';

  return (
    <div className={`task-card${task.status === 'done' ? ' task-card--done' : ''}`}>
      <div className="task-card-title">{task.title}</div>

      {task.description && (
        <div className="task-card-desc">{task.description}</div>
      )}

      <div className="task-card-meta">
        {task.worker_name && (
          <span className="task-meta-item">
            <PersonIcon /> {task.worker_name}
          </span>
        )}
        {task.due_date && (
          <span className={`task-meta-item${overdue ? ' task-meta-overdue' : ''}`}>
            <CalIcon /> {fmtDate(task.due_date)}
          </span>
        )}
        {task.event_title && (
          <span className="task-meta-item task-meta-event">
            <LinkIcon /> {task.event_title}
          </span>
        )}
      </div>

      <div className="task-card-actions">
        <div className="task-move-btns">
          {PREV_STATUS[task.status] && (
            <button className="task-action-btn" title="Reculer" onClick={() => onMove(task, PREV_STATUS[task.status])}>
              <ArrowLeftIcon />
            </button>
          )}
          {NEXT_STATUS[task.status] && (
            <button className="task-action-btn" title="Avancer" onClick={() => onMove(task, NEXT_STATUS[task.status])}>
              <ArrowRightIcon />
            </button>
          )}
        </div>
        <div className="task-edit-btns">
          <button className="task-action-btn" title="Modifier" onClick={() => onEdit(task)}>
            <EditIcon />
          </button>
          <button className="task-action-btn task-action-btn--delete" title="Supprimer" onClick={() => onDelete(task.id)}>
            <TrashIcon />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────
export default function TasksPage() {
  const [tasks,       setTasks]       = useState([]);
  const [workers,     setWorkers]     = useState([]);
  const [calEvents,   setCalEvents]   = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [modalOpen,   setModalOpen]   = useState(false);
  const [editTarget,  setEditTarget]  = useState(null);
  const [form,        setForm]        = useState(EMPTY_FORM);
  const [saving,      setSaving]      = useState(false);

  const fetchTasks = useCallback(() => {
    setLoading(true);
    getTasks()
      .then(r => setTasks(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  useEffect(() => {
    getWorkers().then(r => setWorkers(r.data)).catch(console.error);
    getAllCalendarEvents().then(r => setCalEvents(r.data)).catch(console.error);
  }, []);

  function openCreate() {
    setForm(EMPTY_FORM);
    setEditTarget(null);
    setModalOpen(true);
  }

  function openEdit(task) {
    setForm({
      title:             task.title,
      description:       task.description ?? '',
      status:            task.status,
      worker_id:         task.worker_id ?? '',
      calendar_event_id: task.calendar_event_id ?? '',
      due_date:          task.due_date ? task.due_date.slice(0, 10) : '',
    });
    setEditTarget(task);
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
    const payload = {
      title:             form.title.trim(),
      description:       form.description.trim() || null,
      status:            form.status,
      worker_id:         form.worker_id !== '' ? parseInt(form.worker_id) : null,
      calendar_event_id: form.calendar_event_id !== '' ? parseInt(form.calendar_event_id) : null,
      due_date:          form.due_date || null,
    };
    try {
      if (editTarget) await updateTask(editTarget.id, payload);
      else            await createTask(payload);
      closeModal();
      fetchTasks();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Supprimer cette tâche ?')) return;
    await deleteTask(id);
    fetchTasks();
  }

  async function handleMove(task, newStatus) {
    await updateTask(task.id, {
      title:             task.title,
      description:       task.description,
      status:            newStatus,
      worker_id:         task.worker_id,
      calendar_event_id: task.calendar_event_id,
      due_date:          task.due_date,
    });
    fetchTasks();
  }

  return (
    <div className="tasks-page">
      <div className="tasks-header">
        <div className="section-title">
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
            <rect x="3" y="3" width="6" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/>
            <rect x="11" y="3" width="6" height="9" rx="2" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M11 15l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Tâches
        </div>
        <button className="btn-primary" onClick={openCreate}>+ Nouvelle tâche</button>
      </div>

      {loading ? (
        <div className="tasks-loading">Chargement…</div>
      ) : (
        <div className="kanban-board">
          {COLUMNS.map(col => {
            const colTasks = tasks.filter(t => t.status === col.key);
            return (
              <div key={col.key} className={`kanban-col kanban-col--${col.key}`}>
                <div className="kanban-col-header">
                  <span className="kanban-col-label">{col.label}</span>
                  <span className="kanban-col-count">{colTasks.length}</span>
                </div>
                <div className="kanban-col-body">
                  {colTasks.length === 0 && (
                    <div className="kanban-empty">Aucune tâche</div>
                  )}
                  {colTasks.map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onEdit={openEdit}
                      onDelete={handleDelete}
                      onMove={handleMove}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Modal ── */}
      {modalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{editTarget ? 'Modifier la tâche' : 'Nouvelle tâche'}</h2>
              <button className="modal-close-btn" onClick={closeModal}>×</button>
            </div>

            <form onSubmit={handleSave} className="modal-form">
              <label>
                Titre *
                <input
                  required
                  placeholder="Ex: Appeler le fournisseur"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                />
              </label>

              <label>
                Description
                <textarea
                  placeholder="Détails de la tâche…"
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                />
              </label>

              <label>
                Statut
                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                  <option value="todo">À faire</option>
                  <option value="inprogress">En cours</option>
                  <option value="done">Fait</option>
                </select>
              </label>

              {workers.length > 0 && (
                <label>
                  Assigné à
                  <select value={form.worker_id} onChange={e => setForm(f => ({ ...f, worker_id: e.target.value }))}>
                    <option value="">— Non assigné —</option>
                    {workers.map(w => (
                      <option key={w.id} value={w.id}>{w.name}{w.poste ? ` (${w.poste})` : ''}</option>
                    ))}
                  </select>
                </label>
              )}

              {calEvents.length > 0 && (
                <label>
                  Événement lié
                  <select value={form.calendar_event_id} onChange={e => setForm(f => ({ ...f, calendar_event_id: e.target.value }))}>
                    <option value="">— Aucun —</option>
                    {calEvents.map(ev => (
                      <option key={ev.id} value={ev.id}>
                        {fmtDate(ev.event_date)} — {ev.title}
                      </option>
                    ))}
                  </select>
                </label>
              )}

              <label>
                Date limite
                <input
                  type="date"
                  value={form.due_date}
                  onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))}
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
