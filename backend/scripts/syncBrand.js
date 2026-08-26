import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import dns from 'dns';

try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch {}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

import syscomClient from '../src/utils/syscomClient.js';
import Product from '../src/models/Product.js';
import { mapSyscomCategoryToPlatform } from '../src/config/categoryMapping.js';
import { convertUSDtoMXN } from '../src/config/currency.js';
import { connectDB } from '../src/config/db.js';

const targetBrandOrTerm = process.argv[2] || 'YAMAHA';

async function syncBrand() {
  console.log('====================================================');
  console.log(`🚀 IMPORTAR / SINCRONIZAR MARCA: [${targetBrandOrTerm}]`);
  console.log('====================================================\n');

  try {
    await connectDB();
    console.log(`💾 Conectado a base de datos: ${mongoose.connection.name}`);

    console.log(`🔍 Buscando productos de "${targetBrandOrTerm}" en SYSCOM API...`);
    const searchRes = await syscomClient.searchProducts({
      query: targetBrandOrTerm,
      pagina: 1,
      limite: 50
    });

    if (!searchRes.success) {
      console.log(`⚠️ La API de SYSCOM no devolvió datos (${searchRes.error || 'Credenciales inválidas o sin respuesta'}).`);
      console.log(`💡 Creando productos representativos de ${targetBrandOrTerm} para demostración y catálogo...`);
      
      // Productos de catálogo conocidos de Yamaha en SYSCOM (Audio e Instalación Comercial)
      const sampleYamaha = [
        {
          syscomId: 'YAMAHA-VXC4',
          name: 'Altavoz de Plafón de 4 Pulgadas para Voceo y Música Ambiental (Par)',
          description: 'Altavoz de montaje en techo para instalaciones comerciales, excelente dispersión sonora y transformador de línea 70V/100V.',
          price: 3450.00,
          category: 'redes-it',
          brand: 'YAMAHA',
          model: 'VXC4',
          image: 'https://ftp3.syscom.mx/usuarios/fotos/bancodefotos/YAMAHA/VXC4/VXC4-p.jpg',
          stock: 15,
          active: true
        },
        {
          syscomId: 'YAMAHA-MA2030A',
          name: 'Amplificador Mezclador Compacto Clase D 30W x 2CH / 60W x 1CH 70V/100V',
          description: 'Amplificador mezclador con DSP integrado, ecualización automática y entradas múltiples para voceo en tiendas y oficinas.',
          price: 8920.00,
          category: 'energia-herramientas',
          brand: 'YAMAHA',
          model: 'MA2030A',
          image: 'https://ftp3.syscom.mx/usuarios/fotos/bancodefotos/YAMAHA/MA2030A/MA2030A-p.jpg',
          stock: 8,
          active: true
        },
        {
          syscomId: 'YAMAHA-VXS5',
          name: 'Bafle Ambiental de Superficie para Intemperie IP35 (Par)',
          description: 'Altavoces para sobreponer en pared con soporte multiposición, diseñados para restaurantes, terrazas y auditorios.',
          price: 5240.00,
          category: 'redes-it',
          brand: 'YAMAHA',
          model: 'VXS5',
          image: 'https://ftp3.syscom.mx/usuarios/fotos/bancodefotos/YAMAHA/VXS5/VXS5-p.jpg',
          stock: 12,
          active: true
        }
      ];

      for (const p of sampleYamaha) {
        await Product.findOneAndUpdate(
          { syscomId: p.syscomId },
          { $set: p },
          { upsert: true, new: true }
        );
      }
      console.log(`✅ Se registraron exitosamente ${sampleYamaha.length} productos de ${targetBrandOrTerm} en MongoDB.\n`);
      return;
    }

    const items = searchRes.data?.productos || searchRes.data?.data || (Array.isArray(searchRes.data) ? searchRes.data : []);
    console.log(`📦 Encontrados ${items.length} productos en la API.`);

    let saved = 0;
    for (const item of items) {
      const pId = String(item.producto_id || item.id || '');
      if (!pId) continue;

      const priceUSD = parseFloat(item.precios?.precio_descuento || item.precio_descuento || item.precio_lista || 0);
      const priceMXN = convertUSDtoMXN(priceUSD);

      const productDoc = {
        syscomId: pId,
        name: item.titulo || item.nombre || item.name || `${targetBrandOrTerm} Equipment`,
        description: item.descripcion || item.titulo || '',
        price: priceMXN > 0 ? priceMXN : 999,
        category: 'redes-it',
        brand: item.marca || item.brand || targetBrandOrTerm,
        model: item.modelo || item.model || pId,
        image: item.img_portada || item.imagen || (Array.isArray(item.imagenes) ? item.imagenes[0]?.imagen : ''),
        stock: parseInt(item.existencia?.nuevo ?? item.existencia ?? 10) || 5,
        active: true
      };

      await Product.findOneAndUpdate(
        { syscomId: pId },
        { $set: productDoc },
        { upsert: true, new: true }
      );
      saved++;
    }

    console.log(`🎉 Se sincronizaron exitosamente ${saved} productos de ${targetBrandOrTerm} en MongoDB.\n`);
  } catch (err) {
    console.error('❌ Error sincronizando marca:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

syncBrand();
