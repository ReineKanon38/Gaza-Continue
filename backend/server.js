import "./src/utils/dns-fix.js";
import dotenv from "dotenv";
dotenv.config();

import app from "./src/app.js";
import { connectDB } from "./src/config/db.js";
import { allowedCorsOrigins } from "./src/config/cors.js";
import cronService from "./src/services/cronService.js";

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
      console.log(`🌐 CORS habilitado para: ${Array.isArray(allowedCorsOrigins) ? allowedCorsOrigins.join(', ') : allowedCorsOrigins}`);
      console.log(`📘 Swagger docs disponibles en /api/docs`);
      
      // Initialize Cron Jobs
      cronService.init();
    });
  } catch (err) {
    console.error("❌ No se pudo iniciar el servidor:", err.message);
    process.exit(1);
  }
}

start();
