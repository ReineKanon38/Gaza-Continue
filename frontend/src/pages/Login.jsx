import { useState } from 'react';
import { Container, Card, Form, Button, InputGroup, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { BsEnvelopeFill, BsLockFill, BsEye, BsEyeSlash } from 'react-icons/bs';
import { FiLogIn } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { requestJson } from '../services/httpClient';

function Login() {
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
          navigate('/tienda');
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
      <Card className="w-100 p-4 auth-card border-0" style={{ maxWidth: '420px' }}>
        <Card.Body className="p-sm-3">
          <div className="text-center mb-4">
            <h2 className="auth-title mb-2">Iniciar Sesión</h2>
            <p className="text-muted">¡Qué bueno verte de nuevo!</p>
          </div>
          
          <Form onSubmit={handleLogin}>
            
            {error && (
              <Alert variant="danger" className="border-0 shadow-sm" onClose={() => setError('')} dismissible>
                {error}
              </Alert>
            )}

            {!requires2FA ? (
              <>
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
                      disabled={loading}
                      className="bg-transparent border-0 shadow-none py-2"
                    />
                  </InputGroup>
                </Form.Group>

                <Form.Group className="mb-4" controlId="formBasicPassword">
                  <Form.Label className="text-muted fw-semibold">Contraseña</Form.Label>
                  <InputGroup className="search-group-modern shadow-sm">
                    <InputGroup.Text className="bg-transparent border-0 text-muted ps-3">
                      <BsLockFill />
                    </InputGroup.Text>
                    <Form.Control 
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Contraseña" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                      className="bg-transparent border-0 shadow-none py-2"
                    />
                    <Button
                      variant="link"
                      className="text-muted text-decoration-none pe-3"
                      tabIndex={-1}
                      onMouseDown={(e) => { e.preventDefault(); setShowPassword(true); }}
                      onMouseUp={() => setShowPassword(false)}
                      onMouseLeave={() => setShowPassword(false)}
                      onTouchStart={(e) => { e.preventDefault(); setShowPassword(true); }}
                      onTouchEnd={() => setShowPassword(false)}
                      aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    >
                      {showPassword ? <BsEyeSlash /> : <BsEye />}
                    </Button>
                  </InputGroup>
                </Form.Group>
              </>
            ) : (
              <>
                <Alert variant="info" className="border-0 shadow-sm mb-4">
                  Tu cuenta está protegida con Autenticación de Dos Factores.
                </Alert>
                <Form.Group className="mb-4" controlId="formBasic2FA">
                  <Form.Label className="text-muted fw-semibold">Código A2F</Form.Label>
                  <InputGroup className="search-group-modern shadow-sm">
                    <InputGroup.Text className="bg-transparent border-0 text-muted ps-3">
                      <BsLockFill />
                    </InputGroup.Text>
                    <Form.Control 
                      type="text" 
                      placeholder="Código de 6 dígitos" 
                      value={twoFactorToken}
                      onChange={(e) => setTwoFactorToken(e.target.value.replace(/\D/g, '').substring(0, 6))}
                      disabled={loading}
                      maxLength={6}
                      className="bg-transparent border-0 shadow-none py-2"
                    />
                  </InputGroup>
                </Form.Group>
              </>
            )}
            
            <Button 
              type="submit"
              className="w-100 mt-2 py-3 d-flex align-items-center justify-content-center btn-custom-primary rounded-pill shadow"
              size="lg"
              disabled={loading}
              style={{ fontWeight: '600' }}
            >
              <FiLogIn className="me-2 fs-5" /> 
              {loading ? (requires2FA ? 'Verificando...' : 'Ingresando...') : (requires2FA ? 'Verificar A2F' : 'Ingresar')}
            </Button>
            
            <div className="text-center mt-4 pt-2">
              <Link to="/reset" className="auth-link d-block mb-2">
                ¿Olvidaste tu contraseña?
              </Link>
              <Link to="/register" className="auth-link d-block">
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
