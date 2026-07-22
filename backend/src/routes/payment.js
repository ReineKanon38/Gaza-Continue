import express from 'express';
import { createPaymentSession, confirmPayment, getPaymentMethods, stripeWebhook } from '../controllers/paymentController.js';

const router = express.Router();

// Webhook route (Stripe sends raw JSON body)
router.post('/webhook', express.raw({ type: 'application/json' }), stripeWebhook);

// Rutas de pago (acceso público para checkout)
router.post('/create-session', createPaymentSession);
router.post('/confirm-payment', confirmPayment);
router.get('/methods', getPaymentMethods);

export default router;
