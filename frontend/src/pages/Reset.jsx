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
            const apiUrl = import.meta.env.VITE_API_URL;
            
            // Modo sin-backend: simular envío
            if (!apiUrl) {
                // Simular delay de servidor
                await new Promise(resolve => setTimeout(resolve, 2000));
                setMessage('Si tu correo está registrado, recibirás un enlace para restaurar tu contraseña en breve.');
                setEmail('');
            } else {
                // Con backend: hacer petición real
                const result = await requestJson('/api/auth/reset-password', {
                    method: 'POST',
                    body: JSON.stringify({ email })
                });

                setMessage(result.message || 'Si tu correo está registrado, recibirás un enlace para restaurar tu contraseña.');
                setEmail('');
            }
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
            <Card className="shadow-sm border-0">
            <Card.Body className="p-4 p-md-5">
                
                <h2 className="fw-bold text-center mb-3">
                Restaurar Contraseña
                </h2>
                <p className="text-center text-muted mb-4">
                Ingresa tu correo y te enviaremos un enlace para 
                restablecer tu contraseña.
                </p>

                <Form onSubmit={handleSubmit}>

                  {/* Mensaje de Éxito (Verde) */}
                {message && (
                    <Alert variant="success">
                    {message}
                    </Alert>
                )}

                  {/* Mensaje de Error (Rojo) */}
                {error && (
                    <Alert variant="danger" onClose={() => setError('')} dismissible>
                    {error}
                    </Alert>
                )}

                  {/* Campo de Correo */}
                <Form.Group className="mb-3" controlId="formBasicEmail">
                    <Form.Label>Correo electrónico</Form.Label>
                    <InputGroup>
                    <InputGroup.Text>
                        <BsEnvelopeFill />
                    </InputGroup.Text>
                    <Form.Control 
                        type="email" 
                        placeholder="Ingresa tu correo" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    </InputGroup>
                </Form.Group>

                    {/* Botón de Enviar */}
                    <Button 
                        type="submit" 
                        className="btn-custom-primary w-100 d-flex align-items-center justify-content-center"
                        size="lg"
                        disabled={isLoading}
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
                                <FiSend className="me-2" />
                                Enviar enlace
                            </>
                        )}
                    </Button>
                    </Form>

                    {/* Enlace de regreso a Login con mejor diseño */}
                    <div className="text-center mt-4">
                        <Link to="/login" className="d-flex align-items-center justify-content-center text-decoration-none">
                            <FiArrowLeft className="me-2" />
                            Volver al inicio de sesión
                        </Link>
                        <p className="mt-2 text-muted">
                            ¿Ya recuerdas tu contraseña? Inicia sesión
                        </p>
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