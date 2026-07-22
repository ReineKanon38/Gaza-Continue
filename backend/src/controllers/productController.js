// src/controllers/productController.js
import mongoose from "mongoose";
import Product from "../models/Product.js";
import { sendSuccess, sendError } from '../utils/apiResponse.js';

// Cache en memoria para consultas de catálogo (SRE Performance Cache)
const catalogCache = new Map();
const CACHE_TTL_MS = 15000; // 15 segundos

export const invalidateCatalogCache = () => catalogCache.clear();

// Obtener todos los productos
export const getAllProducts = async (req, res) => {
  try {
    const cacheKey = req.originalUrl || JSON.stringify(req.query);
    const cached = catalogCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
      return sendSuccess(res, cached.payload);
    }

    // Filtros y paginación desde query params
    const { 
      category, 
      search, 
      active = true,
      page = 1,
      limit = 20 // 20 productos por página por defecto
    } = req.query;
    
    // Construir el filtro
    const filter = {};
    
    // Si hay búsqueda, filtrar por nombre o descripción usando expresión regular sobre campos indexados
    if (search) {
      const regex = new RegExp(search, 'i');
      filter.$or = [
        { name: regex },
        { description: regex }
      ];
    }
    
    // Si hay categoría, filtrar por categoría
    if (category) {
      filter.category = category;
    }
    
    // Filtrar por productos activos (por defecto)
    if (active !== 'false') {
      filter.active = active === 'true' || active === true;
    }
    
    // Calcular skip para paginación
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;
    
    // Ejecutar la cuenta total y la consulta de productos en PARALELO en MongoDB usando .lean() para máximo rendimiento SRE
    const [totalProducts, products] = await Promise.all([
      Product.countDocuments(filter),
      Product.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNumber)
        .lean()
    ]);
    
    const payload = {
      data: products,
      count: products.length,
      total: totalProducts,
      pagination: {
        currentPage: pageNumber,
        totalPages: Math.ceil(totalProducts / limitNumber),
        limit: limitNumber,
        hasNextPage: pageNumber < Math.ceil(totalProducts / limitNumber),
        hasPrevPage: pageNumber > 1
      }
    };

    catalogCache.set(cacheKey, { timestamp: Date.now(), payload });
    return sendSuccess(res, payload);
  } catch (err) {
    return sendError(res, {
      status: 500,
      message: "Error al obtener productos",
      error: err.message
    });
  }
};

// Obtener un producto por ID
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validar que el ID tenga el formato correcto de ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, { status: 400, message: "ID de producto inválido" });
    }
    
    const product = await Product.findById(id);
    
    if (!product) {
      return sendError(res, { status: 404, message: "Producto no encontrado" });
    }
    
    return sendSuccess(res, { data: product });
  } catch (err) {
    return sendError(res, {
      status: 500,
      message: "Error al obtener el producto",
      error: err.message
    });
  }
};

// Crear un nuevo producto
export const createProduct = async (req, res) => {
  try {
    const { name, price, description, category, image, stock, syscomId } = req.body;
    
    // Validar campos requeridos
    if (!name || price === undefined) {
      return sendError(res, { status: 400, message: "Nombre y precio son requeridos" });
    }
    
    // Validar que el precio sea un número positivo
    if (typeof price !== 'number' || price < 0) {
      return sendError(res, { status: 400, message: "El precio debe ser un número positivo" });
    }
    
    // Crear el producto
    const product = await Product.create({
      name,
      price,
      description,
      category,
      image,
      stock: stock || 0,
      syscomId,
      active: true
    });
    
    invalidateCatalogCache();
    return sendSuccess(res, {
      status: 201,
      message: "Producto creado exitosamente",
      data: product
    });
  } catch (err) {
    // Si hay un error de duplicado en syscomId
    if (err.code === 11000) {
      return sendError(res, { status: 409, message: "El syscomId ya está registrado" });
    }
    
    return sendError(res, {
      status: 500,
      message: "Error al crear el producto",
      error: err.message
    });
  }
};

// Actualizar un producto existente (admin)
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const update = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, { status: 400, message: "ID de producto inválido" });
    }

    const product = await Product.findByIdAndUpdate(id, update, { new: true, runValidators: true });
    if (!product) {
      return sendError(res, { status: 404, message: "Producto no encontrado" });
    }

    invalidateCatalogCache();
    return sendSuccess(res, { message: "Producto actualizado", data: product });
  } catch (err) {
    if (err.code === 11000) {
      return sendError(res, { status: 409, message: "El syscomId ya está registrado" });
    }
    return sendError(res, { status: 500, message: "Error al actualizar el producto", error: err.message });
  }
};

// Eliminar producto (admin)
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, { status: 400, message: "ID de producto inválido" });
    }

    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return sendError(res, { status: 404, message: "Producto no encontrado" });
    }

    invalidateCatalogCache();
    return sendSuccess(res, { message: "Producto eliminado" });
  } catch (err) {
    return sendError(res, { status: 500, message: "Error al eliminar el producto", error: err.message });
  }
};