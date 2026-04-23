import { Container, Button, Stack, Row, Col, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { BsShieldCheck, BsTruck, BsStarFill, BsShop, BsArrowRight } from 'react-icons/bs';
import { FiLogIn, FiUserPlus } from 'react-icons/fi';
import './Index.css';

function Index() {
  const featureCards = [
    {
      icon: <BsShieldCheck />,
      title: 'Operación Confiable',
      description: 'Acceso seguro, gestión ordenada y panel administrativo para control diario.'
    },
    {
      icon: <BsTruck />,
      title: 'Flujo Comercial Ágil',
      description: 'Catálogo estructurado para cotizar rápido y atender clientes sin fricción.'
    },
    {
      icon: <BsStarFill />,
      title: 'Oferta Estratégica',
      description: 'Base preparada para productos de alta rotación y precios competitivos.'
    }
  ];

  return (
    <div className="landing-root">
      <Container className="landing-container">
        <div className="landing-hero-card">
          <div className="brand-mark" aria-hidden="true">
            <BsShop />
          </div>
          <Badge className="landing-badge">SYSCOM-GAZA</Badge>
          <h1 className="landing-title">Portal comercial listo para vender mejor.</h1>
          <p className="landing-subtitle">
            Plataforma orientada a operación diaria: control, catálogo y acceso rápido para equipos comerciales.
          </p>

          <Stack direction="horizontal" gap={3} className="justify-content-center flex-wrap mt-4">
            <Button as={Link} to="/login" className="landing-btn-primary d-flex align-items-center" size="lg">
              <FiLogIn className="me-2" /> Iniciar sesión
            </Button>
            <Button as={Link} to="/register" className="landing-btn-secondary d-flex align-items-center" size="lg">
              <FiUserPlus className="me-2" /> Crear cuenta
            </Button>
          </Stack>

          <div className="quick-links-row mt-4">
            <span>Videovigilancia</span>
            <span>Control de acceso</span>
            <span>Redes e IT</span>
            <span>Energía</span>
            <span>Radiocomunicación</span>
          </div>
        </div>

        <Row className="g-4 mt-2">
          {featureCards.map((card) => (
            <Col md={4} key={card.title}>
              <article className="feature-box h-100">
                <div className="feature-icon">{card.icon}</div>
                <h5>{card.title}</h5>
                <p>{card.description}</p>
              </article>
            </Col>
          ))}
        </Row>

        <div className="landing-footer-cta">
          <span>¿Listo para entrar al sistema?</span>
          <Link to="/login" className="footer-cta-link">
            Acceder ahora <BsArrowRight className="ms-1" />
          </Link>
        </div>
      </Container>
    </div>
  );
}

export default Index;