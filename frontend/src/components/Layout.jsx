import { useState } from 'react';
import { NavLink, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDate } from '../context/DateContext';
import { useExport } from '../context/ExportContext';
import DateRangePicker from './DateRangePicker';
import './Layout.css';

// Apply saved theme before first render
const _saved = localStorage.getItem('theme') ?? 'light';
document.documentElement.setAttribute('data-theme', _saved);

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const { from, to, setRange } = useDate();
  const { triggerExport } = useExport();
  const navigate = useNavigate();

  const [theme, setTheme] = useState(() => localStorage.getItem('theme') ?? 'light');
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get('q') ?? '';

  function toggleTheme() {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    localStorage.setItem('theme', next);
    document.documentElement.setAttribute('data-theme', next);
  }

  function handleSearch(e) {
    const val = e.target.value;
    if (val) setSearchParams({ q: val });
    else setSearchParams({});
  }

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  const initials = user?.email ? user.email.slice(0, 2).toUpperCase() : 'GS';

  return (
    <>
      {/* ── SIDEBAR ── */}
      <aside className="sidebar">
        <div className="logo">
          <div className="logo-icon">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M9 3C9 3 4 8.5 4 11.5a5 5 0 0010 0C14 8.5 9 3 9 3z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          Station Manager
        </div>

        <div className="nav-label">Général</div>

        <NavLink to="/" end className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="2" y="2" width="5" height="5" rx="1.5" fill="currentColor"/>
            <rect x="9" y="2" width="5" height="5" rx="1.5" fill="currentColor" opacity=".4"/>
            <rect x="2" y="9" width="5" height="5" rx="1.5" fill="currentColor" opacity=".4"/>
            <rect x="9" y="9" width="5" height="5" rx="1.5" fill="currentColor" opacity=".4"/>
          </svg>
          Tableau de Bord
        </NavLink>

        <NavLink to="/ventes/carburants" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M9 3C9 3 4 8.5 4 11.5a5 5 0 0010 0C14 8.5 9 3 9 3z" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
          Vente Carburants
        </NavLink>

        <NavLink to="/ventes/produits" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M2 5h12M2 8h8M2 11h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          Vente Produits
        </NavLink>

        <NavLink to="/ventes/services" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3 12V7l5-4 5 4v5a1 1 0 01-1 1H4a1 1 0 01-1-1z" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
          Vente Services
        </NavLink>

        <div className="nav-label" style={{ marginTop: 16 }}>Finances</div>

        <NavLink to="/recettes" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M2 4h12v8a1 1 0 01-1 1H3a1 1 0 01-1-1V4z" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M2 4l6 4 6-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          Recettes
        </NavLink>

        <NavLink to="/depenses" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="2" y="4" width="12" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M5 4V3a1 1 0 011-1h4a1 1 0 011 1v1" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
          Dépenses
        </NavLink>

        <NavLink to="/marges" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M2 12l4-4 3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Marges
          <span className="badge">Rapport</span>
        </NavLink>

        <NavLink to="/achats" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M2 3h12M2 8h8M2 13h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          Achats
        </NavLink>

        <div className="nav-label" style={{ marginTop: 16 }}>Planning</div>

        <NavLink to="/calendar" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="2" y="3" width="12" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M5 2v2M11 2v2M2 7h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          Calendrier
        </NavLink>

        <NavLink to="/tasks" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="2" y="2" width="7" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
            <rect x="11" y="2" width="3" height="7" rx="1" stroke="currentColor" strokeWidth="1.3"/>
            <path d="M10 12l1.5 1.5L14 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Tâches
        </NavLink>

        {user?.role === 'admin' && (
          <>
            <div className="nav-label" style={{ marginTop: 16 }}>Équipe</div>
            <NavLink to="/workers" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="6" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M2 13c0-2.2 1.8-4 4-4s4 1.8 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <circle cx="11.5" cy="5.5" r="2" stroke="currentColor" strokeWidth="1.3"/>
                <path d="M13.5 13c0-1.7-1.3-3-3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
              Personnel
            </NavLink>
          </>
        )}

        <div className="sidebar-spacer" />

        <div className="sidebar-bottom">
          {user?.role === 'admin' && (
            <NavLink to="/upload" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 2v7M5 5l3-3 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 11v1a2 2 0 002 2h8a2 2 0 002-2v-1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              Import Fichiers
            </NavLink>
          )}

          <button className="nav-item nav-logout" onClick={handleLogout}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 3H3a1 1 0 00-1 1v8a1 1 0 001 1h3M10 11l3-3-3-3M13 8H6"
                stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Déconnexion
          </button>

          <div className="user-row">
            <div className="avatar">{initials}</div>
            <div>
              <div className="user-name">{user?.role === 'admin' ? 'Administrateur' : 'Utilisateur'}</div>
              <div className="user-email">{user?.email ?? ''}</div>
            </div>
            <svg className="user-chevron" width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M5 6l2 2 2-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main className="main">
        {/* ── TOPBAR ── */}
        <div className="topbar">
          <div className="search-box">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="6" cy="6" r="4" stroke="#8a92a6" strokeWidth="1.5"/>
              <path d="M9.5 9.5l2.5 2.5" stroke="#8a92a6" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <input
              type="text"
              placeholder="Rechercher…"
              value={q}
              onChange={handleSearch}
            />
          </div>
          <div className="topbar-right">
            <DateRangePicker from={from} to={to} onChange={setRange} />
            <button className="theme-toggle-btn" onClick={toggleTheme} aria-label="Basculer le thème">
              {theme === 'dark' ? (
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15M3.05 3.05l1.06 1.06M11.89 11.89l1.06 1.06M3.05 12.95l1.06-1.06M11.89 4.11l1.06-1.06"
                    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              ) : (
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                  <path d="M13.5 9.5A6 6 0 016.5 2.5a6 6 0 000 11 6 6 0 007-4z"
                    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </button>
            <button className="export-btn" onClick={triggerExport}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 2v7M4 6l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 11h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              Exporter
            </button>
          </div>
        </div>

        {/* ── PAGE CONTENT ── */}
        <div className="content">
          {children}
        </div>
      </main>
    </>
  );
}
