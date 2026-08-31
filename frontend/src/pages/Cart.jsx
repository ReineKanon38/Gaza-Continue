import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button, Card, Badge, ProgressBar } from 'react-bootstrap';
import AppNavbar from '../components/AppNavbar';
import { BsTrash, BsArrowLeft, BsShieldLock, BsCreditCard, BsTruck, BsCheckCircle, BsDashLg, BsPlusLg, BsStars } from 'react-icons/bs';
import { useCartHelpers } from '../hooks/useCartHooks'; 
import './Checkout.css';

function Cart() {
  const navigate = useNavigate();
  const { 
    cart, 
    isCartEmpty, 
    removeFromCart, 
    clearCart, 
    subtotal, 
    tax, 
    shippingCost, 
    isFreeShipping, 
    freeShippingRemaining, 
    freeShippingProgress, 
    totalPrice, 
    updateQuantity 
  } = useCartHelpers(); 

  const handleCheckout = () => {
    // Redirigir a checkout para registrar dirección y realizar validación bancaria.
    navigate('/checkout');
  };

  if (isCartEmpty) {
    return (
      <div className="bg-page-content min-vh-100 pb-5">
        <AppNavbar />
        <Container className="py-5 mt-5">
          <Card className="auth-card p-5 text-center mx-auto fade-in-up border-0" style={{ maxWidth: '600px' }}>
            <h2 className="fw-bold mb-3 text-dark">Tu carrito está vacío</h2>
            <p className="text-secondary mb-4">Añade productos de TI o ciberseguridad para iniciar tu cotización.</p>
            <div className="d-flex flex-column flex-sm-row justify-content-center gap-3">
              <Button className="btn-custom-primary py-2.5 px-4" onClick={() => navigate('/tienda')}>
                Explorar Catálogo
              </Button>
              <Button variant="outline-secondary" className="py-2.5 px-4" onClick={() => navigate('/ofertas')}>
                <BsStars className="me-2 text-warning" /> Ver Super Precio
              </Button>
            </div>
          </Card>
        </Container>
      </div>
    );
  }

  return (
    <div className="bg-page-content pb-5 min-vh-100">
      <AppNavbar />
      
      <div className="py-5 mb-5 shadow-sm fade-in-up" style={{ background: 'var(--surface-0)', borderBottom: '1px solid var(--border-color)' }}>
        <Container>
          <div className="d-flex align-items-center justify-content-between">
            <div>
              <h1 className="fw-bold m-0 h2" style={{ color: 'var(--primary-dark)' }}>Resumen de Compra</h1>
              <p className="text-secondary m-0 mt-1 small">Revisa los artículos de tu cotización antes de proceder al pago.</p>
            </div>
            <Badge bg="dark" pill className="px-4 py-2 fs-6">
              {cart.items.length} {cart.items.length === 1 ? 'Producto' : 'Productos'}
            </Badge>
          </div>
        </Container>
      </div>

      <Container className="fade-in-up">
        {/* BARRA DINÁMICA DE ENVÍO GRATIS */}
        <Card className="border-0 mb-4 p-3 shadow-sm" style={{ background: isFreeShipping ? '#ecfdf5' : '#f8fafc', borderLeft: isFreeShipping ? '5px solid #10b981' : '5px solid #2563eb' }}>
          <div className="d-flex align-items-center justify-content-between mb-2">
            <div className="d-flex align-items-center gap-2">
              <BsTruck className={isFreeShipping ? 'text-success fs-5' : 'text-primary fs-5'} />
              <span className="fw-bold text-dark" style={{ fontSize: '0.95rem' }}>
                {isFreeShipping ? (
                  '🎉 ¡Felicidades! Tu orden califica para ENVÍO GRATIS a todo México'
                ) : (
                  <>🚚 ¡Agrega <span className="text-primary">${freeShippingRemaining.toLocaleString('es-MX')} MXN</span> más para obtener <strong>ENVÍO GRATIS</strong>!</>
                )}
              </span>
            </div>
            <Badge bg={isFreeShipping ? 'success' : 'primary'} className="px-2.5 py-1.5">
              {isFreeShipping ? 'Envío Gratis Activo' : `Meta: $2,499 MXN`}
            </Badge>
          </div>
          <ProgressBar 
            now={freeShippingProgress} 
            variant={isFreeShipping ? 'success' : 'primary'} 
            style={{ height: '8px', borderRadius: '4px' }} 
            animated={!isFreeShipping}
          />
        </Card>

        <Row className="g-5"> 
          <Col lg={8}>
            {/* LISTA DE PRODUCTOS */}
            <Card className="auth-card border-0 mb-4">
              <div className="p-0">
                {cart.items.map((item) => (
                  <div key={item.product._id} className="p-4 border-bottom item-cart-row">
                    <Row className="align-items-center">
                      <Col md={3} className="text-center py-2">
                        <img 
                          src={item.product.image || 'https://via.placeholder.com/150'} 
                          alt={item.product.name}
                          className="img-fluid rounded-3 shadow-sm"
                          style={{ maxHeight: '120px', width: 'auto' }}
                        />
                      </Col>
                      <Col md={6} className="ps-md-4">
                        <h4 className="fw-bold text-dark mb-2 h5">{item.product.name}</h4>
                        <div className="d-flex align-items-center gap-3 mb-3">
                          <Badge bg={item.product.stock > 5 ? 'success' : 'warning'} className="bg-opacity-10 text-dark border border-opacity-25 px-2 py-1 fw-normal small">
                            <BsCheckCircle className="me-1 text-success" /> {item.product.stock > 0 ? `Stock: ${item.product.stock}` : 'Sin stock'}
                          </Badge>
                          <span className="text-secondary small"><BsTruck className="me-1" /> Envío Directo GAZA</span>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            className="p-1 d-flex align-items-center justify-content-center"
                            style={{ width: '28px', height: '28px', borderRadius: '50%' }}
                            onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                          >
                            <BsDashLg />
                          </Button>
                          <span className="text-secondary mb-0 mx-2 small">Cantidad: <strong className="text-dark">{item.quantity}</strong></span>
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            className="p-1 d-flex align-items-center justify-content-center"
                            style={{ width: '28px', height: '28px', borderRadius: '50%' }}
                            onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                            disabled={item.quantity >= Number(item.product.stock || 0)}
                          >
                            <BsPlusLg />
                          </Button>
                        </div>
                      </Col>
                      <Col md={3} className="text-md-end mt-3 mt-md-0">
                        <div className="fw-bold text-dark fs-5">
                          ${(item.product.price * item.quantity).toLocaleString('es-MX')}
                        </div>
                        <div className="text-secondary small mb-3">
                          ${Number(item.product.price || 0).toLocaleString('es-MX')} c/u (neto)
                        </div>
                        <Button 
                          variant="outline-danger" 
                          size="sm" 
                          className="border-0 p-2 text-danger bg-danger bg-opacity-10 rounded-circle"
                          onClick={() => removeFromCart(item.product._id)}
                          title="Eliminar producto"
                        >
                          <BsTrash />
                        </Button>
                      </Col>
                    </Row>
                  </div>
                ))}
              </div>
              <div className="p-4 bg-white bg-opacity-10 d-flex justify-content-between">
                <Button
                  variant="link"
                  className="text-decoration-none text-secondary p-0 small d-flex align-items-center gap-2"
                  onClick={() => navigate('/tienda')}
                >
                  <BsArrowLeft /> Seguir comprando
                </Button>
                <Button variant="link" className="text-danger small text-decoration-none p-0" onClick={clearCart}>
                  Limpiar carrito
                </Button>
              </div>
            </Card>
          </Col>

          {/* COLUMNA DERECHA: RESUMEN TOTALIZADOR */}
          <Col lg={4}>
            <div className="sticky-summary-box">
              <Card className="auth-card border-0 p-4">
                <h3 className="fw-bold mb-4 h5 text-dark">Resumen de Orden</h3>
                
                <div className="d-flex justify-content-between mb-2 text-secondary small">
                  <span>Subtotal ({cart.items.reduce((acc, i) => acc + i.quantity, 0)} items):</span>
                  <span className="text-dark fw-bold">${subtotal.toLocaleString('es-MX')}</span>
                </div>
                <div className="d-flex justify-content-between mb-2 text-secondary small">
                  <span>IVA (16% México):</span>
                  <span className="text-dark fw-bold">${tax.toLocaleString('es-MX')}</span>
                </div>
                <div className="d-flex justify-content-between mb-3 text-secondary small">
                  <span>Envío a Domicilio:</span>
                  {isFreeShipping ? (
                    <Badge bg="success" className="bg-opacity-10 text-success fw-bold px-2 py-1">
                      ¡GRATIS!
                    </Badge>
                  ) : (
                    <span className="text-dark fw-bold">${shippingCost.toLocaleString('es-MX')}</span>
                  )}
                </div>

                <hr className="my-3 opacity-50" />

                <div className="text-center py-2 mb-4">
                  <div className="text-uppercase small text-secondary fw-bold mb-1">Total a Pagar</div>
                  <div className="text-primary display-6 fw-bold">
                    ${totalPrice.toLocaleString('es-MX')}
                  </div>
                  <p className="text-secondary small mt-1">Impuestos y envío incluidos</p>
                </div>

                <Button 
                  onClick={handleCheckout}
                  size="lg" 
                  className="w-100 fw-bold py-3 rounded-3 mb-4 shadow-sm btn-custom-primary"
                  disabled={cart.items.length === 0}
                >
                  <BsCreditCard className="me-2" /> CONTINUAR AL CHECKOUT
                </Button>

                <div className="p-3 rounded-3 border bg-white bg-opacity-40">
                  <div className="d-flex align-items-center mb-2">
                    <BsShieldLock className="text-success me-2" size={18} />
                    <span className="small fw-bold text-dark">Compra Protegida por GAZA</span>
                  </div>
                  <p className="text-secondary mb-0" style={{ fontSize: '0.75rem', lineHeight: '1.4' }}>
                    Tus pagos y datos de envío están cifrados y asegurados bajo protocolos de seguridad TLS / Stripe.
                  </p>
                </div>
              </Card>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default Cart;