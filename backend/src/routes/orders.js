// src/routes/orders.js
import express from "express";
import { 
  createOrder, 
  getUserOrders, 
  getOrderById, 
  updateOrderStatus, 
  getAllOrders,
  updateOrder,
  deleteOrder,
  getOrderStats,
  approveOrderPayment,
  rejectOrderPayment
} from "../controllers/orderController.js";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/authorize.js";
import { validate } from "../middleware/validate.js";
import {
  createOrderSchema,
  updateOrderStatusSchema,
  updateOrderSchema,
  approveOrderPaymentSchema,
  rejectOrderPaymentSchema
} from "../validation/schemas.js";

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(requireAuth);

// POST /api/orders - Crear nueva orden
router.post("/", validate(createOrderSchema), createOrder);

// GET /api/orders - Obtener órdenes del usuario logueado
router.get("/", getUserOrders);

// GET /api/orders/:id - Obtener orden específica por ID
router.get("/:id", getOrderById);

// Rutas de ADMIN
// GET /api/orders/admin/all - Obtener todas las órdenes (solo admin)
router.get("/admin/all", requireRole('admin'), getAllOrders);

// GET /api/orders/admin/stats - Estadísticas de órdenes (solo admin)
router.get("/admin/stats", requireRole('admin'), getOrderStats);

// PUT /api/orders/:id/status - Actualizar estado de orden (solo admin)
router.put("/:id/status", requireRole('admin'), validate(updateOrderStatusSchema), updateOrderStatus);

// PUT /api/orders/:id/payment/approve - Aprobar validacion de pago (solo admin)
router.put('/:id/payment/approve', requireRole('admin'), validate(approveOrderPaymentSchema), approveOrderPayment);

// PUT /api/orders/:id/payment/reject - Rechazar validacion de pago (solo admin)
router.put('/:id/payment/reject', requireRole('admin'), validate(rejectOrderPaymentSchema), rejectOrderPayment);

// PUT /api/orders/:id - Actualizar orden completa (solo admin)
router.put("/:id", requireRole('admin'), validate(updateOrderSchema), updateOrder);

// DELETE /api/orders/:id - Eliminar orden (soft delete - solo admin)
router.delete("/:id", requireRole('admin'), deleteOrder);

export default router;
