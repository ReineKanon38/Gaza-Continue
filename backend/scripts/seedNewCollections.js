import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Category from '../src/models/Category.js';
import Coupon from '../src/models/Coupon.js';
import { connectDB } from '../src/config/db.js';

dotenv.config();

async function seedNewCollections() {
  try {
    await connectDB();
    console.log('📊 Sembrando nuevas colecciones...');

    // Limpiar colecciones
    await Category.deleteMany({});
    await Coupon.deleteMany({});
    console.log('✅ Colecciones limpiadas');

    // Crear categorías
    const categories = await Category.insertMany([
      {
        name: 'Networking',
        description: 'Equipos de redes y conectividad para empresas',
        active: true
      },
      {
        name: 'Videovigilancia',
        description: 'Cámaras IP y sistemas de monitoreo profesional',
        active: true
      },
      {
        name: 'Servidores',
        description: 'Servidores dedicados y equipos de cómputo profesional',
        active: true
      },
      {
        name: 'Storage',
        description: 'Almacenamiento y sistemas NAS de alta capacidad',
        active: true
      },
      {
        name: 'Accesorios',
        description: 'Cables, conectores y accesorios diversos',
        active: true
      }
    ]);
    console.log(`✅ ${categories.length} categorías creadas`);

    // Crear cupones
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + 3); // 3 meses

    const coupons = await Coupon.insertMany([
      {
        code: 'DESCUENTO10',
        description: 'Descuento del 10% en toda la tienda',
        type: 'percentage',
        discount: 10,
        maxUses: 100,
        usedCount: 0,
        minOrderAmount: 500,
        expiryDate,
        active: true
      },
      {
        code: 'ENVIOGRATIS',
        description: 'Envío gratis en órdenes mayores a $1000',
        type: 'fixed',
        discount: 0,
        maxUses: 200,
        usedCount: 0,
        minOrderAmount: 1000,
        expiryDate,
        active: true
      },
      {
        code: 'MAYO20',
        description: 'Descuento de 20% en mayo',
        type: 'percentage',
        discount: 20,
        maxUses: 50,
        usedCount: 15,
        minOrderAmount: 1000,
        expiryDate,
        active: true
      },
      {
        code: 'BLACKFRIDAY',
        description: 'Descuento especial Black Friday',
        type: 'percentage',
        discount: 50,
        maxUses: 25,
        usedCount: 25,
        minOrderAmount: 500,
        expiryDate: new Date('2025-11-30'),
        active: false
      }
    ]);
    console.log(`✅ ${coupons.length} cupones creados`);

    console.log('\n✨ Seeding completado exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error durante seeding:', error);
    process.exit(1);
  }
}

seedNewCollections();
