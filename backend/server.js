import swaggerUi from "swagger-ui-express";
import fs from "fs";
import path from "path";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import app from "./src/app.js";
import authRoutes from "./src/routes/auth.js";
import productsRoutes from "./src/routes/products.js";
import ordersRoutes from "./src/routes/orders.js";
import statsRoutes from "./src/routes/stats.js";
import seedRoutes from "./src/routes/seed.js";
import paymentRoutes from "./src/routes/payment.js";
import categoriesRoutes from "./src/routes/categories.js";
import couponsRoutes from "./src/routes/coupons.js";
import inventoryRoutes from "./src/routes/inventory.js";
import { connectDB } from "./src/config/db.js";
import { allowedCorsOrigins, corsOptions } from "./src/config/cors.js";
import { errorHandler } from "./src/middleware/errorHandler.js";

dotenv.config();

// const app = express(); // Removed as we are using the imported app

// Middlewares de seguridad y parsing
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json());

// Rate limit básico para rutas API
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: 'draft-7',
  legacyHeaders: false
});
app.use('/api', apiLimiter);

// Ruta de prueba (para comprobar que el backend funciona)
app.get("/", (req, res) => {
  res.send("✅ Backend del proyecto SYSCOM-GAZA funcionando correctamente");
});

// Rutas API
app.use("/api/auth", authRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/seed", seedRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/coupons", couponsRoutes);
app.use("/api/inventory", inventoryRoutes);

// Swagger Docs
try {
  const specPath = path.resolve("./src/docs/openapi.json");
  const raw = fs.readFileSync(specPath, "utf-8");
  const spec = JSON.parse(raw);
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(spec));
  console.log('📘 Swagger docs disponibles en /api/docs');
} catch (e) {
  console.warn('⚠️ No se pudo cargar OpenAPI spec:', e.message);
}

// Middleware central de errores (después de las rutas)
app.use(errorHandler);

// Configuración del puerto
const PORT = process.env.PORT || 5000;

// Iniciar servidor
async function start() {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
      console.log(`🌐 CORS habilitado para: ${Array.isArray(allowedCorsOrigins) ? allowedCorsOrigins.join(', ') : allowedCorsOrigins}`);
    });
  } catch (err) {
    console.error("❌ No se pudo iniciar el servidor:", err.message);
    process.exit(1);
  }
}

start();
