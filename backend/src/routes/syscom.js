import express from 'express';
import {
  searchSyscomProducts,
  syncSingleProduct,
  syncMultipleProducts,
  updateProductStock,
  updateProductPrice,
  syncAllProducts,
  getSyscomCategories,
  getSyscomBrands,
  getSyscomTags,
  getSuperPrecioProducts,
  syncSuperPrecioProducts,
  syncCategories,
  syncAllSuperPrecioByCategories,
  repairMissingPrices,
  getSyscomHealth,
  getSyscomHealthHistory
} from '../controllers/syscomController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/authorize.js';

const router = express.Router();

const requireAdmin = [requireAuth, requireRole('admin')];

// Búsqueda y consulta de productos
router.get('/search', searchSyscomProducts);
router.get('/categories', getSyscomCategories);
router.get('/brands', getSyscomBrands);
router.get('/tags', getSyscomTags);

// Endpoints de Súper Precio
router.get('/super-precio', getSuperPrecioProducts);
router.get('/sync-super-precio', ...requireAdmin, syncSuperPrecioProducts);

// Sincronización de categorías
router.get('/sync-categories', ...requireAdmin, syncCategories);

// Sincronización masiva de Súper Precio por categorías (100 productos por categoría)
router.get('/sync-all-super-precio', ...requireAdmin, syncAllSuperPrecioByCategories);

// Reparación operativa para productos con precio faltante o en cero
router.post('/repair-missing-prices', ...requireAdmin, repairMissingPrices);

// Salud y métricas de SYSCOM
router.get('/health', ...requireAdmin, getSyscomHealth);
router.get('/health/history', ...requireAdmin, getSyscomHealthHistory);

// Sincronización
router.get('/sync-all', ...requireAdmin, syncAllProducts);
router.post('/sync', ...requireAdmin, syncSingleProduct);
router.post('/sync-multiple', ...requireAdmin, syncMultipleProducts);

// Actualización de stock y precios
router.put('/products/:id/stock', ...requireAdmin, updateProductStock);
router.put('/products/:id/price', ...requireAdmin, updateProductPrice);

export default router;
  
