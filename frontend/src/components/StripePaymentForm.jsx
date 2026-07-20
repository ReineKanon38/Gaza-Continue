import React, { useState } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button, Spinner, Alert, Form, Badge, Card } from 'react-bootstrap';
import { BsShieldCheck, BsCreditCard2Front, BsExclamationTriangle } from 'react-icons/bs';

const StripePaymentForm = ({ amount, onPaymentSuccess, isProcessingParent, isSandbox = false }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Estados para modo Sandbox
  const [selectedTestCard, setSelectedTestCard] = useState('4242424242424242');
  const [cardHolder, setCardHolder] = useState('Usuario de Prueba Gaza');
  const [expiry, setExpiry] = useState('12/28');
  const [cvc, setCvc] = useState('123');

  const handleSandboxSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setError(null);

    await new Promise((resolve) => setTimeout(resolve, 1200));

    if (selectedTestCard === '4000000000000002') {
      setError('La tarjeta de prueba seleccionada fue declinada (Fondos Insuficientes / Simulación de Error).');
      setIsProcessing(false);
      return;
    }

    onPaymentSuccess({
      id: `pi_sandbox_${Date.now()}`,
      status: 'succeeded',
      provider: 'stripe',
      isSandbox: true
    });
  };

  const handleRealSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setError(submitError.message);
      setIsProcessing(false);
      return;
    }

    const { error: paymentError, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    });

    if (paymentError) {
      setError(paymentError.message);
      setIsProcessing(false);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      onPaymentSuccess(paymentIntent);
    } else {
      setError('Algo salió mal con el pago. Por favor intenta nuevamente.');
      setIsProcessing(false);
    }
  };

  if (isSandbox || !stripe || !elements) {
    return (
      <Card className="border border-warning border-opacity-50 shadow-sm mt-3 bg-light bg-opacity-25 rounded-4">
        <Card.Body className="p-4">
          <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
            <div className="d-flex align-items-center gap-2">
              <BsCreditCard2Front className="fs-4 text-warning" />
              <h6 className="fw-bold mb-0 text-dark">Pasarela de Pago con Tarjeta</h6>
            </div>
            <Badge bg="warning" text="dark" className="px-2.5 py-1.5 rounded-pill fw-semibold">
              🧪 MODO SANDBOX DE PRUEBA
            </Badge>
          </div>

          <p className="small text-secondary mb-3">
            Estás usando el simulador Sandbox para verificar el flujo de cobros sin llaves reales de Stripe.
          </p>

          {error && (
            <Alert variant="danger" className="py-2.5 px-3 small rounded-3 mb-3 d-flex align-items-center gap-2">
              <BsExclamationTriangle className="fs-5 flex-shrink-0" />
              <div>{error}</div>
            </Alert>
          )}

          <Form onSubmit={handleSandboxSubmit}>
            <Form.Group className="mb-3">
              <Form.Label className="small fw-semibold text-secondary">Seleccionar Tarjeta de Prueba</Form.Label>
              <Form.Select
                value={selectedTestCard}
                onChange={(e) => setSelectedTestCard(e.target.value)}
                className="form-control-gaza small"
                disabled={isProcessing || isProcessingParent}
              >
                <option value="4242424242424242">💳 4242 •••• •••• 4242 (Visa - Pago Exitoso)</option>
                <option value="4000000000000002">💳 4000 •••• •••• 0002 (Visa - Declinada por Fondos Insuficientes)</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="small fw-semibold text-secondary">Titular de la Tarjeta</Form.Label>
              <Form.Control
                type="text"
                value={cardHolder}
                onChange={(e) => setCardHolder(e.target.value)}
                placeholder="Nombre del titular"
                className="form-control-gaza small"
                disabled={isProcessing || isProcessingParent}
              />
            </Form.Group>

            <div className="row g-2 mb-3">
              <div className="col-7">
                <Form.Label className="small fw-semibold text-secondary">Fecha Exp.</Form.Label>
                <Form.Control
                  type="text"
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                  placeholder="MM/AA"
                  className="form-control-gaza small text-center"
                  disabled={isProcessing || isProcessingParent}
                />
              </div>
              <div className="col-5">
                <Form.Label className="small fw-semibold text-secondary">CVC / CVC2</Form.Label>
                <Form.Control
                  type="text"
                  value={cvc}
                  onChange={(e) => setCvc(e.target.value)}
                  placeholder="123"
                  className="form-control-gaza small text-center"
                  disabled={isProcessing || isProcessingParent}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-100 py-3 fw-bold btn-primary-gaza mt-2"
              disabled={isProcessing || isProcessingParent}
            >
              {isProcessing || isProcessingParent ? (
                <>
                  <Spinner size="sm" className="me-2" animation="border" />
                  Simulando Procesamiento de Pago...
                </>
              ) : (
                <>
                  <BsShieldCheck className="me-2 fs-5" /> Simular Pago de ${amount.toLocaleString('es-MX')} MXN
                </>
              )}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    );
  }

  return (
    <form onSubmit={handleRealSubmit} className="mt-3">
      <PaymentElement />
      {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
      <Button
        type="submit"
        className="w-100 py-3 fw-bold btn-primary-gaza mt-4"
        disabled={!stripe || isProcessing || isProcessingParent}
      >
        {isProcessing || isProcessingParent ? (
          <>
            <Spinner size="sm" className="me-2" animation="border" />
            Procesando Pago Seguro...
          </>
        ) : (
          <>
            <BsShieldCheck className="me-2" /> Pagar ${amount.toLocaleString('es-MX')} MXN
          </>
        )}
      </Button>
    </form>
  );
};

export default StripePaymentForm;
