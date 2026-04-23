import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Spinner } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { BsArrowLeft, BsCheckCircle, BsShieldCheck, BsTruck } from 'react-icons/bs';
import AppNavbar from '../components/AppNavbar';
import AddressForm from '../components/AddressForm';
import { useCartHelpers } from '../hooks/useCartHooks';
import { paymentService } from '../services/paymentService';
import orderService from '../services/orderService';
import './Checkout.css'; 

function Checkout() {
  const navigate = useNavigate();
  const { cart, totalItems, totalPrice, clearCart } = useCartHelpers();

  const [address, setAddress] = useState({
    street: '', number: '', neighborhood: '', city: '', state: '', zipCode: '', country: 'México'
  });

  const [orderSuccess, setOrderSuccess] = useState(false);
  const [serverError, setServerError] = useState('');
  const [shippingCost, setShippingCost] = useState(0);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState('');
  const [isLoadingPayment, setIsLoadingPayment] = useState(true);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  useEffect(() => {
    if (address.zipCode && address.zipCode.length === 5) {
      setShippingCost(totalPrice >= 2500 ? 0 : 185);
    }
  }, [address.zipCode, totalPrice]);

  useEffect(() => {
    const loadPaymentMethods = async () => {
      try {
        setIsLoadingPayment(true);
        const response = await paymentService.getPaymentMethods();
        const methods = response?.methods || [];
        setPaymentMethods(methods);
        if (methods.length > 0) {
          setSelectedProvider(methods[0].provider);
        }
      } catch (error) {
        console.error('Error al cargar metodos de pago:', error);
        setServerError(error.message || 'Error al preparar métodos de pago. Intenta de nuevo.');
      } finally {
        setIsLoadingPayment(false);
      }
    };

    loadPaymentMethods();
  }, []);

  const isAddressValid = () => {
    return [
      address.street,
      address.number,
      address.neighborhood,
      address.city,
      address.state,
      address.zipCode
    ].every((field) => String(field || '').trim().length > 0) && /^\d{5}$/.test(address.zipCode || '');
  };

  const handlePlaceOrder = async () => {
    try {
      if (!isAddressValid()) {
        setServerError('Completa tu direccion de envio (incluyendo CP valido de 5 digitos).');
        return;
      }

      if (!selectedProvider) {
        setServerError('Selecciona un banco para continuar.');
        return;
      }

      setIsSubmittingOrder(true);
      setServerError('');

      const paymentSession = await paymentService.createPaymentSession({
        amount: totalPrice + shippingCost,
        items: cart.items,
        orderId: `ORDER-${Date.now()}`,
        provider: selectedProvider
      });

      await paymentService.confirmPaymentSession({
        paymentSessionId: paymentSession.paymentSessionId,
        provider: selectedProvider
      });

      const orderData = {
        products: cart.items.map(item => ({
          productId: item.product?._id || item._id,
          quantity: item.quantity
        })),
        shippingAddress: address,
        paymentInfo: {
          method: 'bank_transfer',
          cardHolder: `${selectedProvider.toUpperCase()} - VALIDACION MANUAL`
        }
      };

      await orderService.createOrder(orderData);
      clearCart();
      setOrderSuccess(true);
    } catch (error) {
      console.error('Error al crear la orden:', error);
      setServerError(error.message || 'No fue posible registrar la orden. Intenta nuevamente.');
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="checkout-main-wrapper">
        <AppNavbar />
        <Container className="py-5">
          <div className="checkout-success-card">
            <BsCheckCircle className="status-icon-success" />
            <h2 className="fw-bold">¡Pago Procesado Exitosamente!</h2>
            <p className="text-muted mb-2">Tu pedido fue registrado y el pago quedó en validacion bancaria.</p>
            <p className="text-muted">
              <strong>Próximos pasos:</strong><br/>
              Un asesor revisara tu comprobante y te contactara para confirmar aplicacion de pago, entrega y detalle final.
            </p>
            <Button as={Link} to="/catalog" className="btn-primary-gaza mt-3">Volver al Catálogo</Button>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="checkout-main-wrapper">
      <AppNavbar />
      <Container className="py-4 mt-3">
        <div className="checkout-header-area">
          <Button variant="link" onClick={() => navigate('/cart')} className="back-link">
            <BsArrowLeft /> Volver al carrito
          </Button>
          <h2 className="checkout-title">Finalizar Compra</h2>
        </div>

        {serverError && <Alert variant="danger">{serverError}</Alert>}

        <Row className="gx-5">
          {/* Columna de Formularios */}
          <Col lg={7} xl={8} className="checkout-forms-col">
            <div className="form-section-container">
              <AddressForm address={address} onChange={setAddress} errors={{}} />
            </div>
            
            <div className="form-section-container mt-4">
              <h5 className="mb-3">
                <BsShieldCheck className="me-2" />
                Metodo de Pago
              </h5>
              
              {isLoadingPayment ? (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="primary" />
                  <p className="mt-3 text-muted">Cargando opciones bancarias...</p>
                </div>
              ) : (
                <>
                  {paymentMethods.length === 0 ? (
                    <Alert variant="warning">
                      No hay metodos bancarios disponibles por el momento.
                    </Alert>
                  ) : (
                    <div>
                      <p className="text-muted mb-3">
                        Selecciona el banco para generar referencia y dejar tu pedido en validacion segura.
                      </p>

                      <div className="d-grid gap-2 mb-3">
                        {paymentMethods.map((method) => (
                          <Card
                            key={method.id}
                            onClick={() => setSelectedProvider(method.provider)}
                            className={`p-3 border ${selectedProvider === method.provider ? 'border-primary' : 'border-light-subtle'}`}
                            role="button"
                          >
                            <strong>{method.name}</strong>
                            <span className="text-muted small">{method.description}</span>
                          </Card>
                        ))}
                      </div>

                      <Button
                        className="w-100"
                        onClick={handlePlaceOrder}
                        disabled={isSubmittingOrder || !selectedProvider || cart.items.length === 0}
                      >
                        {isSubmittingOrder ? 'Registrando pedido...' : 'Confirmar pedido con pago bancario'}
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </Col>

          {/* Columna de Resumen Lateral */}
          <Col lg={5} xl={4} className="checkout-summary-col">
            <div className="sticky-summary-box">
              <h5 className="summary-title">Resumen de Orden</h5>
              
              <div className="summary-row">
                <span>Subtotal ({totalItems} productos)</span>
                <span>${totalPrice.toLocaleString()}</span>
              </div>
              
              <div className="summary-row">
                <span><BsTruck /> Envío</span>
                <span className={shippingCost === 0 ? "free-shipping" : ""}>
                  {shippingCost === 0 ? 'Gratis' : `$${shippingCost}`}
                </span>
              </div>

              <hr className="summary-divider" />

              <div className="total-row">
                <span className="total-label">TOTAL A PAGAR</span>
                <span className="total-amount">${(totalPrice + shippingCost).toLocaleString()}</span>
              </div>

              <div className="security-note mt-3">
                <BsShieldCheck /> Flujo bancario con validacion manual de seguridad
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default Checkout;