import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getStoredAccessToken } from '../services/httpClient';

function ProtectedRoute({ requiredRole }) {
  const { token, user, loading } = useAuth();
  const persistedToken = getStoredAccessToken();
  const effectiveToken = token || persistedToken;
  
  if (loading) {
    return <div className="text-center mt-5">Cargando...</div>;
  }

  if (effectiveToken && requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/catalog" replace />;
  }
  
  return effectiveToken ? <Outlet /> : <Navigate to="/login" replace />;
}

export default ProtectedRoute;