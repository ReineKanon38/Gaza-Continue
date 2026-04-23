import Product from '../models/Product.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

// Obtener inventario de todos los productos
export const getInventory = async (req, res) => {
  try {
    const products = await Product.find()
      .select('name stock price category brand model active')
      .sort({ stock: 1 }); // Ordenar por stock ascendente

    // Calcular estadísticas
    const totalStock = products.reduce((sum, p) => sum + (p.stock || 0), 0);
    const lowStockCount = products.filter(p => p.stock < 5).length;
    const outOfStockCount = products.filter(p => p.stock === 0).length;
    const inventoryValue = products.reduce(
      (sum, p) => sum + ((p.stock || 0) * (p.price || 0)),
      0
    );

    return sendSuccess(res, {
      data: {
        products,
        stats: {
          totalStock,
          totalProducts: products.length,
          lowStockCount,
          outOfStockCount,
          inventoryValue
        }
      }
    });
  } catch (error) {
    return sendError(res, {
      status: 500,
      message: 'Error al obtener inventario',
      error: error.message
    });
  }
};

// Obtener stock de un producto específico
export const getProductStock = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).select('name stock price category');
    
    if (!product) {
      return sendError(res, { status: 404, message: 'Producto no encontrado' });
    }

    return sendSuccess(res, { data: product });
  } catch (error) {
    return sendError(res, {
      status: 500,
      message: 'Error al obtener stock',
      error: error.message
    });
  }
};

// Actualizar stock de un producto
export const updateStock = async (req, res) => {
  try {
    const { quantity, operation } = req.body;

    if (!quantity && quantity !== 0) {
      return sendError(res, { status: 400, message: 'La cantidad es requerida' });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return sendError(res, { status: 404, message: 'Producto no encontrado' });
    }

    const previousStock = product.stock;
    let newStock = product.stock;

    if (operation === 'add') {
      newStock += quantity;
    } else if (operation === 'subtract') {
      newStock -= quantity;
      if (newStock < 0) {
        return sendError(res, { status: 400, message: 'No hay suficiente stock' });
      }
    } else if (operation === 'set') {
      newStock = quantity;
    } else {
      return sendError(res, { status: 400, message: 'Operación inválida. Use: add, subtract, set' });
    }

    product.stock = newStock;
    await product.save();

    return sendSuccess(res, {
      data: {
        productId: product._id,
        productName: product.name,
        previousStock,
        newStock: product.stock,
        operation
      },
      message: 'Stock actualizado exitosamente'
    });
  } catch (error) {
    return sendError(res, {
      status: 500,
      message: 'Error al actualizar stock',
      error: error.message
    });
  }
};

// Obtener productos con bajo stock
export const getLowStockProducts = async (req, res) => {
  try {
    const threshold = Number(req.query.threshold) || 5;
    
    const products = await Product.find({ stock: { $lt: threshold } })
      .select('name stock price category brand active')
      .sort({ stock: 1 });

    return sendSuccess(res, {
      data: products,
      message: `${products.length} productos con stock bajo (< ${threshold})`
    });
  } catch (error) {
    return sendError(res, {
      status: 500,
      message: 'Error al obtener productos con bajo stock',
      error: error.message
    });
  }
};

// Obtener productos sin stock
export const getOutOfStockProducts = async (req, res) => {
  try {
    const products = await Product.find({ stock: 0 })
      .select('name price category brand active')
      .sort({ createdAt: -1 });

    return sendSuccess(res, {
      data: products,
      message: `${products.length} productos agotados`
    });
  } catch (error) {
    return sendError(res, {
      status: 500,
      message: 'Error al obtener productos sin stock',
      error: error.message
    });
  }
};

// Obtener valor total del inventario
export const getInventoryValue = async (req, res) => {
  try {
    const products = await Product.find().select('stock price');
    
    const totalValue = products.reduce(
      (sum, p) => sum + ((p.stock || 0) * (p.price || 0)),
      0
    );

    return sendSuccess(res, {
      data: {
        totalValue,
        totalProducts: products.length,
        currency: 'MXN'
      }
    });
  } catch (error) {
    return sendError(res, {
      status: 500,
      message: 'Error al calcular valor del inventario',
      error: error.message
    });
  }
};

// Actualizar stock de multiples productos
export const bulkUpdateStock = async (req, res) => {
  try {
    const { productIds, quantity, operation = 'add' } = req.body;

    if (!Array.isArray(productIds) || productIds.length === 0) {
      return sendError(res, { status: 400, message: 'Debe enviar al menos un producto' });
    }

    if (typeof quantity !== 'number' || Number.isNaN(quantity) || quantity < 0) {
      return sendError(res, { status: 400, message: 'La cantidad debe ser un numero valido >= 0' });
    }

    if (!['add', 'subtract', 'set'].includes(operation)) {
      return sendError(res, { status: 400, message: 'Operación inválida. Use: add, subtract, set' });
    }

    const products = await Product.find({ _id: { $in: productIds } }).select('name stock');
    if (products.length === 0) {
      return sendError(res, { status: 404, message: 'No se encontraron productos para actualizar' });
    }

    const updates = products.map((product) => {
      let newStock = product.stock || 0;

      if (operation === 'add') {
        newStock += quantity;
      } else if (operation === 'subtract') {
        newStock -= quantity;
      } else {
        newStock = quantity;
      }

      if (newStock < 0) {
        throw new Error(`Stock insuficiente para ${product.name}`);
      }

      return {
        updateOne: {
          filter: { _id: product._id },
          update: { $set: { stock: newStock } }
        }
      };
    });

    await Product.bulkWrite(updates);

    return sendSuccess(res, {
      data: {
        updatedCount: products.length,
        operation,
        quantity
      },
      message: 'Inventario actualizado exitosamente'
    });
  } catch (error) {
    if (error.message && error.message.startsWith('Stock insuficiente para')) {
      return sendError(res, {
        status: 400,
        message: error.message
      });
    }

    return sendError(res, {
      status: 500,
      message: 'Error al actualizar inventario en lote',
      error: error.message
    });
  }
};

// Activar o desactivar multiples productos
export const bulkUpdateProductActiveStatus = async (req, res) => {
  try {
    const { productIds, active } = req.body;

    if (!Array.isArray(productIds) || productIds.length === 0) {
      return sendError(res, { status: 400, message: 'Debe enviar al menos un producto' });
    }

    if (typeof active !== 'boolean') {
      return sendError(res, { status: 400, message: 'El campo active debe ser booleano' });
    }

    const result = await Product.updateMany(
      { _id: { $in: productIds } },
      { $set: { active } }
    );

    return sendSuccess(res, {
      data: {
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount,
        active
      },
      message: active ? 'Productos activados' : 'Productos desactivados'
    });
  } catch (error) {
    return sendError(res, {
      status: 500,
      message: 'Error al actualizar estado de productos',
      error: error.message
    });
  }
};
