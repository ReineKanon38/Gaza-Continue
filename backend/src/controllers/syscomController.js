import syscomService from '../services/syscomService.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { logger } from '../utils/logger.js';

// Buscar productos en SYSCOM
export const searchSyscomProducts = async (req, res) => {
  try {
    const { query, brand, distributor, category, page, limit } = req.query;
    const normalizedBrand = brand || distributor;

    const result = await syscomService.searchProducts({
      query,
      brand: normalizedBrand,
      category,
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 50
    });

    if (!result.success) {
      return sendError(res, { status: 400, message: result.message || result.error || 'Error al buscar en SYSCOM' });
    }

    return sendSuccess(res, {
      data: result.data,
      total: result.total,
      page: result.page,
      source: result.source
    });
  } catch (error) {
    logger.error('Error searching SYSCOM', { message: error.message });
    return sendError(res, {
      status: 500,
      message: 'Error al buscar en SYSCOM',
      error: error.message
    });
  }
};

// Sincronizar un producto desde SYSCOM
export const syncSingleProduct = async (req, res) => {
  try {
    const { syscomId } = req.body;

    if (!syscomId) {
      return sendError(res, { status: 400, message: 'syscomId es requerido' });
    }

    const result = await syscomService.syncProduct(syscomId);

    return sendSuccess(res, {
      message: `Producto ${result.action === 'created' ? 'importado' : 'actualizado'} correctamente`,
      action: result.action,
      product: result.product
    });
  } catch (error) {
    logger.error('Error syncing product', { message: error.message });
    return sendError(res, {
      status: 500,
      message: 'Error al sincronizar producto',
      error: error.message
    });
  }
};

// Sincronizar múltiples productos
export const syncMultipleProducts = async (req, res) => {
  try {
    const { syscomIds } = req.body;

    if (!Array.isArray(syscomIds) || syscomIds.length === 0) {
      return sendError(res, { status: 400, message: 'syscomIds debe ser un array con al menos un ID' });
    }

    const results = await syscomService.syncMultipleProducts(syscomIds);

    return sendSuccess(res, {
      message: `Sincronización completada: ${results.success.length} exitosos, ${results.failed.length} fallidos`,
      results
    });
  } catch (error) {
    logger.error('Error syncing multiple products', { message: error.message });
    return sendError(res, {
      status: 500,
      message: 'Error al sincronizar productos',
      error: error.message
    });
  }
};

// Actualizar stock de producto desde SYSCOM
export const updateProductStock = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await syscomService.updateStock(id);

    return sendSuccess(res, {
      message: 'Stock actualizado',
      stock: result.stock
    });
  } catch (error) {
    logger.error('Error updating stock', { message: error.message });
    return sendError(res, {
      status: 500,
      message: 'Error al actualizar stock',
      error: error.message
    });
  }
};

// Actualizar precio de producto desde SYSCOM
export const updateProductPrice = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await syscomService.updatePrice(id);

    return sendSuccess(res, {
      message: 'Precio actualizado',
      price: result.price
    });
  } catch (error) {
    logger.error('Error updating price', { message: error.message });
    return sendError(res, {
      status: 500,
      message: 'Error al actualizar precio',
      error: error.message
    });
  }
};

// Sincronizar todos los productos
export const syncAllProducts = async (req, res) => {
  try {
    const results = await syscomService.syncAllProducts();

    return sendSuccess(res, {
      message: `Sincronización completa: ${results.updated} actualizados, ${results.failed} fallidos`,
      results
    });
  } catch (error) {
    logger.error('Error syncing all products', { message: error.message });
    return sendError(res, {
      status: 500,
      message: 'Error al sincronizar todos los productos',
      error: error.message
    });
  }
};

// Obtener categorías de SYSCOM
export const getSyscomCategories = async (req, res) => {
  try {
    const result = await syscomService.getCategories();
    
    if (!result.success) {
      return sendError(res, { status: 400, message: result.message || result.error || 'Error al obtener categorías' });
    }

    return sendSuccess(res, { data: result.data });
  } catch (error) {
    return sendError(res, { status: 500, message: error.message, error: error.message });
  }
};

// Obtener marcas de SYSCOM
export const getSyscomBrands = async (req, res) => {
  try {
    const result = await syscomService.getBrands();
    
    if (!result.success) {
      return sendError(res, { status: 400, message: result.message });
    }

    return sendSuccess(res, { data: result.data });
  } catch (error) {
    return sendError(res, { status: 500, message: error.message, error: error.message });
  }
};

// Obtener etiquetas de SYSCOM (Super Precio, Envío Gratis, etc.)
export const getSyscomTags = async (req, res) => {
  try {
    const result = await syscomService.getTags();
    
    if (!result.success) {
      return sendError(res, { status: 400, message: result.message });
    }

    return sendSuccess(res, { data: result.data });
  } catch (error) {
    return sendError(res, { status: 500, message: error.message, error: error.message });
  }
};

// Obtener productos de Súper Precio
export const getSuperPrecioProducts = async (req, res) => {
  try {
    const { page, limit, category, brand } = req.query;

    const result = await syscomService.getSuperPrecioProducts({
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 50,
      category,
      brand
    });

    if (!result.success) {
      return sendError(res, { status: 400, message: result.message });
    }

    return sendSuccess(res, {
      data: result.data,
      pagination: result.pagination
    });
  } catch (error) {
    logger.error('Error obteniendo productos de Super Precio', { message: error.message });
    return sendError(res, {
      status: 500,
      message: 'Error al obtener productos de Súper Precio',
      error: error.message
    });
  }
};

// Sincronizar productos de Súper Precio automáticamente
export const syncSuperPrecioProducts = async (req, res) => {
  try {
    const { limit, page } = req.query;

    const result = await syscomService.syncSuperPrecioProducts({
      limit: parseInt(limit) || 50,
      page: parseInt(page) || 1
    });

    return sendSuccess(res, { ...result });
  } catch (error) {
    logger.error('Error sincronizando productos de Super Precio', { message: error.message });
    return sendError(res, {
      status: 500,
      message: 'Error al sincronizar productos de Súper Precio',
      error: error.message
    });
  }
};

// Sincronizar categorías desde SYSCOM
export const syncCategories = async (req, res) => {
  try {
    const result = await syscomService.syncCategories();

    return sendSuccess(res, { ...result });
  } catch (error) {
    logger.error('Error sincronizando categorias', { message: error.message });
    return sendError(res, {
      status: 500,
      message: 'Error al sincronizar categorías',
      error: error.message
    });
  }
};

// Sincronizar TODOS los productos de Súper Precio por categorías
export const syncAllSuperPrecioByCategories = async (req, res) => {
  try {
    const { limitPerCategory } = req.query;

    const result = await syscomService.syncAllSuperPrecioByCategories({
      limitPerCategory: parseInt(limitPerCategory) || 100
    });

    return sendSuccess(res, { ...result });
  } catch (error) {
    logger.error('Error sincronizando productos por categorias', { message: error.message });
    return sendError(res, {
      status: 500,
      message: 'Error al sincronizar productos por categorías',
      error: error.message
    });
  }
};

// Reparar precios faltantes o en cero para productos sincronizados
export const repairMissingPrices = async (req, res) => {
  try {
    const { limit, batchSize } = req.query;

    const result = await syscomService.repairMissingPrices({
      limit: parseInt(limit) || 300,
      batchSize: parseInt(batchSize) || 10
    });

    return sendSuccess(res, { ...result });
  } catch (error) {
    logger.error('Error reparando precios faltantes', { message: error.message });
    return sendError(res, {
      status: 500,
      message: 'Error al reparar precios faltantes',
      error: error.message
    });
  }
};

// Obtener métricas de salud y rendimiento de SYSCOM
export const getSyscomHealth = async (req, res) => {
  try {
    const metrics = syscomService.getHealthMetrics();

    return sendSuccess(res, {
      message: 'Métricas de SYSCOM obtenidas correctamente',
      data: metrics
    });
  } catch (error) {
    logger.error('Error obteniendo salud de SYSCOM', { message: error.message });
    return sendError(res, {
      status: 500,
      message: 'Error al obtener métricas de SYSCOM',
      error: error.message
    });
  }
};

// Obtener histórico persistente de salud SYSCOM
export const getSyscomHealthHistory = async (req, res) => {
  try {
    const { minutes, limit } = req.query;
    const history = await syscomService.getHealthHistory({
      minutes: parseInt(minutes, 10) || 180,
      limit: parseInt(limit, 10) || undefined
    });

    return sendSuccess(res, {
      message: 'Historico de SYSCOM obtenido correctamente',
      data: history
    });
  } catch (error) {
    logger.error('Error obteniendo historico de SYSCOM', { message: error.message });
    return sendError(res, {
      status: 500,
      message: 'Error al obtener historico de SYSCOM',
      error: error.message
    });
  }
};

// Obtener tipo de cambio configurado actual
export const getExchangeRate = async (req, res) => {
  try {
    const rateInfo = syscomService.getExchangeRate();
    return sendSuccess(res, rateInfo);
  } catch (error) {
    logger.error('Error obteniendo tipo de cambio', { message: error.message });
    return sendError(res, {
      status: 500,
      message: 'Error al obtener el tipo de cambio',
      error: error.message
    });
  }
};
