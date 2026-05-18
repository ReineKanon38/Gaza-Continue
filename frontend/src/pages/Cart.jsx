import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button, Card, Badge, Spinner, Form } from 'react-bootstrap'; // Se agregó Form
import AppNavbar from '../components/AppNavbar';
import { BsTrash, BsArrowLeft, BsShieldLock, BsCreditCard, BsTruck, BsCheckCircle, BsGeoAlt, BsWallet2, BsDashLg, BsPlusLg, BsStars } from 'react-icons/bs';
import { useCartHelpers } from '../hooks'; 
import './Catalog.css';

function Cart() {
  const navigate = useNavigate();
  const { cart, isCartEmpty, removeFromCart, clearCart, subtotal, totalPrice, updateQuantity } = useCartHelpers(); 

  // --- NUEVA LÓGICA DE LOGÍSTICA ---
  const [shippingCost, setShippingCost] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('card');

  const handleCheckout = (e) => {
    e.preventDefault();
    // Redirigir a checkout para registrar pedido con validacion bancaria.
    navigate('/checkout');
  };

  if (isCartEmpty) {
    return (
      <div className="bg-light min-vh-100">
        <AppNavbar />
        <Container className="py-5">
          <Card className="border-0 shadow-sm rounded-4 p-5 text-center bg-white mx-auto" style={{ maxWidth: '600px' }}>
            <h2 className="fw-bold mb-3">Tu carrito está vacío</h2>
            <p className="text-muted mb-4">Añade productos para comenzar tu cotización.</p>
            <div className="d-flex flex-column flex-sm-row justify-content-center gap-2">
              <Button variant="primary" size="lg" className="rounded-pill px-4" onClick={() => navigate('/catalog')}>
                Explorar Catálogo
              </Button>
              <Button variant="outline-dark" size="lg" className="rounded-pill px-4" onClick={() => navigate('/super-precio')}>
                <BsStars className="me-2" /> Ver Super Precio
              </Button>
            </div>
          </Card>
        </Container>
      </div>
    );
  }

  return (
    <div className="bg-light min-vh-100 pb-5">
      <AppNavbar />
      
      <div className="bg-white border-bottom py-5 mb-5 shadow-sm">
        <Container>
          <div className="d-flex align-items-center justify-content-between">
            <div>
              <h1 className="fw-bold m-0 h2" style={{ color: '#1e293b' }}>Resumen de Compra</h1>
              <p className="text-muted m-0 mt-1 small">Revisa tus artículos y datos de envío.</p>
            </div>
            <Badge bg="dark" pill className="px-4 py-2 fs-6">
              {cart.items.length} {cart.items.length === 1 ? 'Producto' : 'Productos'}
            </Badge>
          </div>
        </Container>
      </div>

      <Container>
        <Form onSubmit={handleCheckout}> {/* Envolvemos todo en un Form para validar campos */}
          <Row className="g-5"> 
            <Col lg={8}>
              {/* SECCIÓN 1: PRODUCTOS (Tu código original) */}
              <Card className="border-0 shadow-sm rounded-4 overflow-hidden bg-white mb-4">
                <div className="p-0">
                  {cart.items.map((item) => (
                    <div key={item.product._id} className="p-4 border-bottom bg-white item-cart-row">
                      <Row className="align-items-center">
                        <Col md={3} className="text-center py-2">
                          <img 
                            src={item.product.image || 'https://via.placeholder.com/150'} 
                            alt={item.product.name}
                            className="img-fluid rounded-3"
                            style={{ maxHeight: '120px', width: 'auto' }}
                          />
                        </Col>
                        <Col md={6} className="ps-md-4">
                          <h4 className="fw-bold text-dark mb-2 h5">{item.product.name}</h4>
                          <div className="d-flex align-items-center gap-3 mb-3">
                              <Badge bg={item.product.stock > 5 ? 'success' : 'warning'} className="bg-opacity-10 text-dark border border-opacity-25 px-2 py-1 fw-normal small">
                                  <BsCheckCircle className="me-1" /> {item.product.stock > 0 ? `Stock: ${item.product.stock}` : 'Sin stock'}
                              </Badge>
                              <span className="text-muted small"><BsTruck className="me-1" /> Envío Priority</span>
                          </div>
                          <div className="d-flex align-items-center gap-2">
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                            >
                              <BsDashLg />
                            </Button>
                            <span className="text-muted mb-0 small">Cantidad: <strong className="text-dark">{item.quantity}</strong></span>
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                              disabled={item.quantity >= Number(item.product.stock || 0)}
                            >
                              <BsPlusLg />
                            </Button>
                          </div>
                        </Col>
                        <Col md={3} className="text-md-end">
                          <div className="small text-muted mb-1">
                            ${Number(item.product.price || 0).toLocaleString('es-MX')} c/u
                          </div>
                          <div className="fs-4 fw-bold text-primary mb-3">
                            ${(Number(item.product.price || 0) * item.quantity).toLocaleString('es-MX')}
                          </div>
                          <Button 
                            variant="outline-danger" 
                            className="rounded-pill px-3 btn-sm border-0 bg-light text-danger"
                            onClick={() => removeFromCart(item.product._id)}
                          >
                            <BsTrash className="me-1" /> Quitar
                          </Button>
                        </Col>
                      </Row>
                    </div>
                  ))}
                </div>
                <div className="p-4 bg-white d-flex justify-content-between">
                  <Button variant="link" className="text-decoration-none text-secondary p-0 small" onClick={() => navigate('/catalog')}>
                    <BsArrowLeft className="me-2" /> Seguir comprando
                  </Button>
                  <Button variant="link" className="text-muted small text-decoration-none p-0" onClick={clearCart}>
                    Limpiar carrito
                  </Button>
                </div>
              </Card>

              {/* SECCIÓN 2: DATOS DE ENVÍO (NUEVA) */}
              <Card className="border-0 shadow-sm rounded-4 p-4 bg-white mb-4">
                <h5 className="fw-bold mb-4 d-flex align-items-center">
                  <BsGeoAlt className="me-2 text-primary" /> Dirección de Entrega
                </h5>
                <Row>
                  <Col md={12} className="mb-3">
                    <Form.Group>
                      <Form.Label className="small fw-bold text-muted">Calle y Número</Form.Label>
                      <Form.Control required type="text" placeholder="Ej. Av. Insurgentes Sur 123" className="border-light bg-light" />
                    </Form.Group>
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label className="small fw-bold text-muted">Código Postal</Form.Label>
                      <Form.Control 
                        required 
                        type="text" 
                        placeholder="00000" 
                        className="border-light bg-light"
                        onChange={(e) => setShippingCost(e.target.value.length > 0 ? 150 : 0)} 
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label className="small fw-bold text-muted">Ciudad</Form.Label>
                      <Form.Control required type="text" placeholder="México" className="border-light bg-light" />
                    </Form.Group>
                  </Col>
                </Row>
              </Card>

              {/* SECCIÓN 3: MÉTODO DE PAGO (NUEVA) */}
              <Card className="border-0 shadow-sm rounded-4 p-4 bg-white">
                <h5 className="fw-bold mb-4 d-flex align-items-center">
                  <BsWallet2 className="me-2 text-primary" /> Método de Pago
                </h5>
                <div className="d-flex flex-column gap-2">
                  <div className={`p-3 rounded-3 border ${paymentMethod === 'card' ? 'border-primary bg-primary bg-opacity-10' : 'border-light bg-light'}`} 
                       onClick={() => setPaymentMethod('card')} style={{ cursor: 'pointer' }}>
                    <Form.Check 
                      type="radio" 
                      label="Tarjeta de Crédito / Débito" 
                      name="payment" 
                      checked={paymentMethod === 'card'} 
                      onChange={() => setPaymentMethod('card')}
                    />
                  </div>
                  <div className={`p-3 rounded-3 border ${paymentMethod === 'spei' ? 'border-primary bg-primary bg-opacity-10' : 'border-light bg-light'}`} 
                       onClick={() => setPaymentMethod('spei')} style={{ cursor: 'pointer' }}>
                    <Form.Check 
                      type="radio" 
                      label="Transferencia SPEI" 
                      name="payment" 
                      checked={paymentMethod === 'spei'} 
                      onChange={() => setPaymentMethod('spei')}
                    />
                  </div>
                </div>
              </Card>
            </Col>

            {/* COLUMNA DERECHA: RESUMEN (Modificado para incluir Envío) */}
            <Col lg={4}>
              <Card className="border-0 shadow-lg rounded-4 p-4 sticky-top bg-white" style={{ top: '120px' }}>
                <h3 className="fw-bold mb-4 h5">Resumen de Orden</h3>
                
                <div className="d-flex justify-content-between mb-2 text-secondary small">
                  <span>Subtotal</span>
                  <span className="text-dark fw-medium">${subtotal.toLocaleString('es-MX')}</span>
                </div>
                <div className="d-flex justify-content-between mb-3 text-secondary small">
                  <span>Envío Estimado</span>
                  <span className={shippingCost > 0 ? "text-dark fw-medium" : "text-success fw-bold"}>
                    {shippingCost > 0 ? `$${shippingCost.toLocaleString('es-MX')}` : 'Gratis'}
                  </span>
                </div>

                <hr className="my-4 opacity-50" />

                <div className="text-center py-2 mb-4">
                  <div className="text-uppercase small text-muted fw-bold mb-1">Total a Pagar</div>
                  <div className="text-primary display-6 fw-bold">
                    ${(totalPrice + shippingCost).toLocaleString('es-MX')}
                  </div>
                  <p className="text-muted small mt-1">IVA incluido</p>
                </div>

                <Button 
                  type="submit" // Cambiado a submit para validar el Form
                  variant="primary" 
                  size="lg" 
                  className="w-100 fw-bold py-3 rounded-3 mb-4 shadow-sm"
                  disabled={cart.items.length === 0}
                  style={{ backgroundColor: '#2563eb', border: 'none' }}
                >
                  <><BsCreditCard className="me-2" /> CONFIRMAR Y PAGAR</>
                </Button>

                <div className="p-3 rounded-3 border bg-light">
                  <div className="d-flex align-items-center mb-2">
                    <BsShieldLock className="text-success me-2" size={18} />
                    <span className="small fw-bold text-dark">Pago Seguro</span>
                  </div>
                  <p className="text-muted mb-0" style={{ fontSize: '0.75rem' }}>
                    Tus datos de pago están encriptados. No almacenamos los números de tu tarjeta.
                  </p>
                </div>
              </Card>
            </Col>
          </Row>
        </Form>
      </Container>
    </div>
  );
}

export default Cart;