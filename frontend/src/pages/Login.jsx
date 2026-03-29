import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import '../components/Layout.css';
import './Login.css';

export default function Login() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      login(data.user);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      {/* ── Left brand panel ── */}
      <div className="auth-brand">
        <div className="auth-brand-inner">
          <div className="auth-logo">
            <div className="logo-icon">
              <svg width="22" height="22" viewBox="0 0 18 18" fill="none">
                <path d="M9 3C9 3 4 8.5 4 11.5a5 5 0 0010 0C14 8.5 9 3 9 3z"
                  stroke="currentColor" strokeWidth="1.8"
                  strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="auth-app-name">Gasolina</span>
          </div>
          <h1 className="auth-headline">Gérez votre<br/>station intelligemment</h1>
          <p className="auth-subline">
            Tableau de bord financier pour stations-service —<br/>
            ventes, achats, marges et bien plus.
          </p>
          <div className="auth-dots">
            <span /><span /><span />
          </div>
        </div>
      </div>

      {/* ── Right form card ── */}
      <div className="auth-form-side">
        <div className="auth-card">
          <h2 className="auth-title">Connexion</h2>
          <p className="auth-subtitle">Bienvenue. Entrez vos identifiants.</p>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-field">
              <label htmlFor="email">Adresse e-mail</label>
              <input
                id="email" type="email" autoComplete="email"
                value={email} onChange={e => setEmail(e.target.value)}
                placeholder="admin@station.tn" required
              />
            </div>
            <div className="auth-field">
              <label htmlFor="password">Mot de passe</label>
              <input
                id="password" type="password" autoComplete="current-password"
                value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" required
              />
            </div>

            {error && <div className="auth-error">{error}</div>}

            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? 'Connexion…' : 'Se connecter'}
            </button>
          </form>

          <p className="auth-switch">
            Pas encore de compte ?{' '}
            <Link to="/signup">Créer un compte</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
