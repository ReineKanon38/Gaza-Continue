import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { logger } from '../utils/logger.js';
import syscomService from '../services/syscomService.js';
import { sendShippingEmail } from '../services/emailService.js';

const ORDER_STATUS_TRANSITIONS = {
  pending: ['processing', 'cancelled'],
  processing: ['completed', 'cancelled'],
  completed: [],
  cancelled: []
};

const canTransitionOrderStatus = (currentStatus, nextStatus) => {
  if (currentStatus === nextStatus) return true;
  return ORDER_STATUS_TRANSITIONS[currentStatus]?.includes(nextStatus) || false;
};

const getTrackingStageByOrderStatus = (order) => {
  if (order.status === 'cancelled') return 'cancelled';
  if (order.status === 'completed') return 'delivered';
  if (order.status === 'processing' && order.trackingNumber) return 'in_transit';
  if (order.status === 'processing') return 'intermediary_processing';
  return 'supplier_received';
};

const trackingStageLabel = {
  supplier_received: 'Proveedor recibió el pedido',
  intermediary_processing: 'GAZA está preparando tu pedido',
  in_transit: 'Tu pedido va en camino',
  delivered: 'Pedido entregado',
  cancelled: 'Pedido cancelado'
};

const updateOrderTrackingStage = (order) => {
  const nextStage = getTrackingStageByOrderStatus(order);
  const currentStage = order.fulfillmentTracking?.stage;

  if (nextStage !== currentStage) {
    order.fulfillmentTracking = {
      supplier: order.fulfillmentTracking?.supplier || order.supplierName || 'SYSCOM',
      intermediary: order.fulfillmentTracking?.intermediary || order.intermediaryName || 'GAZA',
      finalCustomer: order.fulfillmentTracking?.finalCustomer || order.customerName,
      stage: nextStage,
      history: [
        ...(order.fulfillmentTracking?.history || []),
        {
          stage: nextStage,
          message: trackingStageLabel[nextStage] || 'Actualizacion de estado de pedido',
          timestamp: new Date()
        }
      ]
    };
  }
};

// Crear una nueva orden
export const createOrder = async (req, res) => {
  const session = await mongoose.startSession();
  let inTx = false;

  // Detect if MongoDB instance supports transactions (ReplicaSet or Sharded Cluster)
  const topologyType = mongoose.connection.client?.topology?.description?.type;
  const supportsTransactions = topologyType && topologyType !== 'Single' && topologyType !== 'Unknown';

  if (supportsTransactions) {
    try {
      session.startTransaction();
      inTx = true;
    } catch (e) {
      inTx = false;
    }
  }

  const sessionOpts = inTx ? { session } : {};

  try {
    const { products, shippingAddress, paymentInfo } = req.body;
    const userId = req.user.sub;

    if (!products || !Array.isArray(products) || products.length === 0) {
      if (inTx && session.inTransaction()) await session.abortTransaction();
      await session.endSession();
      return sendError(res, {
        status: 400,
        message: 'Los productos son requeridos y deben ser un array valido'
      });
    }

    if (!shippingAddress || !shippingAddress.street || !shippingAddress.city || !shippingAddress.state || !shippingAddress.zipCode) {
      if (inTx && session.inTransaction()) await session.abortTransaction();
      await session.endSession();
      return sendError(res, { status: 400, message: 'Direccion de envio incompleta' });
    }

    const normalizedShippingAddress = {
      ...shippingAddress,
      number: shippingAddress.number || 'S/N',
      neighborhood: shippingAddress.neighborhood || 'N/D',
      country: shippingAddress.country || 'México'
    };

    if (!paymentInfo || !paymentInfo.method) {
      if (inTx && session.inTransaction()) await session.abortTransaction();
      await session.endSession();
      return sendError(res, { status: 400, message: 'Informacion de pago requerida' });
    }

    const user = await User.findById(userId, null, sessionOpts);
    if (!user) {
      if (inTx && session.inTransaction()) await session.abortTransaction();
      await session.endSession();
      return sendError(res, { status: 404, message: 'Usuario no encontrado' });
    }

    let subtotal = 0;
    const orderItems = [];

    for (const item of products) {
      let { productId, quantity } = item;

      if (!quantity || quantity <= 0) {
        if (inTx && session.inTransaction()) await session.abortTransaction();
        await session.endSession();
        return sendError(res, { status: 400, message: 'La cantidad debe ser mayor a 0' });
      }
      
      let product = null;
      // Handle virtual syscom products by syncing them on-the-fly
      if (String(productId).startsWith('syscom-')) {
        const syscomId = String(productId).replace('syscom-', '');
        try {
          const result = await syscomService.syncProduct(syscomId);
          if (result && result.product) {
            productId = result.product._id;
          }
        } catch (error) {
          logger.warn(`Could not sync syscom product ${syscomId} on the fly: ${error.message}`);
        }

        // Si falló la sincronización y sigue siendo 'syscom-', rechazar orden para evitar CastError
        if (String(productId).startsWith('syscom-')) {
          if (inTx && session.inTransaction()) await session.abortTransaction();
          await session.endSession();
          return sendError(res, { status: 400, message: `El producto con ID ${syscomId} no está disponible actualmente.` });
        }
      }

      // Decrement stock ATOMICALLY using findOneAndUpdate with condition { stock: { $gte: quantity } }
      // This prevents race conditions where two concurrent requests read stock before either decrements it.
      product = await Product.findOneAndUpdate(
        { _id: productId, stock: { $gte: quantity }, active: { $ne: false } },
        { $inc: { stock: -quantity } },
        { new: true, ...sessionOpts }
      );

      if (!product) {
        // Find if product exists at all to give accurate error message
        const existingProd = await Product.findById(productId);
        if (inTx && session.inTransaction()) await session.abortTransaction();
        await session.endSession();

        if (!existingProd) {
          return sendError(res, {
            status: 404,
            message: `Producto con ID ${item.productId} no encontrado`
          });
        }

        return sendError(res, {
          status: 400,
          message: `Stock insuficiente para ${existingProd.name}. Disponible: ${existingProd.stock}, Solicitado: ${quantity}`
        });
      }

      orderItems.push({
        product: productId,
        quantity,
        price: product.price
      });

      subtotal += product.price * quantity;
    }

    const tax = Math.round(subtotal * 0.16 * 100) / 100;
    const shippingCost = (subtotal + tax) >= 2499 ? 0 : 185;
    const total = Math.round((subtotal + tax + shippingCost) * 100) / 100;

    const requiresManualPaymentValidation = paymentInfo.method === 'bank_transfer';

    const orderDoc = new Order({
      orderId: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      user: userId,
      customerName: user.name,
      customerEmail: user.email,
      orderBrand: 'GAZA',
      supplierName: 'SYSCOM',
      intermediaryName: 'GAZA',
      products: orderItems,
      subtotal,
      tax,
      shippingCost,
      total,
      shippingAddress: normalizedShippingAddress,
      paymentInfo: {
        ...paymentInfo,
        method: paymentInfo.method,
        cardType: paymentInfo.cardType,
        cardLastFour: paymentInfo.cardLastFour || '0000',
        cardHolder: paymentInfo.cardHolder || user.name || 'Cliente'
      },
      paymentStatus: requiresManualPaymentValidation ? 'pending_validation' : 'approved',
      status: requiresManualPaymentValidation ? 'pending' : 'processing',
      fulfillmentTracking: {
        supplier: 'SYSCOM',
        intermediary: 'GAZA',
        finalCustomer: user.name,
        stage: 'supplier_received',
        history: [{
          stage: 'supplier_received',
          message: 'Proveedor recibió el pedido para procesamiento',
          timestamp: new Date()
        }]
      }
    });

    await orderDoc.save(sessionOpts);

    user.savedShippingAddress = {
      ...user.savedShippingAddress,
      ...normalizedShippingAddress,
      country: normalizedShippingAddress.country || user.savedShippingAddress?.country || 'México'
    };
    await user.save(sessionOpts);

    if (inTx && session.inTransaction()) {
      await session.commitTransaction();
    }
    await session.endSession();

    const populatedOrder = await Order.findById(orderDoc._id).populate('products.product', 'name price');

    return sendSuccess(res, {
      status: 201,
      message: 'Orden creada exitosamente',
      data: populatedOrder
    });
  } catch (err) {
    if (inTx && session.inTransaction()) {
      await session.abortTransaction();
    }
    await session.endSession();

    logger.error('Error creando orden', { message: err.message });
    return sendError(res, {
      status: 500,
      message: 'Error interno del servidor',
      error: err.message
    });
  }
};

// Obtener todas las ordenes del usuario
export const getUserOrders = async (req, res) => {
  try {
    const userId = req.user.sub;
    const { status, page = 1, limit = 10 } = req.query;

    const filter = { user: userId };
    if (status) {
      filter.status = status;
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const orders = await Order.find(filter)
      .populate('products.product', 'name price image')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const totalOrders = await Order.countDocuments(filter);

    return sendSuccess(res, {
      data: orders,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalOrders,
        pages: Math.ceil(totalOrders / limitNum)
      }
    });
  } catch (err) {
    logger.error('Error obteniendo ordenes de usuario', { message: err.message });
    return sendError(res, {
      status: 500,
      message: 'Error al obtener las ordenes',
      error: err.message
    });
  }
};

// Obtener una orden especifica por ID
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.sub;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, { status: 400, message: 'ID de orden invalido' });
    }

    const filter = req.user.role === 'admin' ? { _id: id } : { _id: id, user: userId };

    const order = await Order.findOne(filter)
      .populate('products.product', 'name price image description')
      .populate('user', 'name email');

    if (!order) {
      return sendError(res, { status: 404, message: 'Orden no encontrada' });
    }

    return sendSuccess(res, { data: order });
  } catch (err) {
    logger.error('Error obteniendo orden por ID', { message: err.message });
    return sendError(res, {
      status: 500,
      message: 'Error al obtener la orden',
      error: err.message
    });
  }
};

// Actualizar estado de una orden (solo admin)
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, { status: 400, message: 'ID de orden invalido' });
    }

    const validStatuses = ['pending', 'processing', 'completed', 'cancelled'];
    if (!status || !validStatuses.includes(status)) {
      return sendError(res, {
        status: 400,
        message: `Estado invalido. Estados validos: ${validStatuses.join(', ')}`
      });
    }

    const order = await Order.findById(id);
    if (!order) {
      return sendError(res, { status: 404, message: 'Orden no encontrada' });
    }

    if (!canTransitionOrderStatus(order.status, status)) {
      return sendError(res, {
        status: 409,
        message: `Transicion invalida de estado: ${order.status} -> ${status}`
      });
    }

    if ((status === 'processing' || status === 'completed') && order.paymentStatus !== 'approved') {
      return sendError(res, {
        status: 409,
        message: 'No se puede avanzar la orden sin validacion de pago aprobada'
      });
    }

    if (status === 'cancelled' && order.status !== 'cancelled') {
      for (const item of order.products) {
        await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
      }
    }

    order.status = status;
    if (notes) {
      order.notes = notes;
    }
    updateOrderTrackingStage(order);
    await order.save();

    const updatedOrder = await Order.findById(id).populate('products.product', 'name price');

    return sendSuccess(res, {
      message: 'Estado de orden actualizado exitosamente',
      data: updatedOrder
    });
  } catch (err) {
    logger.error('Error actualizando estado de orden', { message: err.message });
    return sendError(res, {
      status: 500,
      message: 'Error al actualizar el estado de la orden',
      error: err.message
    });
  }
};

// Obtener todas las ordenes (solo admin)
export const getAllOrders = async (req, res) => {
  try {
    const { status, paymentStatus, page = 1, limit = 20, search, startDate, endDate, sortBy = 'createdAt', sortOrder = -1 } = req.query;

    const filter = { isDeleted: { $ne: true } };

    if (status) {
      filter.status = status;
    }

    if (paymentStatus) {
      filter.paymentStatus = paymentStatus;
    }

    if (search) {
      filter.$or = [
        { customerName: { $regex: search, $options: 'i' } },
        { customerEmail: { $regex: search, $options: 'i' } },
        { orderId: { $regex: search, $options: 'i' } }
      ];
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;
    const sortObj = { [sortBy]: parseInt(sortOrder, 10) };

    const orders = await Order.find(filter)
      .populate('user', 'name email phone')
      .populate('products.product', 'name price')
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum);

    const totalOrders = await Order.countDocuments(filter);

    return sendSuccess(res, {
      data: orders,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalOrders,
        pages: Math.ceil(totalOrders / limitNum)
      }
    });
  } catch (err) {
    logger.error('Error obteniendo todas las ordenes', { message: err.message });
    return sendError(res, {
      status: 500,
      message: 'Error al obtener las ordenes',
      error: err.message
    });
  }
};

// Actualizar orden completa (admin)
export const updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, trackingNumber, notes, shippingAddress, paymentStatus } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, { status: 400, message: 'ID de orden invalido' });
    }

    const order = await Order.findById(id);
    if (!order) {
      return sendError(res, { status: 404, message: 'Orden no encontrada' });
    }

    if (status) {
      const validStatuses = ['pending', 'processing', 'completed', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return sendError(res, {
          status: 400,
          message: `Estado invalido. Estados validos: ${validStatuses.join(', ')}`
        });
      }

      if (!canTransitionOrderStatus(order.status, status)) {
        return sendError(res, {
          status: 409,
          message: `Transicion invalida de estado: ${order.status} -> ${status}`
        });
      }

      if ((status === 'processing' || status === 'completed') && order.paymentStatus !== 'approved') {
        return sendError(res, {
          status: 409,
          message: 'No se puede avanzar la orden sin validacion de pago aprobada'
        });
      }

      if (status === 'cancelled' && order.status !== 'cancelled') {
        for (const item of order.products) {
          await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
        }
      }

      order.status = status;
    }

    if (paymentStatus) {
      const validPaymentStatuses = ['pending_validation', 'approved', 'rejected'];
      if (!validPaymentStatuses.includes(paymentStatus)) {
        return sendError(res, {
          status: 400,
          message: `Estado de pago invalido. Estados validos: ${validPaymentStatuses.join(', ')}`
        });
      }
      order.paymentStatus = paymentStatus;
    }

    if (trackingNumber) {
      order.trackingNumber = trackingNumber;
    }

    if (notes) {
      order.notes = notes;
    }

    if (shippingAddress) {
      order.shippingAddress = { ...order.shippingAddress, ...shippingAddress };
    }

    updateOrderTrackingStage(order);

    await order.save();

    const updatedOrder = await Order.findById(id)
      .populate('user', 'name email')
      .populate('products.product', 'name price');

    return sendSuccess(res, {
      message: 'Orden actualizada exitosamente',
      data: updatedOrder
    });
  } catch (err) {
    logger.error('Error actualizando orden completa', { message: err.message });
    return sendError(res, {
      status: 500,
      message: 'Error al actualizar la orden',
      error: err.message
    });
  }
};

// Eliminar orden (soft delete)
export const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, { status: 400, message: 'ID de orden invalido' });
    }

    const order = await Order.findById(id);
    if (!order) {
      return sendError(res, { status: 404, message: 'Orden no encontrada' });
    }

    order.isDeleted = true;
    await order.save();

    return sendSuccess(res, { message: 'Orden eliminada exitosamente' });
  } catch (err) {
    logger.error('Error eliminando orden', { message: err.message });
    return sendError(res, {
      status: 500,
      message: 'Error al eliminar la orden',
      error: err.message
    });
  }
};

// Obtener estadisticas de ordenes (admin)
export const getOrderStats = async (req, res) => {
  try {
    const filter = { isDeleted: { $ne: true } };
    const statuses = ['pending', 'processing', 'completed', 'cancelled'];
    const statusCounts = {};

    for (const status of statuses) {
      statusCounts[status] = await Order.countDocuments({ ...filter, status });
    }

    const totalOrders = await Order.countDocuments(filter);
    const pendingPaymentValidations = await Order.countDocuments({ ...filter, paymentStatus: 'pending_validation' });
    const approvedPayments = await Order.countDocuments({ ...filter, paymentStatus: 'approved' });
    const rejectedPayments = await Order.countDocuments({ ...filter, paymentStatus: 'rejected' });

    const totalRevenue = await Order.aggregate([
      { $match: filter },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);

    const avgOrderValue = await Order.aggregate([
      { $match: filter },
      { $group: { _id: null, avg: { $avg: '$total' } } }
    ]);

    return sendSuccess(res, {
      data: {
        totalOrders,
        pendingOrders: statusCounts.pending,
        processingOrders: statusCounts.processing,
        completedOrders: statusCounts.completed,
        cancelledOrders: statusCounts.cancelled,
        pendingPaymentValidations,
        approvedPayments,
        rejectedPayments,
        totalRevenue: totalRevenue[0]?.total || 0,
        averageOrderValue: avgOrderValue[0]?.avg || 0
      }
    });
  } catch (err) {
    logger.error('Error obteniendo estadisticas de ordenes', { message: err.message });
    return sendError(res, { status: 500, message: 'Error al obtener estadisticas', error: err.message });
  }
};

// ----------------------------------------------------------------------
// ENDPOINTS LOGÍSTICOS EXPLÍCITOS (TWO-HOP FULFILLMENT)
// ----------------------------------------------------------------------

export const markArrivedAtBodega = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);

    if (!order) return sendError(res, { status: 404, message: 'Orden no encontrada' });
    
    // Status progresses to processing
    order.status = 'processing';
    order.fulfillmentTracking.stage = 'intermediary_processing';
    order.fulfillmentTracking.history.push({
      stage: 'intermediary_processing',
      message: 'GAZA ha recibido tu pedido y lo está preparando',
      timestamp: new Date()
    });

    await order.save();
    return sendSuccess(res, { message: 'Orden marcada como recibida en bodega GAZA', data: order });
  } catch (err) {
    logger.error('Error en markArrivedAtBodega', { message: err.message });
    return sendError(res, { status: 500, message: 'Error interno' });
  }
};

export const markShippedToCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const { trackingNumber } = req.body;
    
    if (!trackingNumber) {
      return sendError(res, { status: 400, message: 'Se requiere un trackingNumber para enviar al cliente' });
    }

    const order = await Order.findById(id).populate('user', 'name email');
    if (!order) return sendError(res, { status: 404, message: 'Orden no encontrada' });
    
    order.status = 'processing';
    order.trackingNumber = trackingNumber;
    order.fulfillmentTracking.stage = 'in_transit';
    order.fulfillmentTracking.history.push({
      stage: 'in_transit',
      message: `Tu pedido va en camino. Guía: ${trackingNumber}`,
      timestamp: new Date()
    });

    await order.save();
    
    // Enviar correo de notificación
    if (order.user && order.user.email) {
      await sendShippingEmail(order.user.email, order.user.name, order.orderId, trackingNumber);
    } else {
      await sendShippingEmail(order.customerEmail, order.customerName, order.orderId, trackingNumber);
    }

    return sendSuccess(res, { message: 'Orden marcada como enviada. Correo de notificación enviado.', data: order });
  } catch (err) {
    logger.error('Error en markShippedToCustomer', { message: err.message });
    return sendError(res, { status: 500, message: 'Error interno' });
  }
};

export const markDelivered = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);

    if (!order) return sendError(res, { status: 404, message: 'Orden no encontrada' });
    
    order.status = 'completed';
    order.fulfillmentTracking.stage = 'delivered';
    order.fulfillmentTracking.history.push({
      stage: 'delivered',
      message: 'El paquete ha sido entregado exitosamente',
      timestamp: new Date()
    });

    await order.save();
    return sendSuccess(res, { message: 'Orden marcada como entregada', data: order });
  } catch (err) {
    logger.error('Error en markDelivered', { message: err.message });
    return sendError(res, { status: 500, message: 'Error interno' });
  }
};

// Aprobar pago de orden (admin)
export const approveOrderPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { reference, notes } = req.body;
    const adminId = req.user?.sub;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, { status: 400, message: 'ID de orden invalido' });
    }

    const order = await Order.findById(id);
    if (!order) {
      return sendError(res, { status: 404, message: 'Orden no encontrada' });
    }

    if (order.status === 'cancelled') {
      return sendError(res, { status: 409, message: 'No se puede aprobar pago de una orden cancelada' });
    }

    if (order.paymentStatus === 'approved') {
      return sendError(res, { status: 409, message: 'El pago de esta orden ya fue aprobado' });
    }

    order.paymentStatus = 'approved';
    order.paymentValidation = {
      ...order.paymentValidation,
      approvedBy: adminId,
      approvedAt: new Date(),
      reference: reference || order.paymentValidation?.reference,
      notes: notes || order.paymentValidation?.notes,
      rejectionReason: undefined
    };

    // Al aprobar pago, la orden avanza automaticamente a procesamiento si estaba pendiente.
    if (order.status === 'pending') {
      order.status = 'processing';
    }

    updateOrderTrackingStage(order);

    await order.save();

    const updatedOrder = await Order.findById(id)
      .populate('products.product', 'name price')
      .populate('paymentValidation.approvedBy', 'name email');

    return sendSuccess(res, {
      message: 'Pago aprobado y orden actualizada exitosamente',
      data: updatedOrder
    });
  } catch (err) {
    logger.error('Error aprobando pago de orden', { message: err.message });
    return sendError(res, {
      status: 500,
      message: 'Error al aprobar pago de la orden',
      error: err.message
    });
  }
};

// Rechazar pago de orden (admin)
export const rejectOrderPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason, notes } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, { status: 400, message: 'ID de orden invalido' });
    }

    const order = await Order.findById(id);
    if (!order) {
      return sendError(res, { status: 404, message: 'Orden no encontrada' });
    }

    if (order.status === 'completed') {
      return sendError(res, { status: 409, message: 'No se puede rechazar el pago de una orden completada' });
    }

    if (order.paymentStatus === 'rejected') {
      return sendError(res, { status: 409, message: 'El pago de esta orden ya fue rechazado' });
    }

    if (!rejectionReason || rejectionReason.trim().length < 3) {
      return sendError(res, { status: 400, message: 'Motivo de rechazo requerido' });
    }

    order.paymentStatus = 'rejected';
    order.paymentValidation = {
      ...order.paymentValidation,
      rejectionReason,
      notes: notes || order.paymentValidation?.notes
    };

    if (order.status !== 'cancelled') {
      for (const item of order.products) {
        await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
      }
      order.status = 'cancelled';
    }

    updateOrderTrackingStage(order);

    await order.save();

    const updatedOrder = await Order.findById(id).populate('products.product', 'name price');

    return sendSuccess(res, {
      message: 'Pago rechazado y orden cancelada exitosamente',
      data: updatedOrder
    });
  } catch (err) {
    logger.error('Error rechazando pago de orden', { message: err.message });
    return sendError(res, {
      status: 500,
      message: 'Error al rechazar pago de la orden',
      error: err.message
    });
  }
};

export const getOrderTracking = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.sub;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, { status: 400, message: 'ID de orden invalido' });
    }

    const filter = req.user.role === 'admin' ? { _id: id } : { _id: id, user: userId };
    const order = await Order.findOne(filter).select(
      'orderId orderBrand supplierName intermediaryName status paymentStatus trackingNumber customerName fulfillmentTracking createdAt updatedAt'
    );

    if (!order) {
      return sendError(res, { status: 404, message: 'Orden no encontrada' });
    }

    return sendSuccess(res, {
      data: {
        orderId: order.orderId,
        orderBrand: order.orderBrand || 'GAZA',
        status: order.status,
        paymentStatus: order.paymentStatus,
        trackingNumber: order.trackingNumber || null,
        mapping: {
          supplier: order.supplierName || 'SYSCOM',
          intermediary: order.intermediaryName || 'GAZA',
          finalCustomer: order.customerName
        },
        fulfillmentTracking: order.fulfillmentTracking || {
          supplier: order.supplierName || 'SYSCOM',
          intermediary: order.intermediaryName || 'GAZA',
          finalCustomer: order.customerName,
          stage: getTrackingStageByOrderStatus(order),
          history: []
        }
      }
    });
  } catch (err) {
    logger.error('Error obteniendo rastreo de orden', { message: err.message });
    return sendError(res, {
      status: 500,
      message: 'Error al obtener rastreo de la orden',
      error: err.message
    });
  }
};
