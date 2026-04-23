import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute() {
  const { token, loading } = useAuth();
  const persistedToken = localStorage.getItem('token');
  const effectiveToken = token || persistedToken;
  
  if (loading) {
    return <div className="text-center mt-5">Cargando...</div>;
  }
  
  return effectiveToken ? <Outlet /> : <Navigate to="/login" replace />;
}

export default ProtectedRoute;