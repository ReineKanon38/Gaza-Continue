import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Order from '../src/models/Order.js';
import Product from '../src/models/Product.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

async function cleanup() {
  try {
    const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/syscom-gaza";
    console.log("Conectando a la base de datos...");
    await mongoose.connect(MONGO_URI);
    console.log("Conectado a MongoDB");

    console.log("Obteniendo todos los IDs de productos referenciados en órdenes...");
    const orders = await Order.find({}, 'products.product');
    const usedProductIds = new Set();
    
    orders.forEach(order => {
      if (order.products && Array.isArray(order.products)) {
        order.products.forEach(item => {
          if (item.product) {
            usedProductIds.add(item.product.toString());
          }
        });
      }
    });
    
    const usedIdsArray = Array.from(usedProductIds);
    console.log(`Se encontraron ${usedIdsArray.length} productos únicos referenciados en órdenes.`);

    console.log("Borrando productos que NO están referenciados...");
    const deleteResult = await Product.deleteMany({
      _id: { $nin: usedIdsArray }
    });

    console.log(`Limpieza completada. Se eliminaron ${deleteResult.deletedCount} productos inactivos de la base de datos.`);
    
  } catch (error) {
    console.error("Error durante la limpieza de productos:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Desconectado de MongoDB.");
  }
}

cleanup();
