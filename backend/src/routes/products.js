// src/routes/products.js
import express from "express";
import { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct } from "../controllers/productController.js";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/authorize.js";
import { validate } from "../middleware/validate.js";
import { createProductSchema } from "../validation/schemas.js";

const router = express.Router();

// GET /api/products - Obtener todos los productos
router.get("/", getAllProducts);

// GET /api/products/:id - Obtener un producto por ID
router.get("/:id", getProductById);

// POST /api/products - Crear un nuevo producto (protegido)
router.post("/", requireAuth, requireRole('admin'), validate(createProductSchema), createProduct);

// PUT /api/products/:id - Actualizar producto (admin)
router.put("/:id", requireAuth, requireRole('admin'), validate(createProductSchema.partial()), updateProduct);

// DELETE /api/products/:id - Eliminar producto (admin)
router.delete("/:id", requireAuth, requireRole('admin'), deleteProduct);

export default router;