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
      <Card className="w-100 p-4 shadow-sm" style={{ maxWidth: '400px' }}>
        <Card.Body>
          
          <h2 className="text-center fw-bold mb-4">Crear Cuenta</h2>
          
          <Form onSubmit={handleRegistro}>

            {/* Alerta de error (si existe) */}
            {error && (
              <Alert variant="danger" onClose={() => setError('')} dismissible>
                {error}
              </Alert>
            )}
            {success && (
              <Alert variant="success" onClose={() => setSuccess('')} dismissible>
                {success}
              </Alert>
            )}
            
            <Form.Group className="mb-3" controlId="formBasicUsername">
              <Form.Label>Nombre de usuario</Form.Label>
              <InputGroup>
                <InputGroup.Text>
                  <BsPersonFill />
                </InputGroup.Text>
                <Form.Control 
                  type="text" 
                  placeholder="Ingresa tu nombre de usuario" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </InputGroup>
            </Form.Group>
            
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
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Contraseña" 
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
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? <BsEyeSlash /> : <BsEye />}
                </Button>
              </InputGroup>
            </Form.Group>

            {/* CAMBIO AQUÍ:
              Quitamos 'variant="primary"'
              Añadimos 'className="btn-custom-primary"' 
            */}
            <Button 
              type="submit" 
              className="w-100 mt-3 d-flex align-items-center justify-content-center btn-custom-primary"
              size="lg"
              disabled={loading}
            >
              <FiUserPlus className="me-2" />
              {loading ? 'Registrando...' : 'Registrarse'}
            </Button>
            
            <div className="text-center mt-4">
              <Link to="/login">
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