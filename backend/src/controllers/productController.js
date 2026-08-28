// src/controllers/productController.js
import mongoose from "mongoose";
import Product from "../models/Product.js";
import syscomService from "../services/syscomService.js";
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
      brand,
      active = true,
      page = 1,
      limit = 20
    } = req.query;
    
    // Construir el filtro para el catálogo (excluyendo fuego y radiocomunicación)
    const BLOCKED_REGEX = /(radio|walkie|handy|radiocom|fuego|humo|incendio|estacion manual|estación manual|estacion de jalon|estación de jalón)/i;
    const filter = {
      name: { $not: BLOCKED_REGEX },
      description: { $not: /(fuego|incendio|humo)/i }
    };

    // Mapeo flexible de categorías en lenguaje natural
    const categoryMap = {
      'videovigilancia': /(videovigilancia|cctv|camara|grabador|dvr|nvr)/i,
      'redes-it': /(redes|network|it|switch|router|access point|rack|fibra|utp)/i,
      'control-acceso': /(control.*acceso|acceso|biometrico|cerradura|chapa|torniquete)/i,
      'energia-herramientas': /(energia|herramienta|fuente|ups|no.*break|bateria|generador|regulador)/i,
      'automatizacion': /(automatizacion|intrusion|alarma|sensor|sirena|domotica)/i,
      'iot-gps': /(iot|gps|telemat|tracker|rastreador)/i
    };

    const andConditions = [];

    // Si hay categoría, buscar por slug o por coincidencia en lenguaje natural
    if (category) {
      const cleanCat = String(category).trim().toLowerCase();
      const catRegex = categoryMap[cleanCat] || new RegExp(cleanCat.replace(/-/g, '[ -]?'), 'i');
      andConditions.push({
        $or: [
          { category: catRegex },
          { name: catRegex },
          { description: catRegex }
        ]
      });
    }

    // Si hay búsqueda, tokenizar palabras para búsqueda flexible (ej. "camaras ip wifi")
    if (search) {
      const searchTokens = String(search)
        .trim()
        .split(/\s+/)
        .map(t => t.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ]/g, ''))
        .filter(t => t.length > 1);

      if (searchTokens.length > 0) {
        for (const token of searchTokens) {
          const r = new RegExp(token, 'i');
          andConditions.push({
            $or: [
              { name: r },
              { description: r },
              { syscomId: r },
              { category: r },
              { brand: r },
              { model: r }
            ]
          });
        }
      }
    }

    // Filtrar por marca si se especifica
    if (brand) {
      andConditions.push({ brand: new RegExp(String(brand).trim(), 'i') });
    }

    if (andConditions.length > 0) {
      filter.$and = andConditions;
    }

    // Filtrar por productos activos (por defecto)
    if (active !== 'false') {
      filter.active = active === 'true' || active === true;
    }
    
    // Calcular skip para paginación
    const pageNumber = parseInt(page) || 1;
    const limitNumber = parseInt(limit) || 20;
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

// Obtener un producto por ID (Mongo _id o syscomId)
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    let product = null;

    // 1. Si es un ObjectId válido de Mongo
    if (mongoose.Types.ObjectId.isValid(id)) {
      product = await Product.findById(id);
    }

    // 2. Si no se encontró por _id, buscar por syscomId o modelo
    if (!product) {
      product = await Product.findOne({
        $or: [
          { syscomId: id },
          { syscomId: new RegExp(`^${id}$`, 'i') },
          { model: id },
          { model: new RegExp(`^${id}$`, 'i') }
        ]
      });
    }

    // 3. Si sigue sin encontrarse, intentar obtenerlo directamente desde SYSCOM API y sincronizar
    if (!product && syscomService) {
      try {
        const syncRes = await syscomService.syncProduct(id);
        if (syncRes && syncRes.product) {
          product = syncRes.product;
        }
      } catch (syscomErr) {
        // Si falla en SYSCOM, continuar para responder 404
      }
    }

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