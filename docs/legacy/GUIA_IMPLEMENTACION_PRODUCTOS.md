# 🛠️ GUÍA DE IMPLEMENTACIÓN - GESTIÓN DE PRODUCTOS

**Fase:** 2 (Próxima a implementar)  
**Tiempo estimado:** 11-13 horas  
**Complejidad:** Media

---

## 📋 ÍNDICE

1. Backend - Endpoints y Validaciones
2. Frontend - Componentes
3. Integración
4. Testing

---

## 🔧 BACKEND - GESTIÓN DE PRODUCTOS

### 1. Modelo Product.js (Actualizar)

```javascript
// backend/src/models/Product.js
import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  // Identificación
  productId: {
    type: String,
    unique: true,
    required: true,
    default: () => 'PROD-' + Date.now()
  },

  // Información básica
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },

  // Precios
  price: {
    type: Number,
    required: true,
    min: 0
  },
  costPrice: {
    type: Number,
    default: 0,
    min: 0
  },

  // Inventario
  stock: {
    type: Number,
    default: 0,
    min: 0
  },
  minStock: {
    type: Number,
    default: 10
  },

  // Imágenes
  images: {
    main: String,
    thumbnails: [String]
  },

  // Detalles
  sku: String,
  barcode: String,
  weight: Number,
  dimensions: {
    length: Number,
    width: Number,
    height: Number
  },

  // Estado
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },

  // Auditoría
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  createdBy: mongoose.Schema.Types.ObjectId,
  updatedBy: mongoose.Schema.Types.ObjectId,

  // Soft delete
  isDeleted: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

export default mongoose.model('Product', ProductSchema);
```

### 2. Esquemas de Validación (Zod)

```javascript
// backend/src/validation/schemas.js
// Agregar al archivo existente:

export const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(3).max(100),
    description: z.string().min(10).max(1000),
    category: z.string().min(2),
    price: z.number().positive(),
    costPrice: z.number().min(0).optional(),
    stock: z.number().int().min(0),
    minStock: z.number().int().min(0).default(10),
    sku: z.string().optional(),
    barcode: z.string().optional(),
    images: z.object({
      main: z.string().url().optional(),
      thumbnails: z.array(z.string().url()).optional()
    }).optional(),
    isFeatured: z.boolean().default(false)
  })
});

export const updateProductSchema = z.object({
  body: z.object({
    name: z.string().min(3).max(100).optional(),
    description: z.string().min(10).max(1000).optional(),
    category: z.string().min(2).optional(),
    price: z.number().positive().optional(),
    costPrice: z.number().min(0).optional(),
    stock: z.number().int().min(0).optional(),
    minStock: z.number().int().min(0).optional(),
    sku: z.string().optional(),
    barcode: z.string().optional(),
    images: z.object({
      main: z.string().url().optional(),
      thumbnails: z.array(z.string().url()).optional()
    }).optional(),
    isActive: z.boolean().optional(),
    isFeatured: z.boolean().optional()
  })
});

export const listProductsSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).default('1'),
    limit: z.string().regex(/^\d+$/).default('20'),
    search: z.string().optional(),
    category: z.string().optional(),
    minPrice: z.string().regex(/^\d+$/).optional(),
    maxPrice: z.string().regex(/^\d+$/).optional(),
    inStock: z.string().optional(),
    sort: z.enum(['newest', 'price-asc', 'price-desc', 'popular']).default('newest')
  })
});
```

### 3. Controlador de Productos

```javascript
// backend/src/controllers/productController.js
import Product from '../models/Product.js';

// Listar productos con filtros
export const getProducts = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, category, minPrice, maxPrice, inStock, sort } = req.query;

    const filter = { isDeleted: false, isActive: true };

    // Búsqueda
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } }
      ];
    }

    // Categoría
    if (category) filter.category = category;

    // Precio
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // Stock
    if (inStock === 'true') filter.stock = { $gt: 0 };

    // Ordenamiento
    let sortObj = { createdAt: -1 };
    if (sort === 'price-asc') sortObj = { price: 1 };
    if (sort === 'price-desc') sortObj = { price: -1 };
    if (sort === 'popular') sortObj = { isFeatured: -1, createdAt: -1 };

    const skip = (page - 1) * limit;
    const products = await Product.find(filter)
      .sort(sortObj)
      .skip(skip)
      .limit(Number(limit));

    const total = await Product.countDocuments(filter);

    res.json({
      success: true,
      data: products,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Admin: Listar todos los productos
export const getAdminProducts = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, category, minPrice, maxPrice, sort } = req.query;

    const filter = { isDeleted: false };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { productId: { $regex: search, $options: 'i' } }
      ];
    }

    if (category) filter.category = category;

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    let sortObj = { createdAt: -1 };
    if (sort === 'price-asc') sortObj = { price: 1 };
    if (sort === 'price-desc') sortObj = { price: -1 };

    const skip = (page - 1) * limit;
    const products = await Product.find(filter)
      .sort(sortObj)
      .skip(skip)
      .limit(Number(limit));

    const total = await Product.countDocuments(filter);

    res.json({
      success: true,
      data: products,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Obtener un producto
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product || product.isDeleted) {
      return res.status(404).json({ success: false, error: 'Producto no encontrado' });
    }
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Crear producto (Admin)
export const createProduct = async (req, res) => {
  try {
    const { name, description, category, price, costPrice, stock, minStock, sku, barcode, images, isFeatured } = req.body;

    const product = new Product({
      name,
      description,
      category,
      price,
      costPrice,
      stock,
      minStock,
      sku,
      barcode,
      images,
      isFeatured,
      createdBy: req.user.id
    });

    await product.save();

    res.status(201).json({ success: true, data: product });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Actualizar producto (Admin)
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    updates.updatedBy = req.user.id;
    updates.updatedAt = new Date();

    const product = await Product.findByIdAndUpdate(id, updates, { new: true, runValidators: true });

    if (!product) {
      return res.status(404).json({ success: false, error: 'Producto no encontrado' });
    }

    res.json({ success: true, data: product });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Eliminar producto - Soft delete (Admin)
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByIdAndUpdate(
      id,
      { isDeleted: true, updatedBy: req.user.id },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ success: false, error: 'Producto no encontrado' });
    }

    res.json({ success: true, message: 'Producto eliminado' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Estadísticas de inventario (Admin)
export const getProductStats = async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments({ isDeleted: false });
    const lowStockProducts = await Product.countDocuments({
      isDeleted: false,
      $expr: { $lte: ['$stock', '$minStock'] }
    });
    const outOfStockProducts = await Product.countDocuments({ isDeleted: false, stock: 0 });

    const stats = await Product.aggregate([
      { $match: { isDeleted: false } },
      {
        $group: {
          _id: null,
          totalValue: { $sum: { $multiply: ['$price', '$stock'] } },
          avgPrice: { $avg: '$price' },
          totalStock: { $sum: '$stock' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        totalProducts,
        lowStockProducts,
        outOfStockProducts,
        totalInventoryValue: stats[0]?.totalValue || 0,
        averagePrice: stats[0]?.avgPrice || 0,
        totalStock: stats[0]?.totalStock || 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
```

### 4. Rutas de Productos

```javascript
// backend/src/routes/products.js
// Actualizar/crear este archivo:

import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  getProducts,
  getAdminProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductStats
} from '../controllers/productController.js';
import {
  createProductSchema,
  updateProductSchema,
  listProductsSchema
} from '../validation/schemas.js';

const router = express.Router();

// Rutas públicas
router.get('/', validate(listProductsSchema), getProducts);
router.get('/:id', getProductById);

// Rutas admin
router.get('/admin/all', authenticate, authorize('admin'), validate(listProductsSchema), getAdminProducts);
router.get('/admin/stats', authenticate, authorize('admin'), getProductStats);
router.post('/admin/create', authenticate, authorize('admin'), validate(createProductSchema), createProduct);
router.put('/admin/:id', authenticate, authorize('admin'), validate(updateProductSchema), updateProduct);
router.delete('/admin/:id', authenticate, authorize('admin'), deleteProduct);

export default router;
```

---

## 🎨 FRONTEND - COMPONENTES

### 1. ManageProducts.jsx (Principal)

```jsx
// frontend/src/components/ManageProducts.jsx
import { useState, useEffect } from 'react';
import { useNotification } from '../hooks';
import ProductsTable from './products/ProductsTable';
import ProductDetailModal from './products/ProductDetailModal';
import CreateProductModal from './products/CreateProductModal';
import ProductStats from './products/ProductStats';
import './ManageProducts.css';

export default function ManageProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    page: 1,
    limit: 20
  });
  const [pagination, setPagination] = useState({});
  const { showNotification } = useNotification();

  // Cargar productos
  useEffect(() => {
    loadProducts();
  }, [filters]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams({
        page: filters.page,
        limit: filters.limit,
        ...(filters.search && { search: filters.search }),
        ...(filters.category && { category: filters.category })
      });

      const res = await fetch(`/api/products/admin/all?${query}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      if (!res.ok) throw new Error('Error al cargar productos');

      const data = await res.json();
      setProducts(data.data);
      setPagination(data.pagination);
    } catch (error) {
      showNotification(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('¿Eliminar este producto?')) return;

    try {
      const res = await fetch(`/api/products/admin/${productId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      if (!res.ok) throw new Error('Error al eliminar');

      showNotification('Producto eliminado', 'success');
      loadProducts();
    } catch (error) {
      showNotification(error.message, 'error');
    }
  };

  return (
    <div className="manage-products">
      <div className="mp-header">
        <h2>Gestión de Productos</h2>
        <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
          + Nuevo Producto
        </button>
      </div>

      <ProductStats onFiltersChange={setFilters} />

      <div className="mp-filters">
        <input
          type="text"
          placeholder="Buscar por nombre, SKU..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
          className="filter-input"
        />
        <select
          value={filters.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value, page: 1 })}
          className="filter-select"
        >
          <option value="">Todas las categorías</option>
          <option value="Electrónica">Electrónica</option>
          <option value="Ropa">Ropa</option>
          <option value="Otros">Otros</option>
        </select>
      </div>

      {loading ? (
        <div className="loading">Cargando productos...</div>
      ) : (
        <>
          <ProductsTable
            products={products}
            onViewDetails={(product) => {
              setSelectedProduct(product);
              setShowDetailModal(true);
            }}
            onDelete={handleDeleteProduct}
          />

          <div className="pagination">
            <button
              onClick={() => setFilters({ ...filters, page: Math.max(1, filters.page - 1) })}
              disabled={filters.page === 1}
            >
              Anterior
            </button>
            <span>Página {pagination.page} de {pagination.pages}</span>
            <button
              onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
              disabled={filters.page === pagination.pages}
            >
              Siguiente
            </button>
          </div>
        </>
      )}

      {showDetailModal && selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setShowDetailModal(false)}
          onUpdate={() => loadProducts()}
        />
      )}

      {showCreateModal && (
        <CreateProductModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            loadProducts();
            setShowCreateModal(false);
          }}
        />
      )}
    </div>
  );
}
```

### 2. ProductsTable.jsx

```jsx
// frontend/src/components/products/ProductsTable.jsx
export default function ProductsTable({ products, onViewDetails, onDelete }) {
  return (
    <table className="products-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Nombre</th>
          <th>Categoría</th>
          <th>Precio</th>
          <th>Stock</th>
          <th>Estado</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {products.map(product => (
          <tr key={product._id}>
            <td>{product.productId}</td>
            <td>{product.name}</td>
            <td>{product.category}</td>
            <td>${product.price.toFixed(2)}</td>
            <td>
              <span className={product.stock > 0 ? 'in-stock' : 'out-stock'}>
                {product.stock} unidades
              </span>
            </td>
            <td>
              <span className={product.isActive ? 'badge-active' : 'badge-inactive'}>
                {product.isActive ? 'Activo' : 'Inactivo'}
              </span>
            </td>
            <td>
              <button onClick={() => onViewDetails(product)} className="btn-small">Ver</button>
              <button onClick={() => onDelete(product._id)} className="btn-small btn-danger">Eliminar</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

### 3. Estilos Básicos

```css
/* frontend/src/components/ManageProducts.css */
.manage-products {
  padding: 20px;
}

.mp-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.mp-filters {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.filter-input,
.filter-select {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  flex: 1;
}

.products-table {
  width: 100%;
  border-collapse: collapse;
  margin: 20px 0;
}

.products-table th,
.products-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

.products-table th {
  background-color: #f5f5f5;
  font-weight: 600;
}

.in-stock { color: #28a745; font-weight: 600; }
.out-stock { color: #dc3545; font-weight: 600; }

.pagination {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 30px;
}

.pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

---

## ✅ PRÓXIMOS PASOS

1. **Copiar y adaptar** este código en tu proyecto
2. **Crear los 3 componentes** faltantes (DetailModal, CreateModal, Stats)
3. **Probar endpoints** con Postman o Thunder Client
4. **Integrar en AdminPanel** agregando un nuevo tab
5. **Testing** con datos reales

---

## 📝 NOTA

Este es el código base. Necesitarás:
- ProductDetailModal.jsx - Modal para ver detalles y editar
- CreateProductModal.jsx - Modal para crear productos
- ProductStats.jsx - KPI de inventario

Puedes copiar la estructura de ManageOrders como referencia.

---

**Documento:** Guía de Implementación  
**Versión:** 1.0  
**Fecha:** 7 de Enero, 2026
