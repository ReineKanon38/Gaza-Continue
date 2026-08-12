import { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, InputGroup, Alert } from 'react-bootstrap';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { BsLockFill, BsCheckCircle, BsEye, BsEyeSlash } from 'react-icons/bs';
import { FiSave, FiArrowLeft } from 'react-icons/fi';
import { requestJson } from '../services/httpClient';

function ResetConfirm() {
    const { token } = useParams();
    const navigate = useNavigate();
    
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        setError('');
        setMessage('');

        if (password === '' || confirmPassword === '') {
            setError('Por favor, completa ambos campos.');
            return;
        }

        if (password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden.');
            return;
        }

        setIsLoading(true);

        try {

                const result = await requestJson(`/api/auth/reset-password/${token}`, {
                    method: 'POST',
                    body: JSON.stringify({ password, newPassword: password })
                });

                setMessage(result.message || 'Contraseña actualizada con éxito.');
                setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            console.error('Error en reset confirm:', err);
            setError(err.message || 'El enlace es inválido o ha expirado.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-page-content" style={{ minHeight: '100vh' }}>
            <Container className="d-flex vh-100 justify-content-center align-items-center fade-in-up">
                <Row className="justify-content-center w-100">
                    <Col md={8} lg={6} xl={4}>
                        <Card className="shadow-sm border-0">
                            <Card.Body className="p-4 p-md-5">
                                <h2 className="fw-bold text-center mb-3">Nueva Contraseña</h2>
                                <p className="text-center text-muted mb-4">
                                    Ingresa tu nueva contraseña para acceder a tu cuenta.
                                </p>

                                <Form onSubmit={handleSubmit}>
                                    {message && (
                                        <Alert variant="success" className="d-flex align-items-center">
                                            <BsCheckCircle className="me-2" /> {message}
                                        </Alert>
                                    )}

                                    {error && (
                                        <Alert variant="danger" onClose={() => setError('')} dismissible>
                                            {error}
                                        </Alert>
                                    )}

                                    <Form.Group className="mb-3">
                                        <Form.Label>Nueva contraseña</Form.Label>
                                        <InputGroup>
                                            <InputGroup.Text><BsLockFill /></InputGroup.Text>
                                            <Form.Control 
                                                type={showPassword ? 'text' : 'password'}
                                                placeholder="Mínimo 6 caracteres" 
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                            />
                                            <Button
                                                variant="outline-secondary"
                                                tabIndex={-1}
                                                onMouseDown={(e) => { e.preventDefault(); setShowPassword(true); }}
                                                onMouseUp={() => setShowPassword(false)}
                                                onMouseLeave={() => setShowPassword(false)}
                                                onTouchStart={(e) => { e.preventDefault(); setShowPassword(true); }}
                                                onTouchEnd={() => setShowPassword(false)}
                                                aria-label="Mostrar contraseña"
                                            >
                                                {showPassword ? <BsEyeSlash /> : <BsEye />}
                                            </Button>
                                        </InputGroup>
                                    </Form.Group>

                                    <Form.Group className="mb-4">
                                        <Form.Label>Confirmar contraseña</Form.Label>
                                        <InputGroup>
                                            <InputGroup.Text><BsLockFill /></InputGroup.Text>
                                            <Form.Control 
                                                type={showConfirm ? 'text' : 'password'}
                                                placeholder="Repite tu contraseña" 
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                            />
                                            <Button
                                                variant="outline-secondary"
                                                tabIndex={-1}
                                                onMouseDown={(e) => { e.preventDefault(); setShowConfirm(true); }}
                                                onMouseUp={() => setShowConfirm(false)}
                                                onMouseLeave={() => setShowConfirm(false)}
                                                onTouchStart={(e) => { e.preventDefault(); setShowConfirm(true); }}
                                                onTouchEnd={() => setShowConfirm(false)}
                                                aria-label="Mostrar confirmación"
                                            >
                                                {showConfirm ? <BsEyeSlash /> : <BsEye />}
                                            </Button>
                                        </InputGroup>
                                    </Form.Group>

                                    <Button 
                                        type="submit" 
                                        className="btn-custom-primary w-100 d-flex align-items-center justify-content-center"
                                        size="lg"
                                        disabled={isLoading || !!message}
                                    >
                                        {isLoading ? (
                                            <>
                                                <div className="spinner-border spinner-border-sm me-2" role="status">
                                                    <span className="visually-hidden">Guardando...</span>
                                                </div>
                                                Guardando...
                                            </>
                                        ) : (
                                            <>
                                                <FiSave className="me-2" />
                                                Actualizar Contraseña
                                            </>
                                        )}
                                    </Button>
                                </Form>

                                <div className="text-center mt-4">
                                    <Link to="/login" className="d-flex align-items-center justify-content-center text-decoration-none">
                                        <FiArrowLeft className="me-2" />
                                        Volver al inicio de sesión
                                    </Link>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
}

export default ResetConfirm;
