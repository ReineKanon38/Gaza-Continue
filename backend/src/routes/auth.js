// src/routes/auth.js
import express from "express";
import { loginUser, registerUser, updateProfile, requestPasswordReset, listUsers, updateUserRole, updateUserStatus, deleteUser } from "../controllers/authController.js";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/authorize.js";
import { validate } from "../middleware/validate.js";
import { registerSchema, loginSchema, updateProfileSchema, requestResetSchema } from "../validation/schemas.js";

const router = express.Router();

// Rutas públicas
router.post("/login", validate(loginSchema), loginUser);
router.post("/register", validate(registerSchema), registerUser);
router.post("/reset-password", validate(requestResetSchema), requestPasswordReset);

// Rutas protegidas
router.put("/update-profile", requireAuth, validate(updateProfileSchema), updateProfile);
router.get("/users", requireAuth, requireRole('admin'), listUsers);
router.put("/users/:id/role", requireAuth, requireRole('admin'), updateUserRole);
router.put("/users/:id/status", requireAuth, requireRole('admin'), updateUserStatus);
router.delete("/users/:id", requireAuth, requireRole('admin'), deleteUser);

export default router;
