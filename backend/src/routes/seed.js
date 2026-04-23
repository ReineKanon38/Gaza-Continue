import express from 'express';
import { createTestUsers, getAllUsers } from '../controllers/seedController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Ruta para crear usuarios de prueba (sin auth para desarrollo)
router.post('/create-users', createTestUsers);

// Ruta para obtener todos los usuarios (requiere auth de admin)
router.get('/users', requireAuth, getAllUsers);

export default router;