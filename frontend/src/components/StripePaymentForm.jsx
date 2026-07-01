import React, { useState } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button, Spinner, Alert } from 'react-bootstrap';
import { BsShieldCheck } from 'react-icons/bs';

const StripePaymentForm = ({ amount, onPaymentSuccess, isProcessingParent }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e) => {
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

  return (
    <form onSubmit={handleSubmit} className="mt-3">
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
            Procesando Pago...
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
