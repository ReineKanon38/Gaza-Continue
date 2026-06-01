import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { clearStoredAuthTokens, getStoredAccessToken, getStoredRefreshToken, refreshAccessToken, requestJson, setStoredAuthTokens } from '../services/httpClient';

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
    const bootstrapSession = async () => {
      const storedToken = getStoredAccessToken();
      const storedRefreshToken = getStoredRefreshToken();
      const storedUser = localStorage.getItem('user');

      if (!storedUser) {
        setLoading(false);
        return;
      }

      try {
        const parsedUser = JSON.parse(storedUser);

        if (!storedToken && storedRefreshToken) {
          const refreshed = await refreshAccessToken();
          if (refreshed) {
            setToken(refreshed);
            setUser(parsedUser);
          } else {
            clearStoredAuthTokens();
            localStorage.removeItem('user');
          }
          setLoading(false);
          return;
        }

        if (storedToken) {
          const payloadBase64Url = storedToken.split('.')[1];
          const payloadBase64 = payloadBase64Url.replace(/-/g, '+').replace(/_/g, '/');
          const padLength = (4 - (payloadBase64.length % 4)) % 4;
          const paddedBase64 = payloadBase64 + '='.repeat(padLength);
          const payloadData = JSON.parse(atob(paddedBase64));
          const exp = payloadData.exp;

          if (!exp || exp * 1000 > Date.now()) {
            setToken(storedToken);
            setUser(parsedUser);
            setLoading(false);
            return;
          }

          if (storedRefreshToken) {
            const refreshed = await refreshAccessToken();
            if (refreshed) {
              setToken(refreshed);
              setUser(parsedUser);
            } else {
              clearStoredAuthTokens();
              localStorage.removeItem('user');
            }
            setLoading(false);
            return;
          }

          clearStoredAuthTokens();
          localStorage.removeItem('user');
        }
      } catch (e) {
        console.error('Error decoding token:', e);
        clearStoredAuthTokens();
        localStorage.removeItem('user');
      }

      setLoading(false);
    };

    bootstrapSession();
  }, []);

  useEffect(() => {
    const handleSessionExpired = () => {
      clearStoredAuthTokens();
      localStorage.removeItem('user');
      setToken(null);
      setUser(null);
      navigate('/login', { replace: true });
    };

    const handleTokenUpdated = (event) => {
      const nextToken = event?.detail?.accessToken;
      if (nextToken) {
        setToken(nextToken);
      }
    };

    window.addEventListener('auth:expired', handleSessionExpired);
    window.addEventListener('auth:token-updated', handleTokenUpdated);
    return () => {
      window.removeEventListener('auth:expired', handleSessionExpired);
      window.removeEventListener('auth:token-updated', handleTokenUpdated);
    };
  }, [navigate]);

  const login = (tokenOrSession, userData, maybeRefreshToken) => {
    const accessToken = typeof tokenOrSession === 'object'
      ? (tokenOrSession?.accessToken || tokenOrSession?.token)
      : tokenOrSession;
    const refreshToken = typeof tokenOrSession === 'object'
      ? tokenOrSession?.refreshToken
      : maybeRefreshToken;

    setStoredAuthTokens({ accessToken, refreshToken });
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(accessToken);
    setUser(userData);
  };

  const logout = () => {
    const accessToken = getStoredAccessToken();
    const refreshToken = getStoredRefreshToken();

    if (accessToken && refreshToken) {
      requestJson('/api/auth/logout', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify({ refreshToken })
      }).catch(() => {
        // No bloqueamos logout local si falla el revoke remoto.
      });
    }

    clearStoredAuthTokens();
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
