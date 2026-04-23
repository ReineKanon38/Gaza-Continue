import jwt from "jsonwebtoken";
import User from "../models/User.js";

const getJwtSecret = () => process.env.JWT_SECRET || "dev_secret_change_me";

export const requireAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.substring(7) : null;
  if (!token) {
    return res.status(401).json({ success: false, message: "No autenticado" });
  }
  try {
    const payload = jwt.verify(token, getJwtSecret());
    const userId = payload.sub || payload.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Token inválido o incompleto" });
    }
    // Cargar usuario para acceder a rol actualizado
    const user = await User.findById(userId).select('role name email');
    if (!user) {
      return res.status(401).json({ success: false, message: "Usuario no válido" });
    }
    req.user = {
      sub: userId,
      id: userId,
      email: payload.email || user.email,
      role: user.role,
      name: user.name
    };
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Token inválido o expirado" });
  }
};

export const requireRole = (roleRequired) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "No autenticado" });
    }

    if (req.user.role !== roleRequired) {
      return res.status(403).json({
        success: false,
        message: `Se requiere rol '${roleRequired}', tienes '${req.user.role}'`
      });
    }

    next();
  };
};


