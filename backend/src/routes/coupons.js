import express from 'express';
import {
  getAllCoupons,
  validateCoupon,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  applyCoupon
} from '../controllers/couponController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Rutas públicas
router.post('/validate', validateCoupon);
router.post('/apply', applyCoupon);

// Rutas protegidas (solo admin)
router.get('/', requireAuth, requireRole('admin'), getAllCoupons);
router.post('/', requireAuth, requireRole('admin'), createCoupon);
router.put('/:id', requireAuth, requireRole('admin'), updateCoupon);
router.delete('/:id', requireAuth, requireRole('admin'), deleteCoupon);

export default router;
