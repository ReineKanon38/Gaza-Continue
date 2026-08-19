import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Spinner, Form } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { BsArrowLeft, BsCheckCircle, BsShieldCheck, BsTruck } from 'react-icons/bs';
import AppNavbar from '../components/AppNavbar';
import AddressForm from '../components/AddressForm';
import { useCartHelpers } from '../hooks/useCartHooks';
import { paymentService } from '../services/paymentService';
import orderService from '../services/orderService';
import addressService from '../services/addressService';
import authService from '../services/authService';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import StripePaymentForm from '../components/StripePaymentForm';
import './Checkout.css'; 

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_placeholder');

const CHECKOUT_ADDRESS_STORAGE_KEY = 'gaza-checkout-address';

function Checkout() {
  const navigate = useNavigate();
  const { cart, totalItems, totalPrice, clearCart } = useCartHelpers();

  const [address, setAddress] = useState({
    street: '', number: '', neighborhood: '', city: '', state: '', zipCode: '', country: 'México'
  });

  const [orderSuccess, setOrderSuccess] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState('');
  const [selectedBankName, setSelectedBankName] = useState('');
  const [serverError, setServerError] = useState('');
  const [zipLookupLoading, setZipLookupLoading] = useState(false);
  const [zipLookupError, setZipLookupError] = useState('');
  const [zipLookupSuccess, setZipLookupSuccess] = useState(false);
  const [autoCompleteOptions, setAutoCompleteOptions] = useState({ neighborhoods: [] });
  const [shippingCost, setShippingCost] = useState(0);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState('');
  const [isLoadingPayment, setIsLoadingPayment] = useState(true);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [stripeClientSecret, setStripeClientSecret] = useState('');

  useEffect(() => {
    if (address.zipCode && address.zipCode.length === 5) {
      setShippingCost(totalPrice >= 2500 ? 0 : 185);
    }
  }, [address.zipCode, totalPrice]);

  useEffect(() => {
    const hydrateAddress = async () => {
      const localAddress = localStorage.getItem(CHECKOUT_ADDRESS_STORAGE_KEY);
      if (localAddress) {
        try {
          setAddress((prev) => ({ ...prev, ...JSON.parse(localAddress) }));
        } catch {
          localStorage.removeItem(CHECKOUT_ADDRESS_STORAGE_KEY);
        }
      }

      try {
        const saved = await authService.getSavedShippingAddress();
        if (saved?.zipCode) {
          setAddress((prev) => ({ ...prev, ...saved }));
        }
      } catch {
        // No bloquear checkout por falla de perfil
      }
    };

    hydrateAddress();
  }, []);

  useEffect(() => {
    localStorage.setItem(CHECKOUT_ADDRESS_STORAGE_KEY, JSON.stringify(address));
  }, [address]);

  useEffect(() => {
    const fetchZipDetails = async () => {
      const zip = String(address.zipCode || '');
      if (!/^\d{5}$/.test(zip)) {
        setZipLookupError('');
        setZipLookupSuccess(false);
        setAutoCompleteOptions({ neighborhoods: [] });
        return;
      }

      try {
        setZipLookupLoading(true);
        setZipLookupError('');
        setZipLookupSuccess(false);
        const info = await addressService.lookupZipCode(zip);

        setAutoCompleteOptions({
          neighborhoods: info?.neighborhoods || []
        });

        setAddress((prev) => ({
          ...prev,
          state: info?.state || prev.state,
          city: info?.city || prev.city,
          municipality: info?.municipality || prev.municipality,
          locality: info?.locality || prev.locality,
          neighborhood: info?.neighborhoods?.includes(prev.neighborhood)
            ? prev.neighborhood
            : (info?.neighborhoods?.[0] || prev.neighborhood)
        }));
        setZipLookupSuccess(true);
      } catch (error) {
        setZipLookupError(error.message || 'No se pudo autocompletar el CP');
        setZipLookupSuccess(false);
      } finally {
        setZipLookupLoading(false);
      }
    };

    fetchZipDetails();
  }, [address.zipCode]);

  useEffect(() => {
    const loadPaymentMethods = async () => {
      try {
        setIsLoadingPayment(true);
        const response = await paymentService.getPaymentMethods();
        const methods = response?.methods || [];
        setPaymentMethods(methods);
        if (methods.length > 0) {
          setSelectedProvider(methods[0].provider);
          setSelectedBankName(methods[0].name);
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
      address.city,
      address.state,
      address.zipCode
    ].every((field) => String(field || '').trim().length > 0) && /^\d{5}$/.test(address.zipCode || '');
  };

  const [isSandboxSession, setIsSandboxSession] = useState(false);

  const handleProviderSelect = (method) => {
    setSelectedProvider(method.provider);
    setSelectedBankName(method.name);
  };

  const handlePlaceOrder = async () => {
    try {
      if (!isAddressValid()) {
        setServerError('Completa tu dirección de envío (incluyendo un Código Postal válido de 5 dígitos).');
        return;
      }

      if (!selectedProvider) {
        setServerError('Selecciona un banco o método de transferencia para continuar.');
        return;
      }

      setIsSubmittingOrder(true);
      setServerError('');

      const generatedOrderId = `ORDER-${Date.now().toString().substring(5, 13)}`;

      const paymentSession = await paymentService.createPaymentSession({
        amount: totalPrice + shippingCost,
        items: cart.items,
        orderId: generatedOrderId,
        provider: selectedProvider
      });

      if (selectedProvider === 'stripe') {
        setStripeClientSecret(paymentSession.clientSecret);
        setIsSandboxSession(Boolean(paymentSession.isSandbox));
        setCreatedOrderId(generatedOrderId);
        setIsSubmittingOrder(false);
        return; // wait for user to interact with Stripe UI
      }

      // Bank Transfer Flow
      await paymentService.confirmPaymentSession({
        paymentSessionId: paymentSession.paymentSessionId,
        provider: selectedProvider
      });

      await createOrderInDB(generatedOrderId, 'bank_transfer', `${selectedProvider.toUpperCase()} - VALIDACIÓN MANUAL`);
    } catch (error) {
      console.error('Error al crear la orden:', error);
      setServerError(error.message || 'No fue posible registrar la orden. Intenta nuevamente.');
      setIsSubmittingOrder(false);
    }
  };

  const createOrderInDB = async (orderId, method, cardHolder) => {
    try {
      const orderData = {
        products: cart.items.map(item => ({
          productId: item.product?._id || item._id,
          quantity: item.quantity
        })),
        shippingAddress: {
          ...address,
          number: address.number || 'S/N',
          neighborhood: address.neighborhood || autoCompleteOptions?.neighborhoods?.[0] || 'N/D',
          country: address.country || 'México'
        },
        paymentInfo: {
          method: method,
          cardHolder: cardHolder
        }
      };

      await orderService.createOrder(orderData);
      await authService.updateSavedShippingAddress(address);
      setCreatedOrderId(orderId);
      clearCart();
      setOrderSuccess(true);
    } catch (error) {
      console.error('Error al registrar orden DB:', error);
      setServerError(error.message || 'Error al guardar la orden.');
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  const handleStripeSuccess = async (paymentIntent) => {
    setIsSubmittingOrder(true);
    const label = paymentIntent?.isSandbox ? 'STRIPE SANDBOX (TARJETA PRUEBA)' : 'STRIPE PAYMENT';
    await createOrderInDB(createdOrderId, 'credit_card', label);
  };

  if (orderSuccess) {
    const isStripePayment = selectedProvider === 'stripe';
    return (
      <div className="bg-page-content min-vh-100 pb-5">
        <AppNavbar />
        <Container className="py-5 mt-5">
          <div className="checkout-success-card auth-card border-0 fade-in-up">
            <BsCheckCircle className="status-icon-success" />
            <h2 className="fw-bold text-dark mb-3">
              {isStripePayment ? '¡Pago Confirmado y Pedido Registrado!' : '¡Pedido Registrado Exitosamente!'}
            </h2>
            <p className="text-secondary mb-4">
              {isStripePayment
                ? 'Tu pago con tarjeta ha sido procesado correctamente. Hemos recibido tu pedido y comenzará a prepararse para su envío.'
                : 'Tu pedido ha sido creado y el pago ha entrado en proceso de validación manual.'}
            </p>
            
            <div className="p-4 rounded-4 text-start bg-white bg-opacity-60 border border-white mb-4">
              {isStripePayment ? (
                <div>
                  <h5 className="fw-bold mb-3 text-primary">Resumen de la Transacción</h5>
                  <ul className="list-unstyled mb-0 d-grid gap-2 small text-dark">
                    <li><strong>No. de Orden:</strong> <code className="bg-light px-2 py-1 rounded text-primary fw-bold">{createdOrderId}</code></li>
                    <li><strong>Método de Pago:</strong> Tarjeta de Crédito / Débito (Procesado en Línea)</li>
                    <li><strong>Monto Total Pagado:</strong> ${(totalPrice + shippingCost).toLocaleString('es-MX')} MXN</li>
                    <li><strong>Estado de la Orden:</strong> <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-2 py-1">En Proceso / Preparación</span></li>
                  </ul>
                </div>
              ) : (
                <div>
                  <h5 className="fw-bold mb-3 text-primary">Instrucciones de Transferencia Bancaria</h5>
                  <p className="small text-secondary mb-3">
                    Para confirmar tu compra, realiza la transferencia electrónica SPEI utilizando la siguiente información bancaria:
                  </p>
                  <ul className="list-unstyled mb-0 d-grid gap-2 small text-dark">
                    <li><strong>Banco Destino:</strong> {selectedBankName}</li>
                    <li><strong>Titular de la Cuenta:</strong> GAZA TI E-COMMERCE S.A. DE C.V.</li>
                    <li><strong>CLABE Interbancaria:</strong> 0121 8000 1234 5678 90</li>
                    <li><strong>Monto a Transferir:</strong> ${(totalPrice + shippingCost).toLocaleString('es-MX')} MXN</li>
                    <li><strong>Concepto / Referencia de Pago:</strong> <code className="bg-light px-2 py-1 rounded text-primary fw-bold">{createdOrderId}</code></li>
                  </ul>
                  <div className="mt-3 p-3 rounded-3 bg-warning bg-opacity-10 border border-warning border-opacity-25 text-warning small">
                    <strong>Importante:</strong> Envía tu comprobante de pago con el número de orden a <strong>ventas@gaza.com</strong> o súbelo en la sección de tus pedidos en tu perfil para agilizar la entrega.
                  </div>
                </div>
              )}
            </div>

            <Button as={Link} to="/catalog" className="btn-primary-gaza py-2.5 px-4 mt-2">Volver al Catálogo</Button>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="bg-page-content pb-5 min-vh-100">
      <AppNavbar />
      
      <div className="checkout-header-area pt-5 pb-4 px-3" style={{ background: 'var(--surface-0)', borderBottom: '1px solid var(--border-color)' }}>
        <Container>
          <Link to="/cart" className="back-link">
            <BsArrowLeft /> Volver al Carrito
          </Link>
          <h1 className="checkout-title mt-2 mb-0">Checkout</h1>
        </Container>
      </div>

      <Container className="fade-in-up" style={{ animationDelay: '0.1s' }}>
        {serverError && (
          <Alert variant="danger" className="border-0 shadow-sm rounded-4 mb-4" onClose={() => setServerError('')} dismissible>
            {serverError}
          </Alert>
        )}

        <Row className="g-5">
          {/* Columna Izquierda */}
          <Col lg={7}>
            <Card className="auth-card border-0 mb-4 p-4 p-md-5">
              <div className="d-flex align-items-center mb-4">
                <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '40px', height: '40px' }}>
                  1
                </div>
                <h3 className="fw-bold mb-0 text-dark h4">Dirección de Envío</h3>
              </div>
              <AddressForm
                address={address}
                onChange={setAddress}
                errors={{}}
                zipLookupLoading={zipLookupLoading}
                zipLookupError={zipLookupError}
                zipLookupSuccess={zipLookupSuccess}
                autoCompleteOptions={autoCompleteOptions}
              />
            </Card>
            
            <Card className="auth-card border-0 p-4 p-md-5">
              <div className="d-flex align-items-center mb-4">
                <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '40px', height: '40px' }}>
                  2
                </div>
                <h3 className="fw-bold mb-0 text-dark h4">Método de Pago</h3>
              </div>
              {isLoadingPayment ? (
                  <div className="text-center py-5">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-3 text-secondary">Cargando opciones bancarias...</p>
                  </div>
                ) : (
                  <>
                    {paymentMethods.length === 0 ? (
                      <Alert variant="warning">
                        No hay métodos bancarios disponibles por el momento.
                      </Alert>
                    ) : (
                      <div>
                        <p className="text-secondary small mb-4">
                          Elige el banco de tu preferencia para generar referencia y dejar tu pedido en validación segura de fondos.
                        </p>

                        <div className="d-grid gap-2 mb-4">
                          {paymentMethods.map((method) => (
                            <div
                              key={method.id}
                              onClick={() => {
                                handleProviderSelect(method);
                                setStripeClientSecret(''); // reset stripe
                              }}
                              className={`payment-method-card p-3 d-flex align-items-center gap-3 ${selectedProvider === method.provider ? 'selected' : ''}`}
                              role="button"
                            >
                              <Form.Check 
                                type="radio"
                                id={`provider-${method.provider}`}
                                name="selectedProvider"
                                checked={selectedProvider === method.provider}
                                onChange={() => {
                                  handleProviderSelect(method);
                                  setStripeClientSecret('');
                                }}
                                className="m-0"
                              />
                              <div className="d-flex flex-column text-start">
                                <strong className="text-dark">{method.name}</strong>
                                <span className="text-secondary small">{method.description}</span>
                              </div>
                            </div>
                          ))}
                        </div>

                        {selectedProvider === 'stripe' && stripeClientSecret ? (
                          <Elements stripe={stripePromise} options={{ clientSecret: stripeClientSecret }}>
                            <StripePaymentForm 
                              amount={totalPrice + shippingCost} 
                              onPaymentSuccess={handleStripeSuccess} 
                              isProcessingParent={isSubmittingOrder}
                              isSandbox={isSandboxSession}
                            />
                          </Elements>
                        ) : (
                          <Button 
                            size="lg" 
                            className="w-100 fw-bold py-3 mt-3 btn-custom-primary rounded-3"
                            onClick={handlePlaceOrder}
                            disabled={cart.items.length === 0 || !isAddressValid() || !selectedProvider || isSubmittingOrder}
                          >
                            {isSubmittingOrder ? (
                              <>
                                <Spinner size="sm" className="me-2" animation="border" />
                                {selectedProvider === 'stripe' ? 'Preparando pago seguro...' : 'Registrando pedido...'}
                              </>
                            ) : (
                              <>
                                <BsShieldCheck className="me-2" /> 
                                {selectedProvider === 'stripe' ? 'Proceder al Pago Seguro' : 'Confirmar Pedido con Pago Bancario'}
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    )}
                  </>
                )}
            </Card>
          </Col>

          {/* Columna de Resumen Lateral */}
          <Col lg={5}>
            <div className="sticky-summary-box">
              <Card className="auth-card border-0 p-4 p-xl-5">
                <h4 className="fw-bold mb-4 text-dark h5">Resumen del Pedido</h4>
                
                <div className="summary-row">
                  <span>Subtotal ({totalItems} productos)</span>
                  <span className="text-dark fw-bold">${totalPrice.toLocaleString()}</span>
                </div>
                
                <div className="summary-row">
                  <span><BsTruck className="me-2" /> Envío</span>
                  <span className={shippingCost === 0 ? "free-shipping" : "text-dark fw-bold"}>
                    {shippingCost === 0 ? 'Gratis' : `$${shippingCost}`}
                  </span>
                </div>

                <hr className="summary-divider" />

                <div className="total-row">
                  <span className="total-label">TOTAL A PAGAR</span>
                  <span className="total-amount">${(totalPrice + shippingCost).toLocaleString()}</span>
                </div>

                <div className="security-note mt-3">
                  <BsShieldCheck className="text-success" size={18} />
                  <span>Flujo bancario con validación manual de seguridad</span>
                </div>
              </Card>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default Checkout;