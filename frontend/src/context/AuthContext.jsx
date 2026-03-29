import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,  setUser]  = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Verify session via cookie — no localStorage needed
    api.get('/auth/me')
      .then(r => setUser(r.data.user))
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  function login(userData) {
    setUser(userData);
  }

  async function logout() {
    try { await api.post('/auth/logout'); } catch { /* ignore */ }
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, ready }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
