// Fix DNS PRIMERO (para Windows)
import './dns-fix.js';

import dotenv from 'dotenv';
import { connectDB } from './src/config/db.js';
import syscomService from './src/services/syscomService.js';

dotenv.config();

async function testSuperPrecio() {
  try {
    console.log('\n🧪 === PRUEBA DE SÚPER PRECIO ===\n');
    
    await connectDB();
    console.log('✅ Conectado a MongoDB\n');

    // 1. Obtener etiquetas disponibles
    console.log('📋 Paso 1: Obteniendo etiquetas disponibles...');
    const tagsResult = await syscomService.getTags();
    if (tagsResult.success) {
      console.log('✅ Etiquetas encontradas:');
      console.log(tagsResult.data);
    } else {
      console.log('⚠️  No se pudieron obtener etiquetas');
    }

    console.log('\n---\n');

    // 2. Obtener categorías
    console.log('📋 Paso 2: Obteniendo categorías...');
    const categoriesResult = await syscomService.getCategories();
    if (categoriesResult.success) {
      const cats = Array.isArray(categoriesResult.data) 
        ? categoriesResult.data.slice(0, 5) 
        : [];
      console.log(`✅ ${cats.length} categorías encontradas (mostrando primeras 5):`);
      cats.forEach(cat => {
        console.log(`   - ${cat.nombre || cat.name || cat}`);
      });
    } else {
      console.log('⚠️  No se pudieron obtener categorías');
    }

    console.log('\n---\n');

    // 3. Obtener productos de Súper Precio
    console.log('📋 Paso 3: Obteniendo productos de Súper Precio...');
    console.log('   (Usando búsqueda automática con filtro de etiqueta)');
    
    const superPrecioResult = await syscomService.getSuperPrecioProducts({ 
      limit: 10,
      page: 1
    });

    if (superPrecioResult.success) {
      let productos = [];
      
      if (superPrecioResult.data.productos) {
        productos = superPrecioResult.data.productos;
      } else if (Array.isArray(superPrecioResult.data)) {
        productos = superPrecioResult.data;
      } else if (superPrecioResult.data.data) {
        productos = superPrecioResult.data.data;
      }

      console.log(`✅ ${productos.length} productos de Súper Precio encontrados\n`);
      
      if (productos.length > 0) {
        console.log('📦 Primeros 3 productos:');
        productos.slice(0, 3).forEach((prod, idx) => {
          console.log(`\n   ${idx + 1}. ${prod.titulo || prod.nombre}`);
          console.log(`      ID: ${prod.producto_id || prod.id}`);
          console.log(`      Precio: $${prod.precio_lista || prod.precio}`);
          console.log(`      Stock: ${prod.existencia?.nuevo || prod.stock || 0}`);
        });

        console.log('\n---\n');

        // 4. Sincronizar primeros 3 productos
        console.log('📋 Paso 4: Sincronizando primeros 3 productos...');
        const syncResult = await syscomService.syncSuperPrecioProducts({ 
          limit: 3,
          page: 1 
        });

        if (syncResult.success) {
          console.log(`✅ ${syncResult.message}`);
          console.log(`\n   Sincronizados: ${syncResult.synced}`);
          console.log(`   Fallidos: ${syncResult.failed}\n`);
          
          if (syncResult.details && syncResult.details.length > 0) {
            console.log('   Detalles:');
            syncResult.details.forEach(detail => {
              if (!detail.error) {
                console.log(`   ✅ ${detail.name} (${detail.action})`);
              } else {
                console.log(`   ❌ ${detail.id}: ${detail.error}`);
              }
            });
          }
        } else {
          console.log('❌ Error en sincronización:', syncResult.message);
        }
      } else {
        console.log('⚠️  No hay productos de Súper Precio disponibles actualmente');
        console.log('    Esto puede deberse a:');
        console.log('    - SYSCOM no tiene productos con esta etiqueta hoy');
        console.log('    - La etiqueta cambió de nombre');
        console.log('    - Necesitas buscar en páginas diferentes');
      }
    } else {
      console.log('❌ Error al obtener productos:', superPrecioResult.message);
    }

    console.log('\n\n🎉 === PRUEBA COMPLETADA ===\n');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error durante la prueba:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

testSuperPrecio();
