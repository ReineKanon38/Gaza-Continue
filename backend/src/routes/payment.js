import express from 'express';
import { createPaymentIntent, confirmPayment, getPaymentMethods } from '../controllers/paymentController.js';

const router = express.Router();

// Rutas de pago (acceso público para checkout)
router.post('/create-payment-intent', createPaymentIntent);
router.post('/confirm-payment', confirmPayment);
router.get('/methods', getPaymentMethods);

export default router;
