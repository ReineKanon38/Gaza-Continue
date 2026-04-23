// src/routes/stats.js
import express from "express";
import { 
    getDashboardStats,
    getRecentOrders,
    getSalesByCategory,
    getSalesByMonth
} from "../controllers/statsController.js";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/authorize.js";

const router = express.Router();

// Todas las rutas de estadísticas requieren autenticación
router.use(requireAuth);
router.use(requireRole('admin'));

// GET /api/stats/dashboard - Obtener KPIs principales
router.get("/dashboard", getDashboardStats);

// GET /api/stats/recent-orders - Obtener órdenes recientes para tabla
router.get("/recent-orders", getRecentOrders);

// GET /api/stats/sales-by-category - Datos para gráfica de ventas por categoría
router.get("/sales-by-category", getSalesByCategory);

// GET /api/stats/sales-by-month - Datos para gráfica de ventas mensuales
router.get("/sales-by-month", getSalesByMonth);

export default router;