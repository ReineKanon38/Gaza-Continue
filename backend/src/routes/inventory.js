import express from 'express';
import {
  getInventory,
  getProductStock,
  updateStock,
  getLowStockProducts,
  getOutOfStockProducts,
  getInventoryValue,
  bulkUpdateStock,
  bulkUpdateProductActiveStatus
} from '../controllers/inventoryController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Rutas protegidas (solo admin)
router.get('/', requireAuth, requireRole('admin'), getInventory);
router.get('/product/:id', requireAuth, requireRole('admin'), getProductStock);
router.get('/low-stock', requireAuth, requireRole('admin'), getLowStockProducts);
router.get('/out-of-stock', requireAuth, requireRole('admin'), getOutOfStockProducts);
router.get('/value', requireAuth, requireRole('admin'), getInventoryValue);
router.put('/product/:id', requireAuth, requireRole('admin'), updateStock);
router.put('/bulk-stock', requireAuth, requireRole('admin'), bulkUpdateStock);
router.put('/bulk-status', requireAuth, requireRole('admin'), bulkUpdateProductActiveStatus);

export default router;
