import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, ready } = useAuth();

  if (!ready) return null;

  if (!user) return <Navigate to="/login" replace />;

  if (adminOnly && user.role !== 'admin') return <Navigate to="/" replace />;

  return children;
}
