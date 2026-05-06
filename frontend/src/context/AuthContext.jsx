import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        const payloadBase64Url = storedToken.split('.')[1];
        const payloadBase64 = payloadBase64Url.replace(/-/g, '+').replace(/_/g, '/');
        const padLength = (4 - (payloadBase64.length % 4)) % 4;
        const paddedBase64 = payloadBase64 + '='.repeat(padLength);
        
        const payloadData = JSON.parse(atob(paddedBase64));
        const exp = payloadData.exp;
        
        if (!exp || exp * 1000 > Date.now()) {
          setToken(storedToken);
          setUser(parsedUser);
        } else {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      } catch (e) {
        console.error('Error decoding token:', e);
        // If there's an error decoding but we have token/user, 
        // we can optimistically set them and let the backend reject if invalid
        setToken(storedToken);
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      }
    }
    setLoading(false);
  }, []);

  const login = (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    navigate('/login');
  };

  const isAdmin = () => user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};
