import Coupon from '../models/Coupon.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

// Obtener todos los cupones
export const getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find()
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    return sendSuccess(res, { data: coupons });
  } catch (error) {
    return sendError(res, {
      status: 500,
      message: 'Error al obtener cupones',
      error: error.message
    });
  }
};

// Obtener cupón por código (validar)
export const validateCoupon = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return sendError(res, { status: 400, message: 'El código del cupón es requerido' });
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    if (!coupon) {
      return sendError(res, { status: 404, message: 'Cupón no encontrado' });
    }

    // Verificar si es válido
    if (!coupon.isValid()) {
      return sendError(res, { status: 400, message: 'Este cupón no es válido o ha expirado' });
    }

    return sendSuccess(res, {
      data: coupon,
      message: 'Cupón válido'
    });
  } catch (error) {
    return sendError(res, {
      status: 500,
      message: 'Error al validar cupón',
      error: error.message
    });
  }
};

// Crear nuevo cupón
export const createCoupon = async (req, res) => {
  try {
    const { code, description, type, discount, maxUses, minOrderAmount, expiryDate } = req.body;

    // Validaciones
    if (!code || !type || !discount || !maxUses || !expiryDate) {
      return sendError(res, {
        status: 400,
        message: 'Faltan campos requeridos (code, type, discount, maxUses, expiryDate)'
      });
    }

    if (!['percentage', 'fixed'].includes(type)) {
      return sendError(res, { status: 400, message: 'El tipo debe ser "percentage" o "fixed"' });
    }

    // Verificar si ya existe
    const existing = await Coupon.findOne({ code: code.toUpperCase() });
    if (existing) {
      return sendError(res, { status: 400, message: 'Ya existe un cupón con este código' });
    }

    const coupon = new Coupon({
      code: code.toUpperCase(),
      description: description || '',
      type,
      discount,
      maxUses,
      minOrderAmount: minOrderAmount || 0,
      expiryDate,
      active: true,
      createdBy: req.user?._id
    });

    await coupon.save();
    return sendSuccess(res, {
      status: 201,
      data: coupon,
      message: 'Cupón creado exitosamente'
    });
  } catch (error) {
    return sendError(res, {
      status: 500,
      message: 'Error al crear cupón',
      error: error.message
    });
  }
};

// Actualizar cupón
export const updateCoupon = async (req, res) => {
  try {
    const { description, discount, maxUses, minOrderAmount, expiryDate, active } = req.body;

    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return sendError(res, { status: 404, message: 'Cupón no encontrado' });
    }

    // No permitir cambiar código
    if (description !== undefined) coupon.description = description;
    if (discount !== undefined) coupon.discount = discount;
    if (maxUses !== undefined) coupon.maxUses = maxUses;
    if (minOrderAmount !== undefined) coupon.minOrderAmount = minOrderAmount;
    if (expiryDate !== undefined) coupon.expiryDate = expiryDate;
    if (active !== undefined) coupon.active = active;

    await coupon.save();
    return sendSuccess(res, {
      data: coupon,
      message: 'Cupón actualizado exitosamente'
    });
  } catch (error) {
    return sendError(res, {
      status: 500,
      message: 'Error al actualizar cupón',
      error: error.message
    });
  }
};

// Eliminar cupón
export const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) {
      return sendError(res, { status: 404, message: 'Cupón no encontrado' });
    }
    return sendSuccess(res, { message: 'Cupón eliminado exitosamente' });
  } catch (error) {
    return sendError(res, {
      status: 500,
      message: 'Error al eliminar cupón',
      error: error.message
    });
  }
};

// Aplicar cupón a una orden (incrementa contador de uso)
export const applyCoupon = async (req, res) => {
  try {
    const { code, orderAmount } = req.body;

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (!coupon) {
      return sendError(res, { status: 404, message: 'Cupón no encontrado' });
    }

    if (!coupon.isValid()) {
      return sendError(res, { status: 400, message: 'Este cupón no es válido o ha expirado' });
    }

    if (orderAmount < coupon.minOrderAmount) {
      return sendError(res, { status: 400, message: `Monto mínimo requerido: $${coupon.minOrderAmount}` });
    }

    // Calcular descuento
    let discountAmount = 0;
    if (coupon.type === 'percentage') {
      discountAmount = (orderAmount * coupon.discount) / 100;
    } else {
      discountAmount = coupon.discount;
    }

    // Incrementar uso
    await coupon.incrementUsage();

    return sendSuccess(res, {
      data: {
        coupon,
        discountAmount,
        discountType: coupon.type,
        finalAmount: orderAmount - discountAmount
      },
      message: 'Cupón aplicado exitosamente'
    });
  } catch (error) {
    return sendError(res, {
      status: 500,
      message: 'Error al aplicar cupón',
      error: error.message
    });
  }
};
