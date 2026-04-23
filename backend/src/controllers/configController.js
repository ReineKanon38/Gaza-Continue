import SystemConfig from '../models/SystemConfig.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { logger } from '../utils/logger.js';

const getOrCreateConfig = async () => {
  let config = await SystemConfig.findOne({ key: 'default' });
  if (!config) {
    config = await SystemConfig.create({ key: 'default' });
  }
  return config;
};

export const getSystemConfig = async (req, res) => {
  try {
    const config = await getOrCreateConfig();
    return sendSuccess(res, { data: config });
  } catch (error) {
    logger.error('Error obteniendo configuracion del sistema', { message: error.message });
    return sendError(res, {
      status: 500,
      message: 'Error al obtener la configuracion del sistema',
      error: error.message
    });
  }
};

export const updatePaymentMethods = async (req, res) => {
  try {
    const payload = req.validated || req.body;
    const config = await getOrCreateConfig();

    config.paymentMethods = {
      ...config.paymentMethods.toObject(),
      ...payload
    };
    config.updatedBy = req.user?.sub;

    await config.save();

    return sendSuccess(res, {
      message: 'Metodos de pago actualizados correctamente',
      data: config
    });
  } catch (error) {
    logger.error('Error actualizando metodos de pago', { message: error.message });
    return sendError(res, {
      status: 500,
      message: 'Error al actualizar metodos de pago',
      error: error.message
    });
  }
};

export const updateShippingMethods = async (req, res) => {
  try {
    const { shippingMethods } = req.validated || req.body;

    if (!Array.isArray(shippingMethods) || shippingMethods.length === 0) {
      return sendError(res, {
        status: 400,
        message: 'shippingMethods debe ser un arreglo con al menos un metodo'
      });
    }

    const config = await getOrCreateConfig();
    config.shippingMethods = shippingMethods;
    config.updatedBy = req.user?.sub;

    await config.save();

    return sendSuccess(res, {
      message: 'Metodos de envio actualizados correctamente',
      data: config
    });
  } catch (error) {
    logger.error('Error actualizando metodos de envio', { message: error.message });
    return sendError(res, {
      status: 500,
      message: 'Error al actualizar metodos de envio',
      error: error.message
    });
  }
};
