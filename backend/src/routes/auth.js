// src/routes/auth.js
import express from "express";
import {
	loginUser,
	registerUser,
	getUserProfile,
	updateProfile,
	refreshSession,
	logoutSession,
	requestPasswordReset,
	resetPassword,
	generate2fa,
	verify2fa,
	getSavedShippingAddress,
	updateSavedShippingAddress,
	listUsers,
	updateUserRole,
	updateUserStatus,
	deleteUser,
	sendPromoEmail
} from "../controllers/authController.js";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/authorize.js";
import { validate } from "../middleware/validate.js";
import { registerSchema, loginSchema, updateProfileSchema, requestResetSchema, shippingAddressSchema, refreshSessionSchema, logoutSessionSchema } from "../validation/schemas.js";

const router = express.Router();

// Rutas públicas
router.post("/login", validate(loginSchema), loginUser);
router.post("/register", validate(registerSchema), registerUser);
router.post("/reset-password", validate(requestResetSchema), requestPasswordReset);
router.post("/reset-password/:token", resetPassword);
router.post('/refresh', validate(refreshSessionSchema), refreshSession);

// Rutas protegidas
router.get('/me', requireAuth, getUserProfile);
router.post('/2fa/generate', requireAuth, generate2fa);
router.post('/2fa/verify', requireAuth, verify2fa);
router.post('/logout', requireAuth, validate(logoutSessionSchema), logoutSession);
router.put("/update-profile", requireAuth, validate(updateProfileSchema), updateProfile);
router.get('/shipping-address', requireAuth, getSavedShippingAddress);
router.put('/shipping-address', requireAuth, validate(shippingAddressSchema), updateSavedShippingAddress);
router.get("/users", requireAuth, requireRole('admin'), listUsers);
router.put("/users/:id/role", requireAuth, requireRole('admin'), updateUserRole);
router.put("/users/:id/status", requireAuth, requireRole('admin'), updateUserStatus);
router.delete("/users/:id", requireAuth, requireRole('admin'), deleteUser);
router.post("/send-promo-email", requireAuth, requireRole('admin'), sendPromoEmail);

export default router;
