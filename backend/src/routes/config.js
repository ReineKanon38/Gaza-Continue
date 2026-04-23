import express from 'express';
import {
  getSystemConfig,
  updatePaymentMethods,
  updateShippingMethods
} from '../controllers/configController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import {
  updatePaymentMethodsSchema,
  updateShippingMethodsSchema
} from '../validation/schemas.js';

const router = express.Router();

router.use(requireAuth, requireRole('admin'));

router.get('/', getSystemConfig);
router.put('/payment-methods', validate(updatePaymentMethodsSchema), updatePaymentMethods);
router.put('/shipping-methods', validate(updateShippingMethodsSchema), updateShippingMethods);

export default router;
