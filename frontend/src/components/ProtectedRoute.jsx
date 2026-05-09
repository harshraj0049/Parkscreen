import { Navigate } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    // Wait for token validation before deciding to redirect
    return null;
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
}