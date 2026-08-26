const getApiBaseUrl = () => {
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return ''; // En producción, usamos rutas relativas (/api/...) para que viaje por HTTPS en el mismo dominio
  }
  return import.meta.env.VITE_API_URL || 'http://localhost:5000';
};

const API_BASE_URL = getApiBaseUrl();
const ACCESS_TOKEN_KEY = 'token';
const LEGACY_ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

let refreshPromise = null;

export class ApiError extends Error {
  constructor(message, status = 500, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

function dispatchAuthExpired(detail = {}) {
  if (typeof window === 'undefined') return;

  window.dispatchEvent(new CustomEvent('auth:expired', {
    detail
  }));
}

function dispatchTokenUpdated(detail = {}) {
  if (typeof window === 'undefined') return;

  window.dispatchEvent(new CustomEvent('auth:token-updated', {
    detail
  }));
}

export function getStoredAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY) || localStorage.getItem(LEGACY_ACCESS_TOKEN_KEY);
}

export function getStoredRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setStoredAuthTokens({ accessToken, refreshToken }) {
  if (accessToken) {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(LEGACY_ACCESS_TOKEN_KEY, accessToken);
  }

  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
}

export function clearStoredAuthTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(LEGACY_ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

const isRefreshRoute = (url = '') => url.includes('/api/auth/refresh');

export async function refreshAccessToken() {
  if (refreshPromise) {
    return refreshPromise;
  }

  const refreshToken = getStoredRefreshToken();
  if (!refreshToken) {
    return null;
  }

  refreshPromise = (async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refreshToken })
      });

      const rawText = await response.text();
      const payload = rawText ? JSON.parse(rawText) : {};

      if (!response.ok) {
        clearStoredAuthTokens();
        return null;
      }

      const nextAccess = payload?.accessToken || payload?.token || payload?.data?.accessToken || payload?.data?.token;
      const nextRefresh = payload?.refreshToken || payload?.data?.refreshToken;

      if (!nextAccess) {
        clearStoredAuthTokens();
        return null;
      }

      setStoredAuthTokens({ accessToken: nextAccess, refreshToken: nextRefresh || refreshToken });
      dispatchTokenUpdated({ accessToken: nextAccess, refreshToken: nextRefresh || refreshToken });
      return nextAccess;
    } catch {
      clearStoredAuthTokens();
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export async function requestJson(url, options = {}) {
  const token = getStoredAccessToken();
  const method = (options.method || 'GET').toUpperCase();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    method,
    headers
  });

  if (response.status === 401 && token && !isRefreshRoute(url)) {
    const refreshedToken = await refreshAccessToken();
    if (refreshedToken) {
      const retryHeaders = {
        ...headers,
        Authorization: `Bearer ${refreshedToken}`
      };

      const retryResponse = await fetch(`${API_BASE_URL}${url}`, {
        ...options,
        method,
        headers: retryHeaders
      });

      const retryText = await retryResponse.text();
      let retryPayload = {};
      try {
        retryPayload = retryText ? JSON.parse(retryText) : {};
      } catch {
        retryPayload = {};
      }

      if (!retryResponse.ok) {
        const retryMessage = retryPayload?.error || retryPayload?.message || retryResponse.statusText || 'Error en la peticion';
        if (retryResponse.status === 401) {
          clearStoredAuthTokens();
          localStorage.removeItem('user');
          dispatchAuthExpired({ reason: retryMessage, url, status: 401 });
        }
        throw new ApiError(retryMessage, retryResponse.status, retryPayload);
      }

      return retryPayload;
    }
  }

  const rawText = await response.text();
  let payload = {};
  try {
    payload = rawText ? JSON.parse(rawText) : {};
  } catch {
    payload = {};
  }

  if (!response.ok) {
    const message = payload?.error || payload?.message || response.statusText || 'Error en la peticion';

    if (response.status === 401 && token) {
      clearStoredAuthTokens();
      localStorage.removeItem('user');
      dispatchAuthExpired({ reason: message, url, status: 401 });
    }

    throw new ApiError(message, response.status, payload);
  }

  return payload;
}
