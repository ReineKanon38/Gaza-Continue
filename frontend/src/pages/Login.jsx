import { useState } from 'react';
import { Container, Card, Form, Button, InputGroup, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { BsEnvelopeFill, BsLockFill } from 'react-icons/bs';
import { FiLogIn } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { requestJson } from '../services/httpClient';

function Login() {
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [twoFactorToken, setTwoFactorToken] = useState('');
  const [requires2FA, setRequires2FA] = useState(false);
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
        const payload = { email, password };
        if (requires2FA) {
          if (!twoFactorToken) {
            setError('Por favor ingresa el código de 6 dígitos.');
            setLoading(false);
            return;
          }
          payload.twoFactorToken = twoFactorToken;
        }

        const data = await requestJson('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify(payload)
        });

        if (data?.requires2fa || data?.data?.requires2fa || data?.status === 202) {
          setRequires2FA(true);
          setError('');
          setLoading(false);
          return;
        }

        const authToken = data?.accessToken || data?.token || data?.data?.accessToken || data?.data?.token;
        const refreshToken = data?.refreshToken || data?.data?.refreshToken;
        const authUser = data?.user || data?.data?.user;

        if (!authToken || !authUser) {
          throw new Error('La respuesta de autenticación no es válida');
        }

        login({ accessToken: authToken, refreshToken }, authUser);
        showSuccess(`Bienvenido, ${authUser?.name || 'Usuario'}`);
        
        if (authUser.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/catalog');
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
      className="d-flex vh-100 justify-content-center align-items-center bg-page-content fade-in-up"
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

            {!requires2FA ? (
              <>
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
                      disabled={loading}
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
                      disabled={loading}
                    />
                  </InputGroup>
                </Form.Group>
              </>
            ) : (
              <>
                <Alert variant="info">
                  Tu cuenta está protegida con Autenticación de Dos Factores.
                </Alert>
                <Form.Group className="mb-3" controlId="formBasic2FA">
                  <Form.Label>Código A2F</Form.Label>
                  <InputGroup>
                    <InputGroup.Text>
                      <BsLockFill />
                    </InputGroup.Text>
                    <Form.Control 
                      type="text" 
                      placeholder="Código de 6 dígitos" 
                      value={twoFactorToken}
                      onChange={(e) => setTwoFactorToken(e.target.value.replace(/\D/g, '').substring(0, 6))}
                      disabled={loading}
                      maxLength={6}
                    />
                  </InputGroup>
                </Form.Group>
              </>
            )}
            
            <Button 
              type="submit"
              className="w-100 mt-3 d-flex align-items-center justify-content-center btn-custom-primary"
              size="lg"
              disabled={loading}
            >
              <FiLogIn className="me-2" /> 
              {loading ? (requires2FA ? 'Verificando...' : 'Ingresando...') : (requires2FA ? 'Verificar A2F' : 'Ingresar')}
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
