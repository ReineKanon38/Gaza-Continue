// Script para probar el mapeo de categorías
import './dns-fix.js';
import dotenv from 'dotenv';
import syscomService from './src/services/syscomService.js';
import { connectDB } from './src/config/db.js';
import Product from './src/models/Product.js';

dotenv.config();

async function testCategoryMapping() {
  try {
    console.log('🔌 Conectando a MongoDB...');
    await connectDB();
    console.log('✅ Conectado\n');

    console.log('🚀 Probando mapeo de categorías con 20 productos...\n');
    
    const result = await syscomService.syncAllSuperPrecioByCategories({
      maxTotalProducts: 20
    });

    console.log('\n' + '='.repeat(70));
    console.log('📊 RESULTADO DEL MAPEO DE CATEGORÍAS');
    console.log('='.repeat(70));
    console.log(`✅ Total productos sincronizados: ${result.totalProductsSynced}`);
    console.log(`✅ Categorías con productos: ${result.totalCategories}`);
    console.log('='.repeat(70));
    
    if (result.categoriesDetails && result.categoriesDetails.length > 0) {
      console.log('\n📋 Distribución por categoría de la plataforma:');
      console.log('-'.repeat(70));
      result.categoriesDetails
        .sort((a, b) => b.synced - a.synced)
        .forEach(detail => {
          console.log(`  ${detail.category.padEnd(40)} ${detail.synced} productos`);
        });
      console.log('-'.repeat(70));
    }

    // Verificar algunos productos en la base de datos
    console.log('\n🔍 Muestra de productos sincronizados:');
    console.log('-'.repeat(70));
    const sampleProducts = await Product.find({ syscomId: { $exists: true } })
      .limit(5)
      .select('name category price');
    
    sampleProducts.forEach(product => {
      console.log(`  📦 ${product.name.substring(0, 50)}...`);
      console.log(`     Categoría: ${product.category} | Precio: $${product.price}`);
      console.log();
    });
    console.log('-'.repeat(70));

    console.log('\n✅ Prueba completada exitosamente!');
    console.log('\n💡 Las categorías de SYSCOM se mapearon a las categorías de la plataforma.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

testCategoryMapping();
