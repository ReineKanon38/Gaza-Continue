// Script para actualizar categorías de productos existentes
import './dns-fix.js';
import dotenv from 'dotenv';
import { connectDB } from './src/config/db.js';
import Product from './src/models/Product.js';
import { mapSyscomCategoryToPlatform } from './src/config/categoryMapping.js';

dotenv.config();

async function migrateCategoriesDatabase() {
  try {
    console.log('🔌 Conectando a MongoDB...');
    await connectDB();
    console.log('✅ Conectado\n');

    console.log('🔄 Migrando categorías de productos existentes...\n');

    // Obtener todos los productos
    const products = await Product.find({});
    console.log(`📦 Total productos encontrados: ${products.length}\n`);

    let updated = 0;
    let skipped = 0;
    const categoryChanges = {};

    for (const product of products) {
      const oldCategory = product.category;
      
      // Si la categoría ya es una categoría de la plataforma, saltarla
      const platformCategories = [
        'videovigilancia', 'audio-video', 'automatizacion', 'cableado',
        'control-acceso', 'deteccion-fuego', 'energia-herramientas',
        'iot-gps', 'radiocomunicacion', 'redes-it', 'robots-industrial'
      ];

      if (platformCategories.includes(oldCategory)) {
        skipped++;
        continue;
      }

      // Mapear la categoría antigua a la nueva
      const newCategory = mapSyscomCategoryToPlatform(oldCategory);

      if (oldCategory !== newCategory) {
        product.category = newCategory;
        await product.save();
        updated++;

        // Registrar cambio
        if (!categoryChanges[oldCategory]) {
          categoryChanges[oldCategory] = { newCategory, count: 0 };
        }
        categoryChanges[oldCategory].count++;
      } else {
        skipped++;
      }
    }

    console.log('\n' + '='.repeat(70));
    console.log('📊 RESULTADO DE MIGRACIÓN');
    console.log('='.repeat(70));
    console.log(`✅ Productos actualizados: ${updated}`);
    console.log(`⏭️  Productos sin cambios: ${skipped}`);
    console.log('='.repeat(70));

    if (Object.keys(categoryChanges).length > 0) {
      console.log('\n📋 Mapeo de categorías:');
      console.log('-'.repeat(70));
      Object.entries(categoryChanges)
        .sort((a, b) => b[1].count - a[1].count)
        .forEach(([oldCat, { newCategory, count }]) => {
          console.log(`  ${oldCat.padEnd(40)} → ${newCategory} (${count})`);
        });
      console.log('-'.repeat(70));
    }

    console.log('\n✅ Migración completada!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

migrateCategoriesDatabase();
