import { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, InputGroup, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { BsEnvelopeFill, BsCheckCircle } from 'react-icons/bs';
import { FiSend, FiArrowLeft } from 'react-icons/fi';
import { requestJson } from '../services/httpClient';

function Reset() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    // Estados para los mensajes de feedback
    const [message, setMessage] = useState(''); // Para mensajes de éxito (verde)
    const [error, setError] = useState('');     // Para mensajes de error (rojo)

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Limpiamos mensajes anteriores
        setError('');
        setMessage('');

        // 1. Verificación de email
        if (email === '') {
            setError('Por favor, ingresa tu correo electrónico.');
            return;
        }

        // Validar formato de email básico
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('Por favor, ingresa un correo electrónico válido.');
            return;
        }

        setIsLoading(true);

        try {
                // Con backend: hacer petición real
                const result = await requestJson('/api/auth/reset-password', {
                    method: 'POST',
                    body: JSON.stringify({ email })
                });

                if (result.data?.resetUrl) {
                    setMessage(
                        <span>
                            {result.message} <br/><br/>
                            <strong>Modo Dev:</strong> <a href={result.data.resetUrl} target="_blank" rel="noreferrer">Clic aquí para cambiar tu contraseña</a>
                        </span>
                    );
                } else {
                    setMessage(result.message || 'Si tu correo está registrado, recibirás un enlace para restaurar tu contraseña.');
                }
                setEmail('');
        } catch (err) {
            console.error('Error en reset password:', err);
            setError(err.message || 'Error de conexión. Verifica tu internet e inténtalo de nuevo.');
        } finally {
            setIsLoading(false);
        }
    };

return (
    <div className="bg-page-content" style={{ minHeight: '100vh' }}>
    <Container className="d-flex vh-100 justify-content-center align-items-center fade-in-up">
        <Row className="justify-content-center w-100">
        <Col md={8} lg={6} xl={4}>
            <Card className="auth-card border-0">
            <Card.Body className="p-4 p-md-5">
                
                <div className="text-center mb-4">
                  <h2 className="auth-title mb-2">Restaurar Contraseña</h2>
                  <p className="text-muted">
                    Ingresa tu correo y te enviaremos un enlace para 
                    restablecer tu contraseña.
                  </p>
                </div>

                <Form onSubmit={handleSubmit}>

                  {/* Mensaje de Éxito (Verde) */}
                {message && (
                    <Alert variant="success" className="border-0 shadow-sm">
                    {message}
                    </Alert>
                )}

                  {/* Mensaje de Error (Rojo) */}
                {error && (
                    <Alert variant="danger" className="border-0 shadow-sm" onClose={() => setError('')} dismissible>
                    {error}
                    </Alert>
                )}

                  {/* Campo de Correo */}
                <Form.Group className="mb-4" controlId="formBasicEmail">
                    <Form.Label className="text-muted fw-semibold">Correo electrónico</Form.Label>
                    <InputGroup className="search-group-modern shadow-sm">
                    <InputGroup.Text className="bg-transparent border-0 text-muted ps-3">
                        <BsEnvelopeFill />
                    </InputGroup.Text>
                    <Form.Control 
                        type="email" 
                        placeholder="Ingresa tu correo" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-transparent border-0 shadow-none py-2"
                    />
                    </InputGroup>
                </Form.Group>

                    {/* Botón de Enviar */}
                    <Button 
                        type="submit" 
                        className="w-100 mt-2 py-3 d-flex align-items-center justify-content-center btn-custom-primary rounded-pill shadow"
                        size="lg"
                        disabled={isLoading}
                        style={{ fontWeight: '600' }}
                    >
                        {isLoading ? (
                            <>
                                <div className="spinner-border spinner-border-sm me-2" role="status">
                                    <span className="visually-hidden">Cargando...</span>
                                </div>
                                Enviando...
                            </>
                        ) : (
                            <>
                                <FiSend className="me-2 fs-5" />
                                Enviar enlace
                            </>
                        )}
                    </Button>
                    </Form>

                    {/* Enlace de regreso a Login con mejor diseño */}
                    <div className="text-center mt-4 pt-2">
                        <Link to="/login" className="auth-link d-flex align-items-center justify-content-center mb-2">
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

export default Reset;