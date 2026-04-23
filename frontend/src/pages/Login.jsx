import { useState } from 'react';
import { Container, Card, Form, Button, InputGroup, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { BsEnvelopeFill, BsLockFill } from 'react-icons/bs';
import { FiLogIn } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

function Login() {
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showSuccess, showError } = useNotification();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Por favor, completa todos los campos.');
      return;
    }
    try {
      setLoading(true);
      const apiUrl = import.meta.env.VITE_API_URL;
      // Modo sin-backend: simular login localmente
      if (!apiUrl) {
        const fakeUser = { id: 'local-1', name: email.split('@')[0] || 'Usuario', email, role: 'user' };
        login('dev-token', fakeUser);
        showSuccess('Sesión iniciada correctamente');
        navigate('/catalog');
      } else {
        const res = await fetch(`${apiUrl}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.message || 'Error al iniciar sesión');
        }
        const authToken = data?.token || data?.data?.token;
        const authUser = data?.user || data?.data?.user;

        if (!authToken || !authUser) {
          throw new Error('La respuesta de autenticación no es válida');
        }

        login(authToken, authUser);
        showSuccess(`Bienvenido, ${authUser?.name || 'Usuario'}`);
        // Redirigir según el rol del usuario
        if (authUser.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/catalog');
        }
      }
    } catch (err) {
      setError(err.message);
      showError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Container 
      fluid
      className="d-flex vh-100 justify-content-center align-items-center bg-page-content"
    >
      <Card className="w-100 p-4 shadow-sm" style={{ maxWidth: '400px' }}>
        <Card.Body>
          <h2 className="text-center fw-bold mb-4">Iniciar Sesión</h2>
          
          <Form onSubmit={handleLogin}>
            
            {error && (
              <Alert variant="danger" onClose={() => setError('')} dismissible>
                {error}
              </Alert>
            )}

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

            <Form.Group className="mb-3" controlId="formBasicPassword">
              <Form.Label>Contraseña</Form.Label>
              <InputGroup>
                <InputGroup.Text>
                  <BsLockFill />
                </InputGroup.Text>
                <Form.Control 
                  type="password" 
                  placeholder="Contraseña" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </InputGroup>
            </Form.Group>
            
            <Button 
              type="submit"
              className="w-100 mt-3 d-flex align-items-center justify-content-center btn-custom-primary"
              size="lg"
              disabled={loading}
            >
              <FiLogIn className="me-2" /> 
              {loading ? 'Ingresando...' : 'Ingresar'}
            </Button>
            
            <div className="text-center mt-4">
              <Link to="/reset">
                ¿Olvidaste tu contraseña?
              </Link>
              <span className="mx-2">|</span>
              <Link to="/register">
                ¿No tienes cuenta? Regístrate
              </Link>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default Login;
