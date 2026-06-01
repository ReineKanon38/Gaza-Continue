import { requestJson } from './httpClient';

const inventoryService = {
  // Obtener inventario completo
  getInventory: () => requestJson('/api/inventory'),

  // Obtener stock de un producto
  getProductStock: (productId) => requestJson(`/api/inventory/product/${productId}`),

  // Actualizar stock
  updateStock: (productId, quantity, operation = 'set') => requestJson(`/api/inventory/product/${productId}`, {
    method: 'PUT',
    body: JSON.stringify({ quantity, operation })
  }),

  // Actualizar stock en lote
  bulkUpdateStock: (productIds, quantity, operation = 'add') => requestJson('/api/inventory/bulk-stock', {
    method: 'PUT',
    body: JSON.stringify({ productIds, quantity, operation })
  }),

  // Activar/desactivar productos en lote
  bulkUpdateProductStatus: (productIds, active) => requestJson('/api/inventory/bulk-status', {
    method: 'PUT',
    body: JSON.stringify({ productIds, active })
  }),

  // Obtener productos con bajo stock
  getLowStockProducts: (threshold = 5) => requestJson(`/api/inventory/low-stock?threshold=${threshold}`),

  // Obtener productos sin stock
  getOutOfStockProducts: () => requestJson('/api/inventory/out-of-stock'),

  // Obtener valor total del inventario
  getInventoryValue: () => requestJson('/api/inventory/value')
};

export default inventoryService;
