import { useState } from 'react';
import { Container, Card, Form, Button, InputGroup, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
// Importamos los iconos
import { BsPersonFill, BsEnvelopeFill, BsLockFill, BsEye, BsEyeSlash } from 'react-icons/bs';
import { FiUserPlus } from 'react-icons/fi';
import { requestJson } from '../services/httpClient';

function Register() {

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleRegistro = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!username || !email || !password) {
      setError('Por favor, completa todos los campos.');
      return;
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    try {
      setLoading(true);
        const payload = {
          name: username,
          email,
          password
        };

        await requestJson('/api/auth/register', {
          method: 'POST',
          body: JSON.stringify(payload)
        });

        setSuccess('Registro exitoso. Ahora puedes iniciar sesión.');
        setTimeout(() => navigate('/login'), 1000);
    } catch (err) {
      setError(err.message);
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
            <h2 className="auth-title mb-2">Crear Cuenta</h2>
            <p className="text-muted">¡Únete a SYSCOM-GAZA hoy!</p>
          </div>
          
          <Form onSubmit={handleRegistro}>

            {/* Alerta de error (si existe) */}
            {error && (
              <Alert variant="danger" className="border-0 shadow-sm" onClose={() => setError('')} dismissible>
                {error}
              </Alert>
            )}
            {success && (
              <Alert variant="success" className="border-0 shadow-sm" onClose={() => setSuccess('')} dismissible>
                {success}
              </Alert>
            )}
            
            <Form.Group className="mb-4" controlId="formBasicUsername">
              <Form.Label className="text-muted fw-semibold">Nombre de usuario</Form.Label>
              <InputGroup className="search-group-modern shadow-sm">
                <InputGroup.Text className="bg-transparent border-0 text-muted ps-3">
                  <BsPersonFill />
                </InputGroup.Text>
                <Form.Control 
                  type="text" 
                  placeholder="Ingresa tu nombre de usuario" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-transparent border-0 shadow-none py-2"
                />
              </InputGroup>
            </Form.Group>
            
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

            <Button 
              type="submit" 
              className="w-100 mt-2 py-3 d-flex align-items-center justify-content-center btn-custom-primary rounded-pill shadow"
              size="lg"
              disabled={loading}
              style={{ fontWeight: '600' }}
            >
              <FiUserPlus className="me-2 fs-5" />
              {loading ? 'Registrando...' : 'Registrarse'}
            </Button>
            
            <div className="text-center mt-4 pt-2">
              <Link to="/login" className="auth-link d-block">
                ¿Ya tienes cuenta? Inicia sesión
              </Link>
            </div>
            
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default Register;