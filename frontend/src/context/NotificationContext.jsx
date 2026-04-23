import { createContext, useContext, useState, useCallback } from 'react';
import NotificationToast from '../components/NotificationToast';

const NotificationContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useNotification = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotification debe usarse dentro de NotificationProvider');
  return ctx;
};

export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState({
    show: false,
    title: '',
    message: '',
    variant: 'success'
  });

  const showNotification = useCallback((title, message, variant = 'success') => {
    setNotification({ show: true, title, message, variant });
  }, []);

  const hideNotification = useCallback(() => {
    setNotification(prev => ({ ...prev, show: false }));
  }, []);

  const showSuccess = useCallback((message) => {
    showNotification('Éxito', message, 'success');
  }, [showNotification]);

  const showError = useCallback((message) => {
    showNotification('Error', message, 'error');
  }, [showNotification]);

  const showWarning = useCallback((message) => {
    showNotification('Advertencia', message, 'warning');
  }, [showNotification]);

  const showInfo = useCallback((message) => {
    showNotification('Información', message, 'info');
  }, [showNotification]);

  return (
    <NotificationContext.Provider value={{ showNotification, showSuccess, showError, showWarning, showInfo }}>
      {children}
      <NotificationToast
        show={notification.show}
        onClose={hideNotification}
        title={notification.title}
        message={notification.message}
        variant={notification.variant}
      />
    </NotificationContext.Provider>
  );
};
