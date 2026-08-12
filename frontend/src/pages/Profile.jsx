import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert, Badge, Spinner, Modal, InputGroup } from 'react-bootstrap';
import AppNavbar from '../components/AppNavbar';
import { BsPersonCircle, BsEnvelopeFill, BsLockFill, BsPencilSquare, BsTruck, BsShieldLock, BsMoonFill, BsSunFill, BsEye, BsEyeSlash } from 'react-icons/bs';
import { useTheme } from '../context/ThemeContext';
import orderService from '../services/orderService';
import authService from '../services/authService';
import { requestJson } from '../services/httpClient';

function Profile() {
    // Estados para los datos del usuario
    const [userData, setUserData] = useState({
        name: '',
        email: ''
    });
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({
        name: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showCurrentPass, setShowCurrentPass] = useState(false);
    const [showNewPass, setShowNewPass] = useState(false);
    const [showConfirmPass, setShowConfirmPass] = useState(false);
    const { theme, toggleTheme } = useTheme();

    // 2FA states
    const [show2FAModal, setShow2FAModal] = useState(false);
    const [qrCodeData, setQrCodeData] = useState('');
    const [twoFactorSecret, setTwoFactorSecret] = useState('');
    const [twoFactorToken, setTwoFactorToken] = useState('');
    const [twoFAError, setTwoFAError] = useState('');
    const [twoFASuccess, setTwoFASuccess] = useState('');
    const [isGenerating2FA, setIsGenerating2FA] = useState(false);

    const [orders, setOrders] = useState([]);
    const [selectedTracking, setSelectedTracking] = useState(null);
    const [trackingError, setTrackingError] = useState('');
    const [loadingOrders, setLoadingOrders] = useState(true);

    // Cargar datos del usuario al montar el componente
    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                setUserData({
                    name: user.name || 'Usuario',
                    email: user.email || 'email@ejemplo.com',
                    twoFactorEnabled: user.twoFactorEnabled || false
                });
                setEditData(prevData => ({
                    ...prevData,
                    name: user.name || 'Usuario'
                }));
            } catch (error) {
                console.error('Error parsing user data:', error);
            }
        }
    }, []);

    useEffect(() => {
        const loadOrders = async () => {
            try {
                setLoadingOrders(true);
                const response = await orderService.getUserOrders();
                const list = response?.orders || [];
                setOrders(list);

                if (list.length > 0) {
                    const firstOrderId = list[0]?._id;
                    if (firstOrderId) {
                        const tracking = await orderService.getOrderTracking(firstOrderId);
                        setSelectedTracking(tracking);
                    }
                }
            } catch (err) {
                setTrackingError(err.message || 'No se pudo cargar el rastreo de tus pedidos.');
            } finally {
                setLoadingOrders(false);
            }
        };

        loadOrders();
    }, []);

    const handleSelectOrderTracking = async (orderId) => {
        try {
            setTrackingError('');
            const tracking = await orderService.getOrderTracking(orderId);
            setSelectedTracking(tracking);
        } catch (err) {
            setTrackingError(err.message || 'No se pudo obtener el rastreo del pedido seleccionado.');
        }
    };

    const handleEditToggle = () => {
        setIsEditing(!isEditing);
        setMessage('');
        setError('');
        // Resetear datos de edición
        setEditData({
            name: userData.name,
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
        });
    };

    const handleInputChange = (field, value) => {
        setEditData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        // Validaciones básicas
        if (!editData.name.trim()) {
            setError('El nombre es requerido.');
            return;
        }

        // Si se quiere cambiar contraseña
        if (editData.newPassword || editData.confirmPassword) {
            if (!editData.currentPassword) {
                setError('Ingresa tu contraseña actual para cambiarla.');
                return;
            }
            if (editData.newPassword !== editData.confirmPassword) {
                setError('Las contraseñas nuevas no coinciden.');
                return;
            }
            if (editData.newPassword.length < 6) {
                setError('La nueva contraseña debe tener al menos 6 caracteres.');
                return;
            }
        }

        setIsLoading(true);

        try {
                const updateData = {
                    name: editData.name
                };
                
                if (editData.newPassword) {
                    updateData.currentPassword = editData.currentPassword;
                    updateData.newPassword = editData.newPassword;
                }

                const result = await requestJson('/api/auth/update-profile', {
                    method: 'PUT',
                    body: JSON.stringify(updateData)
                });

                // Actualizar localStorage con nueva data
                const updatedUser = { ...userData, name: editData.name };
                localStorage.setItem('user', JSON.stringify(updatedUser));
                setUserData(updatedUser);

                setMessage(result.message || 'Perfil actualizado exitosamente.');
                setIsEditing(false);
        } catch (err) {
            console.error('Error updating profile:', err);
            setError(err.message || 'Error de conexión. Inténtalo de nuevo.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerate2FA = async () => {
        try {
            setIsGenerating2FA(true);
            setTwoFAError('');
            const response = await authService.generate2FA();
            setQrCodeData(response.data.qrCodeUrl);
            setTwoFactorSecret(response.data.secret);
            setShow2FAModal(true);
        } catch (err) {
            setError(err.message || 'Error al generar A2F');
        } finally {
            setIsGenerating2FA(false);
        }
    };

    const handleVerify2FA = async () => {
        try {
            setTwoFAError('');
            setTwoFASuccess('');
            await authService.verify2FA(twoFactorToken);
            setTwoFASuccess('Autenticación de 2 Factores activada exitosamente.');
            const updatedUser = { ...JSON.parse(localStorage.getItem('user')), twoFactorEnabled: true };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUserData(prev => ({ ...prev, twoFactorEnabled: true }));
            setTimeout(() => {
                setShow2FAModal(false);
                setTwoFactorToken('');
                setTwoFASuccess('');
            }, 2000);
        } catch (err) {
            setTwoFAError(err.message || 'Código inválido. Intenta de nuevo.');
        }
    };

    return (
        <div className="bg-page-content" style={{ minHeight: '100vh' }}>
            <AppNavbar />

            <Container className="p-4 fade-in-up">
                
                {/* Título */}
                <Row className="mb-4">
                    <Col>
                        <h2 className="fw-bold d-flex align-items-center">
                            <BsPersonCircle className="me-3" />
                            Mi Perfil
                        </h2>
                    </Col>
                </Row>
                
                {/* Tarjeta con la información */}
                <Row className="justify-content-center">
                    <Col md={8} lg={6}>
                        <Card className="shadow-sm border-0">
                            <Card.Header 
                                as="h5" 
                                className="fw-bold d-flex justify-content-between align-items-center" 
                                style={{ 
                                    backgroundColor: 'var(--primary-color)', 
                                    color: 'white' 
                                }}
                            >
                                Información de la Cuenta
                                <Button 
                                    variant={isEditing ? "outline-light" : "light"}
                                    size="sm"
                                    onClick={handleEditToggle}
                                    disabled={isLoading}
                                >
                                    <BsPencilSquare className="me-1" />
                                    {isEditing ? 'Cancelar' : 'Editar'}
                                </Button>
                            </Card.Header>
                            <Card.Body className="p-4">
                                
                                {/* Mensajes */}
                                {message && (
                                    <Alert variant="success" className="mb-3">
                                        {message}
                                    </Alert>
                                )}
                                
                                {error && (
                                    <Alert variant="danger" className="mb-3">
                                        {error}
                                    </Alert>
                                )}

                                <Form onSubmit={handleSave}>
                                    {/* Campo: Nombre de Usuario */}
                                    <Form.Group as={Row} className="mb-3 align-items-center">
                                        <Form.Label column sm="4" className="fw-bold">
                                            <BsPersonCircle className="me-2" />
                                            Nombre:
                                        </Form.Label>
                                        <Col sm="8">
                                            {isEditing ? (
                                                <Form.Control 
                                                    type="text"
                                                    value={editData.name}
                                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                                    placeholder="Ingresa tu nombre"
                                                />
                                            ) : (
                                                <Form.Control 
                                                    plaintext 
                                                    readOnly 
                                                    value={userData.name}
                                                />
                                            )}
                                        </Col>
                                    </Form.Group>

                                    {/* Campo: Correo */}
                                    <Form.Group as={Row} className="mb-3 align-items-center">
                                        <Form.Label column sm="4" className="fw-bold">
                                            <BsEnvelopeFill className="me-2" />
                                            Email:
                                        </Form.Label>
                                        <Col sm="8">
                                            <Form.Control 
                                                plaintext 
                                                readOnly 
                                                value={userData.email}
                                                className="text-muted"
                                            />
                                            {isEditing && (
                                                <Form.Text className="text-muted">
                                                    El email no se puede cambiar por seguridad
                                                </Form.Text>
                                            )}
                                        </Col>
                                    </Form.Group>

                                    {/* Campo: Modo Oscuro */}
                                    <Form.Group as={Row} className="mb-3 align-items-center">
                                        <Form.Label column sm="4" className="fw-bold">
                                            {theme === 'dark' ? <BsMoonFill className="me-2 text-primary" /> : <BsSunFill className="me-2 text-warning" />}
                                            Tema:
                                        </Form.Label>
                                        <Col sm="8">
                                            <Form.Check 
                                                type="switch"
                                                id="theme-switch"
                                                label={theme === 'dark' ? 'Modo Oscuro Activado' : 'Modo Claro Activado'}
                                                checked={theme === 'dark'}
                                                onChange={toggleTheme}
                                            />
                                        </Col>
                                    </Form.Group>

                                    {/* Cambio de contraseña (solo en modo edición) */}
                                    {isEditing && (
                                        <>
                                            <hr />
                                            <h6 className="mb-3">Cambiar Contraseña (opcional)</h6>
                                            
                                            <Form.Group as={Row} className="mb-3">
                                                <Form.Label column sm="4" className="fw-bold">
                                                    <BsLockFill className="me-2" />
                                                    Contraseña Actual:
                                                </Form.Label>
                                                <Col sm="8">
                                                    <InputGroup>
                                                        <Form.Control 
                                                            type={showCurrentPass ? 'text' : 'password'}
                                                            value={editData.currentPassword}
                                                            onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                                                            placeholder="Ingresa tu contraseña actual"
                                                        />
                                                        <Button
                                                            variant="outline-secondary"
                                                            tabIndex={-1}
                                                            onMouseDown={(e) => { e.preventDefault(); setShowCurrentPass(true); }}
                                                            onMouseUp={() => setShowCurrentPass(false)}
                                                            onMouseLeave={() => setShowCurrentPass(false)}
                                                            onTouchStart={(e) => { e.preventDefault(); setShowCurrentPass(true); }}
                                                            onTouchEnd={() => setShowCurrentPass(false)}
                                                        >
                                                            {showCurrentPass ? <BsEyeSlash /> : <BsEye />}
                                                        </Button>
                                                    </InputGroup>
                                                </Col>
                                            </Form.Group>

                                            <Form.Group as={Row} className="mb-3">
                                                <Form.Label column sm="4" className="fw-bold">
                                                    Nueva Contraseña:
                                                </Form.Label>
                                                <Col sm="8">
                                                    <InputGroup>
                                                        <Form.Control 
                                                            type={showNewPass ? 'text' : 'password'}
                                                            value={editData.newPassword}
                                                            onChange={(e) => handleInputChange('newPassword', e.target.value)}
                                                            placeholder="Nueva contraseña (mín. 6 caracteres)"
                                                        />
                                                        <Button
                                                            variant="outline-secondary"
                                                            tabIndex={-1}
                                                            onMouseDown={(e) => { e.preventDefault(); setShowNewPass(true); }}
                                                            onMouseUp={() => setShowNewPass(false)}
                                                            onMouseLeave={() => setShowNewPass(false)}
                                                            onTouchStart={(e) => { e.preventDefault(); setShowNewPass(true); }}
                                                            onTouchEnd={() => setShowNewPass(false)}
                                                        >
                                                            {showNewPass ? <BsEyeSlash /> : <BsEye />}
                                                        </Button>
                                                    </InputGroup>
                                                </Col>
                                            </Form.Group>

                                            <Form.Group as={Row} className="mb-3">
                                                <Form.Label column sm="4" className="fw-bold">
                                                    Confirmar:
                                                </Form.Label>
                                                <Col sm="8">
                                                    <InputGroup>
                                                        <Form.Control 
                                                            type={showConfirmPass ? 'text' : 'password'}
                                                            value={editData.confirmPassword}
                                                            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                                                            placeholder="Repite la nueva contraseña"
                                                        />
                                                        <Button
                                                            variant="outline-secondary"
                                                            tabIndex={-1}
                                                            onMouseDown={(e) => { e.preventDefault(); setShowConfirmPass(true); }}
                                                            onMouseUp={() => setShowConfirmPass(false)}
                                                            onMouseLeave={() => setShowConfirmPass(false)}
                                                            onTouchStart={(e) => { e.preventDefault(); setShowConfirmPass(true); }}
                                                            onTouchEnd={() => setShowConfirmPass(false)}
                                                        >
                                                            {showConfirmPass ? <BsEyeSlash /> : <BsEye />}
                                                        </Button>
                                                    </InputGroup>
                                                </Col>
                                            </Form.Group>
                                        </>
                                    )}

                                    {/* Botones de acción */}
                                    {isEditing && (
                                        <div className="d-flex gap-2 justify-content-end mt-4">
                                            <Button 
                                                variant="outline-secondary" 
                                                onClick={handleEditToggle}
                                                disabled={isLoading}
                                            >
                                                Cancelar
                                            </Button>
                                            <Button 
                                                type="submit" 
                                                className="btn-custom-primary"
                                                disabled={isLoading}
                                            >
                                                {isLoading ? (
                                                    <>
                                                        <div className="spinner-border spinner-border-sm me-2" role="status">
                                                            <span className="visually-hidden">Guardando...</span>
                                                        </div>
                                                        Guardando...
                                                    </>
                                                ) : (
                                                    'Guardar Cambios'
                                                )}
                                            </Button>
                                        </div>
                                    )}
                                </Form>
                                
                                <hr className="mt-4 mb-4" />
                                
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <h6 className="fw-bold mb-1"><BsShieldLock className="me-2" />Autenticación de 2 Factores (A2F)</h6>
                                        <p className="text-muted small mb-0">Protege tu cuenta agregando una capa extra de seguridad.</p>
                                    </div>
                                    <div>
                                        {userData.twoFactorEnabled ? (
                                            <Badge bg="success" className="px-3 py-2">Activo</Badge>
                                        ) : (
                                            <Button 
                                                variant="outline-primary" 
                                                size="sm" 
                                                onClick={handleGenerate2FA}
                                                disabled={isGenerating2FA}
                                            >
                                                {isGenerating2FA ? 'Generando...' : 'Configurar A2F'}
                                            </Button>
                                        )}
                                    </div>
                                </div>
                                
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                <Row className="justify-content-center mt-4">
                    <Col md={8} lg={6}>
                        <Card className="shadow-sm border-0">
                            <Card.Header as="h5" className="fw-bold">Rastreo de Paquetes</Card.Header>
                            <Card.Body>
                                {trackingError && <Alert variant="warning">{trackingError}</Alert>}

                                {loadingOrders ? (
                                    <div className="text-center py-3">
                                        <Spinner animation="border" size="sm" />
                                        <span className="ms-2">Cargando pedidos...</span>
                                    </div>
                                ) : orders.length === 0 ? (
                                    <Alert variant="info" className="mb-0">Aun no tienes pedidos registrados.</Alert>
                                ) : (
                                    <>
                                        <div className="d-flex gap-2 flex-wrap mb-3">
                                            {orders.slice(0, 6).map((order) => (
                                                <div key={order._id} className="d-flex gap-1">
                                                    <Button
                                                        size="sm"
                                                        variant={selectedTracking?.orderId === order.orderId ? 'primary' : 'outline-secondary'}
                                                        onClick={() => handleSelectOrderTracking(order._id)}
                                                    >
                                                        {order.orderId}
                                                    </Button>
                                                    <Link
                                                        to={`/orders/${order._id}`}
                                                        className="btn btn-sm btn-outline-primary"
                                                        title="Ver rastreo detallado"
                                                    >
                                                        <BsTruck />
                                                    </Link>
                                                </div>
                                            ))}
                                        </div>

                                        {selectedTracking && (
                                            <div className="border rounded p-3 bg-light">
                                                <div className="d-flex justify-content-between align-items-center mb-2">
                                                    <strong>{selectedTracking.orderId}</strong>
                                                    <Badge bg="dark">{selectedTracking.orderBrand || 'GAZA'}</Badge>
                                                </div>
                                                <p className="mb-1"><strong>Estado:</strong> {selectedTracking.status}</p>
                                                <p className="mb-1"><strong>Rastreo:</strong> {selectedTracking.trackingNumber || 'Pendiente de asignar'}</p>
                                                <p className="mb-1"><strong>Proveedor:</strong> {selectedTracking.mapping?.supplier || 'SYSCOM'}</p>
                                                <p className="mb-1"><strong>Intermediario:</strong> {selectedTracking.mapping?.intermediary || 'GAZA'}</p>
                                                <p className="mb-3"><strong>Cliente final:</strong> {selectedTracking.mapping?.finalCustomer || userData.name}</p>

                                                <div>
                                                    <strong>Historial:</strong>
                                                    <ul className="mb-0 mt-2 ps-3">
                                                        {(selectedTracking.fulfillmentTracking?.history || []).slice(-5).reverse().map((entry, idx) => (
                                                            <li key={`${entry.stage}-${idx}`}>
                                                                {entry.message || entry.stage}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>

            {/* Modal de Configuración A2F */}
            <Modal show={show2FAModal} onHide={() => setShow2FAModal(false)} backdrop="static" keyboard={false}>
                <Modal.Header closeButton>
                    <Modal.Title><BsShieldLock className="me-2" />Configurar A2F</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {twoFASuccess ? (
                        <Alert variant="success" className="text-center">
                            <BsShieldLock size={32} className="mb-2" /><br/>
                            {twoFASuccess}
                        </Alert>
                    ) : (
                        <>
                            <p className="small text-muted mb-3">
                                Escanea el código QR utilizando tu aplicación de autenticación (Google Authenticator, Microsoft Authenticator o Authy) e ingresa el código generado abajo para verificar.
                            </p>
                            {qrCodeData && (
                                <div className="text-center mb-4">
                                    <img src={qrCodeData} alt="Código QR A2F" className="img-fluid border rounded p-2" />
                                    <div className="mt-2 text-muted small user-select-all">
                                        <strong className="d-block mb-1">¿No puedes escanear el código?</strong>
                                        Usa esta clave secreta: <br/><code className="bg-light p-1 rounded border">{twoFactorSecret}</code>
                                    </div>
                                </div>
                            )}

                            {twoFAError && <Alert variant="danger">{twoFAError}</Alert>}

                            <Form.Group>
                                <Form.Label className="fw-bold">Código de verificación</Form.Label>
                                <InputGroup>
                                    <InputGroup.Text><BsLockFill /></InputGroup.Text>
                                    <Form.Control 
                                        type="text" 
                                        placeholder="Código de 6 dígitos"
                                        maxLength="6"
                                        value={twoFactorToken}
                                        onChange={(e) => setTwoFactorToken(e.target.value.replace(/\D/g, '').substring(0, 6))}
                                    />
                                </InputGroup>
                            </Form.Group>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShow2FAModal(false)} disabled={!!twoFASuccess}>
                        Cancelar
                    </Button>
                    <Button variant="primary" onClick={handleVerify2FA} disabled={twoFactorToken.length < 6 || !!twoFASuccess}>
                        Verificar y Activar
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default Profile;