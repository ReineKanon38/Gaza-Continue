import dotenv from 'dotenv';
import { logger } from '../utils/logger.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import Stripe from 'stripe';

dotenv.config();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

const PAYMENT_METHODS = [
  {
    id: 'stripe_card',
    provider: 'stripe',
    name: 'Tarjeta de Crédito / Débito',
    description: 'Pago seguro en línea vía Stripe',
    enabled: true,
    settlementWindowHours: 0,
    disputeRisk: 'medium'
  },
  {
    id: 'banamex_transfer',
    provider: 'banamex',
    name: 'Transferencia Banamex',
    description: 'Transferencia SPEI o interbancaria a cuenta empresarial Banamex',
    enabled: true,
    settlementWindowHours: 24,
    disputeRisk: 'low'
  },
  {
    id: 'santander_transfer',
    provider: 'santander',
    name: 'Transferencia Santander',
    description: 'Transferencia SPEI o interbancaria a cuenta empresarial Santander',
    enabled: true,
    settlementWindowHours: 24,
    disputeRisk: 'low'
  }
];

const getAllowedProviders = () => PAYMENT_METHODS.map((method) => method.provider);

const buildPaymentReference = () => `PAY-${Date.now()}-${Math.floor(Math.random() * 100000)}`;

export const createPaymentSession = async (req, res) => {
  try {
    const { amount, currency = 'mxn', orderId, items, provider } = req.body;
    const selectedProvider = String(provider || '').toLowerCase();
    const allowedProviders = getAllowedProviders();

    logger.debug('[payment] createPaymentSession payload', {
      amount,
      currency,
      orderId,
      provider: selectedProvider,
      itemCount: items?.length,
      userId: req.user?.sub || req.user?._id || 'guest'
    });

    if (!amount || amount <= 0) {
      return sendError(res, {
        status: 400,
        message: 'Monto inválido',
        error: 'Monto inválido'
      });
    }

    if (!selectedProvider || !allowedProviders.includes(selectedProvider)) {
      return sendError(res, {
        status: 400,
        message: `Proveedor de pago inválido. Disponibles: ${allowedProviders.join(', ')}`,
        error: 'Proveedor inválido'
      });
    }

    if (selectedProvider === 'stripe') {
      const stripeSecret = process.env.STRIPE_SECRET_KEY || '';
      const isRealStripeKey = stripeSecret.startsWith('sk_live_') || (stripeSecret.startsWith('sk_test_') && !stripeSecret.includes('placeholder'));

      if (!isRealStripeKey) {
        logger.info('[payment] Modo Sandbox de Stripe activado para pruebas');
        const mockSessionId = `pi_sandbox_${Date.now()}`;
        return sendSuccess(res, {
          status: 200,
          paymentSessionId: mockSessionId,
          clientSecret: `pi_sandbox_secret_${Date.now()}`,
          paymentStatus: 'requires_payment_method',
          provider: 'stripe',
          isSandbox: true
        });
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Stripe expects cents
        currency: currency.toLowerCase(),
        metadata: {
          orderId: orderId || 'N/A',
          userId: req.user?.sub || 'guest'
        }
      });

      return sendSuccess(res, {
        status: 200,
        paymentSessionId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        paymentStatus: 'requires_payment_method',
        provider: 'stripe',
        isSandbox: false
      });
    }

    const paymentSessionId = buildPaymentReference();
    const instructions = {
      provider: selectedProvider,
      amount,
      currency,
      orderId: orderId || 'N/A',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      verification: 'manual_review'
    };

    return sendSuccess(res, {
      status: 200,
      paymentSessionId,
      paymentStatus: 'pending_bank_validation',
      instructions
    });

  } catch (error) {
    logger.error('Error creando sesion de pago', { message: error.message });
    return sendError(res, {
      status: 500,
      message: 'Error al procesar el pago',
      error: error.message
    });
  }
};

export const confirmPayment = async (req, res) => {
  try {
    const { paymentSessionId, provider } = req.body;
    const selectedProvider = String(provider || '').toLowerCase();

    if (!paymentSessionId) {
      return sendError(res, {
        status: 400,
        message: 'paymentSessionId requerido',
        error: 'paymentSessionId requerido'
      });
    }

    if (!selectedProvider || !getAllowedProviders().includes(selectedProvider)) {
      return sendError(res, {
        status: 400,
        message: 'Proveedor bancario inválido',
        error: 'Proveedor bancario inválido'
      });
    }

    return sendSuccess(res, {
      status: 200,
      paymentSessionId,
      provider: selectedProvider,
      paymentStatus: 'pending_bank_review'
    });

  } catch (error) {
    logger.error('Error confirmando pago', { message: error.message });
    return sendError(res, {
      status: 500,
      message: 'Error al confirmar el pago',
      error: error.message
    });
  }
};

export const getPaymentMethods = async (req, res) => {
  try {
    return sendSuccess(res, {
      data: { methods: PAYMENT_METHODS },
      methods: PAYMENT_METHODS
    });
  } catch (error) {
    logger.error('Error obteniendo metodos de pago', { message: error.message });
    return sendError(res, {
      status: 500,
      message: 'Error obteniendo métodos de pago',
      error: error.message
    });
  }
};

export const stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test');
  } catch (err) {
    logger.error('Webhook signature verification failed', { error: err.message });
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      logger.info(`Stripe payment intent ${paymentIntent.id} succeeded for order ${paymentIntent.metadata.orderId}`);
      // Here you would typically update the Order status in the DB
      break;
    case 'payment_intent.payment_failed':
      logger.warn(`Stripe payment failed: ${event.data.object.id}`);
      break;
    default:
      logger.info(`Unhandled event type ${event.type}`);
  }

  res.send();
};

