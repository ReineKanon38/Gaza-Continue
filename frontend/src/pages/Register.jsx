import { useState } from 'react';
import { Container, Card, Form, Button, InputGroup, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
// Importamos los iconos
import { BsPersonFill, BsEnvelopeFill, BsLockFill } from 'react-icons/bs';
import { FiUserPlus } from 'react-icons/fi';

function Register() {

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [adminRegistrationKey, setAdminRegistrationKey] = useState('');
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
      const apiUrl = import.meta.env.VITE_API_URL;
      // Modo sin-backend: simular registro exitoso
      if (!apiUrl) {
        setSuccess('Registro simulado exitoso. Ahora puedes iniciar sesión.');
        setTimeout(() => navigate('/login'), 800);
      } else {
        const payload = {
          name: username,
          email,
          password,
          role
        };
        if (role === 'admin') {
          payload.adminRegistrationKey = adminRegistrationKey;
        }

        const res = await fetch(`${apiUrl}/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.message || 'Error al registrarse');
        }
        setSuccess('Registro exitoso. Ahora puedes iniciar sesión.');
        setTimeout(() => navigate('/login'), 1000);
      }
    } catch (err) {
      setError(err.message);
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
                  type="password" 
                  placeholder="Contraseña" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </InputGroup>
            </Form.Group>

            <Form.Group className="mb-3" controlId="formRole">
              <Form.Label>Tipo de cuenta</Form.Label>
              <Form.Select value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="user">Cliente</option>
                <option value="admin">Administrador</option>
              </Form.Select>
            </Form.Group>

            {role === 'admin' && (
              <Form.Group className="mb-3" controlId="formAdminRegistrationKey">
                <Form.Label>Clave de registro admin (opcional)</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Clave de autorización (si aplica)"
                  value={adminRegistrationKey}
                  onChange={(e) => setAdminRegistrationKey(e.target.value)}
                />
                <Form.Text className="text-muted">
                  Si backend no tiene clave configurada, solo se permitirá crear un primer admin temporal.
                </Form.Text>
              </Form.Group>
            )}

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