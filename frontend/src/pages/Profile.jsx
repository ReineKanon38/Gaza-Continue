import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Badge, Spinner } from 'react-bootstrap';
import AppNavbar from '../components/AppNavbar';
import { BsPersonCircle, BsEnvelopeFill, BsLockFill, BsPencilSquare } from 'react-icons/bs';
import orderService from '../services/orderService';

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
                    email: user.email || 'email@ejemplo.com'
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
            const apiUrl = import.meta.env.VITE_API_URL;
            
            // Modo sin-backend: simular actualización
            if (!apiUrl) {
                await new Promise(resolve => setTimeout(resolve, 1500));
                
                // Actualizar datos locales
                const updatedUser = {
                    ...JSON.parse(localStorage.getItem('user')),
                    name: editData.name
                };
                localStorage.setItem('user', JSON.stringify(updatedUser));
                setUserData(prev => ({ ...prev, name: editData.name }));
                
                setMessage('Perfil actualizado exitosamente.');
                setIsEditing(false);
            } else {
                // Con backend: hacer petición real
                const token = localStorage.getItem('token');
                const updateData = {
                    name: editData.name
                };
                
                if (editData.newPassword) {
                    updateData.currentPassword = editData.currentPassword;
                    updateData.newPassword = editData.newPassword;
                }

                const response = await fetch(`${apiUrl}/auth/update-profile`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(updateData)
                });

                const result = await response.json();

                if (response.ok) {
                    // Actualizar localStorage con nueva data
                    const updatedUser = { ...userData, name: editData.name };
                    localStorage.setItem('user', JSON.stringify(updatedUser));
                    setUserData(updatedUser);
                    
                    setMessage(result.message || 'Perfil actualizado exitosamente.');
                    setIsEditing(false);
                } else {
                    setError(result.message || 'Error al actualizar perfil.');
                }
            }
        } catch (err) {
            console.error('Error updating profile:', err);
            setError('Error de conexión. Inténtalo de nuevo.');
        } finally {
            setIsLoading(false);
        }
    };
    return (
        <div style={{ backgroundColor: 'var(--body-bg)', minHeight: '100vh' }}>
            <AppNavbar />

            <Container className="p-4">
                
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
                                                    <Form.Control 
                                                        type="password"
                                                        value={editData.currentPassword}
                                                        onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                                                        placeholder="Ingresa tu contraseña actual"
                                                    />
                                                </Col>
                                            </Form.Group>

                                            <Form.Group as={Row} className="mb-3">
                                                <Form.Label column sm="4" className="fw-bold">
                                                    Nueva Contraseña:
                                                </Form.Label>
                                                <Col sm="8">
                                                    <Form.Control 
                                                        type="password"
                                                        value={editData.newPassword}
                                                        onChange={(e) => handleInputChange('newPassword', e.target.value)}
                                                        placeholder="Nueva contraseña (mín. 6 caracteres)"
                                                    />
                                                </Col>
                                            </Form.Group>

                                            <Form.Group as={Row} className="mb-3">
                                                <Form.Label column sm="4" className="fw-bold">
                                                    Confirmar:
                                                </Form.Label>
                                                <Col sm="8">
                                                    <Form.Control 
                                                        type="password"
                                                        value={editData.confirmPassword}
                                                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                                                        placeholder="Repite la nueva contraseña"
                                                    />
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
                                                <Button
                                                    key={order._id}
                                                    size="sm"
                                                    variant={selectedTracking?.orderId === order.orderId ? 'primary' : 'outline-secondary'}
                                                    onClick={() => handleSelectOrderTracking(order._id)}
                                                >
                                                    {order.orderId}
                                                </Button>
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
        </div>
    );
}

export default Profile;