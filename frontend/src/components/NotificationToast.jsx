import React from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';

const NotificationToast = ({ 
    show, 
    onClose, 
    title, 
    message, 
    variant = 'success',
    delay = 4000,
    position = 'top-end'
}) => {
    const getIcon = () => {
        switch (variant) {
            case 'success': return '✅';
            case 'error': return '❌';
            case 'warning': return '⚠️';
            case 'info': return 'ℹ️';
            default: return '📢';
        }
    };

    const getBgClass = () => {
        switch (variant) {
            case 'success': return 'bg-success text-white';
            case 'error': return 'bg-danger text-white';
            case 'warning': return 'bg-warning text-dark';
            case 'info': return 'bg-info text-white';
            default: return 'bg-primary text-white';
        }
    };

    return (
        <ToastContainer 
            position={position} 
            className="p-3" 
            style={{ zIndex: 9999 }}
        >
            <Toast 
                show={show} 
                onClose={onClose} 
                delay={delay} 
                autohide
                className={getBgClass()}
            >
                <Toast.Header>
                    <span className="me-2">{getIcon()}</span>
                    <strong className="me-auto">{title}</strong>
                </Toast.Header>
                <Toast.Body>
                    {message}
                </Toast.Body>
            </Toast>
        </ToastContainer>
    );
};

export default NotificationToast;