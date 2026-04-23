import express from 'express';
import {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
} from '../controllers/categoryController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/authorize.js';

const router = express.Router();

// Rutas públicas
router.get('/', getAllCategories);
router.get('/:id', getCategoryById);

// Rutas protegidas (solo admin)
router.post('/', requireAuth, requireRole('admin'), createCategory);
router.put('/:id', requireAuth, requireRole('admin'), updateCategory);
router.delete('/:id', requireAuth, requireRole('admin'), deleteCategory);

export default router;
