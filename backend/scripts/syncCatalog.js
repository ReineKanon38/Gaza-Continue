// backend/scripts/syncCatalog.js
await import('../src/utils/dns-fix.js');

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import syscomClient from '../src/utils/syscomClient.js';
import Product from '../src/models/Product.js';
import { mapSyscomCategoryToPlatform } from '../src/config/categoryMapping.js';
import { convertUSDtoMXN } from '../src/config/currency.js';
import { connectDB } from '../src/config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

async function syncCatalog() {
  console.log('====================================================');
  console.log('🚀 SINCRONIZACIÓN DE CATÁLOGO SYSCOM -> MONGODB');
  console.log('====================================================');

  try {
    await connectDB();
    console.log(`💾 Base de datos conectada: ${mongoose.connection.name}`);

    const existingCount = await Product.countDocuments();
    console.log(`📊 Productos actuales en BD: ${existingCount}`);

    const searchTerms = [
      'camara', 'dvr', 'nvr', 'cable', 'switch', 'router',
      'panel', 'fuente', 'sensor', 'alarma', 'monitor', 'control',
      'hikvision', 'dahua', 'epcom', 'mikrotik', 'ubiquiti',
      'detector', 'sirena', 'ups', 'poe', 'wifi', 'antena',
      'disco duro', 'conector', 'bateria', 'gabinete', 'torniquete'
    ];

    const uniqueProductIds = new Set();
    console.log('\n🔍 Consultando IDs de productos en la API de SYSCOM...');

    for (const term of searchTerms) {
      for (let page = 1; page <= 6; page++) {
        try {
          const res = await syscomClient.searchProducts({
            query: term,
            pagina: page,
            limite: 50
          });

          if (!res.success) break;
          const items = res.data?.productos || res.data?.data || (Array.isArray(res.data) ? res.data : []);
          if (!items || items.length === 0) break;

          for (const item of items) {
            const pId = String(item.producto_id || item.id || '');
            if (pId) uniqueProductIds.add(pId);
          }

          if (uniqueProductIds.size >= 2500) break;
        } catch (err) {
          console.warn(`Aviso buscando "${term}" pág ${page}: ${err.message}`);
          break;
        }
      }
      if (uniqueProductIds.size >= 2500) break;
      process.stdout.write(`   ↳ Acumulados ${uniqueProductIds.size} IDs únicos...\r`);
    }

    console.log(`\n\n📦 Total de productos identificados para sincronizar: ${uniqueProductIds.size}`);
    console.log('⏳ Guardando/Actualizando productos en MongoDB...\n');

    let saved = 0;
    let failed = 0;
    const idsArray = Array.from(uniqueProductIds);

    for (let i = 0; i < idsArray.length; i++) {
      const productId = idsArray[i];
      try {
        const detailRes = await syscomClient.getProduct(productId);
        if (!detailRes.success || !detailRes.data) {
          failed++;
          continue;
        }

        const sp = detailRes.data;
        const priceUSD = parseFloat(sp.precios?.precio_descuento || sp.precio_descuento || sp.precios?.precio_lista || sp.precio_lista || 0);
        const priceMXN = convertUSDtoMXN(priceUSD);

        const categoryText = Array.isArray(sp.categorias) ? sp.categorias.map(c => c.nombre || c.name || c).join(' ') : (sp.categoria || '');
        const platformCategory = mapSyscomCategoryToPlatform(categoryText) || 'videovigilancia';

        const stock = parseInt(sp.existencia?.nuevo ?? sp.total_existencia ?? sp.existencia ?? 10) || 5;

        const productDoc = {
          syscomId: productId,
          name: sp.titulo || sp.nombre || sp.name || 'Producto SYSCOM',
          description: sp.descripcion || sp.titulo || '',
          price: priceMXN > 0 ? priceMXN : 100,
          category: platformCategory,
          brand: sp.marca || sp.brand || 'SYSCOM',
          model: sp.modelo || sp.model || productId,
          image: sp.img_portada || sp.imagen || sp.image || (Array.isArray(sp.imagenes) ? sp.imagenes[0]?.imagen : ''),
          stock: stock > 0 ? stock : 5,
          active: true
        };

        await Product.findOneAndUpdate(
          { syscomId: productId },
          { $set: productDoc },
          { upsert: true, new: true }
        );

        saved++;
        if (saved % 25 === 0 || saved === idsArray.length) {
          process.stdout.write(`   ✅ Progreso: ${saved}/${idsArray.length} productos sincronizados...\r`);
        }
      } catch (err) {
        failed++;
      }
    }

    const finalCount = await Product.countDocuments({ active: true });
    console.log('\n\n====================================================');
    console.log(`🎉 SINCRONIZACIÓN EXITOSA!`);
    console.log(`📊 Total de productos activos en BD: ${finalCount}`);
    console.log(`✅ Nuevos/Actualizados: ${saved} | ⚠️ Omitidos/Fallidos: ${failed}`);
    console.log('====================================================\n');

  } catch (error) {
    console.error('\n❌ ERROR fatal en sincronización:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

syncCatalog();
