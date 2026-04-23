import dotenv from 'dotenv';
import { logger } from '../utils/logger.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

dotenv.config();

const PAYMENT_METHODS = [
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
        message: `Proveedor bancario inválido. Disponibles: ${allowedProviders.join(', ')}`,
        error: 'Proveedor bancario inválido'
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
      paymentSessionId,
      status: 'pending_bank_validation',
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
      paymentSessionId,
      provider: selectedProvider,
      status: 'pending_bank_review'
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

