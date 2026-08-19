import dotenv from 'dotenv';
import { logger } from '../utils/logger.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import Stripe from 'stripe';
import WebhookLog from '../models/WebhookLog.js';
import Order from '../models/Order.js';
import syscomService from '../services/syscomService.js';

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

import Product from '../models/Product.js';

export const createPaymentSession = async (req, res) => {
  try {
    const { amount: clientAmount, currency = 'mxn', orderId, items, provider } = req.body;
    const selectedProvider = String(provider || '').toLowerCase();
    const allowedProviders = getAllowedProviders();

    logger.debug('[payment] createPaymentSession payload', {
      clientAmount,
      currency,
      orderId,
      provider: selectedProvider,
      itemCount: items?.length,
      userId: req.user?.sub || req.user?._id || 'guest'
    });

    // 🛡️ REGLA DE SEGURIDAD: Nunca confiar en el amount enviado por el cliente.
    let secureAmount = 0;
    if (items && Array.isArray(items) && items.length > 0) {
      const mongoose = (await import('mongoose')).default;
      for (const item of items) {
        let id = item.productId || item._id || item.product;
        const qty = item.quantity || 1;
        
        // Handle virtual syscom products by syncing them on-the-fly
        if (String(id).startsWith('syscom-')) {
          const syscomId = String(id).replace('syscom-', '');
          try {
            const result = await syscomService.syncProduct(syscomId);
            if (result && result.product) {
              id = result.product._id;
            }
          } catch (error) {
            logger.warn(`Could not sync syscom product ${syscomId} on the fly for payment: ${error.message}`);
          }
        }

        if (id && mongoose.isValidObjectId(id)) {
          const product = await Product.findById(id);
          if (product && product.price) {
            secureAmount += product.price * qty;
          }
        }
      }
      
      // Aplicar misma regla de envío del frontend
      if (secureAmount > 0) {
        const shippingCost = secureAmount >= 2500 ? 0 : 185;
        secureAmount += shippingCost;
      }
    } else if (clientAmount && clientAmount > 0) {
      // Fallback estricto solo para tests o compatibilidad, idealmente debe removerse en producción pura.
      secureAmount = clientAmount; 
    }

    if (!secureAmount || secureAmount <= 0) {
      return sendError(res, {
        status: 400,
        message: 'Monto inválido o carrito vacío',
        error: 'Monto inválido'
      });
    }

    const amount = secureAmount;

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
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (webhookSecret && sig && webhookSecret !== 'whsec_test') {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } else {
      // Fallback para entornos de desarrollo/test local o mocks sin signature activa
      const rawBody = typeof req.body === 'string' || Buffer.isBuffer(req.body) 
        ? req.body.toString('utf-8') 
        : JSON.stringify(req.body);
      event = typeof rawBody === 'string' ? JSON.parse(rawBody) : req.body;
    }
  } catch (err) {
    logger.error('Webhook signature verification failed', { error: err.message });
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (!event || !event.id) {
    return res.status(400).json({ error: 'Evento invalido o ID faltante' });
  }

  // 🛡️ VERIFICACIÓN DE IDEMPOTENCIA
  try {
    const existingLog = await WebhookLog.findOne({ eventId: event.id });
    if (existingLog) {
      logger.info(`[Webhook] Evento duplicado ignorado (Idempotente): ${event.id}`);
      return res.status(200).json({ received: true, idempotent: true });
    }

    await WebhookLog.create({
      eventId: event.id,
      eventType: event.type || 'unknown',
      status: 'completed',
      payloadSummary: {
        id: event.id,
        type: event.type
      }
    });
  } catch (dbErr) {
    if (dbErr.code === 11000) {
      logger.info(`[Webhook] Evento duplicado por concurrencia ignorado: ${event.id}`);
      return res.status(200).json({ received: true, idempotent: true });
    }
    logger.error('Error registrando log de webhook en BD', { message: dbErr.message });
  }

  switch (event.type) {
    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object;
      logger.info(`Stripe payment intent ${paymentIntent.id} succeeded for order ${paymentIntent.metadata?.orderId}`);
      
      const orderId = paymentIntent.metadata?.orderId;
      if (orderId && orderId !== 'N/A') {
        const order = await Order.findById(orderId);
        if (order && order.paymentStatus !== 'approved') {
          order.paymentStatus = 'approved';
          if (order.status === 'pending') {
            order.status = 'processing';
          }
          await order.save();
          logger.info(`Orden ${orderId} actualizada a aprobada desde webhook Stripe`);
        }
      }
      break;
    }
    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object;
      logger.warn(`Stripe payment failed: ${paymentIntent.id}`);
      const orderId = paymentIntent.metadata?.orderId;
      if (orderId && orderId !== 'N/A') {
        const order = await Order.findById(orderId);
        if (order && order.paymentStatus !== 'approved') {
          order.paymentStatus = 'rejected';
          await order.save();
        }
      }
      break;
    }
    default:
      logger.info(`Unhandled event type ${event.type}`);
  }

  return res.status(200).json({ received: true });
};


