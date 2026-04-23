// Script para probar la sincronización con límite reducido
import './dns-fix.js';
import dotenv from 'dotenv';
import syscomService from './src/services/syscomService.js';
import { connectDB } from './src/config/db.js';

dotenv.config();

async function testQuickSync() {
  try {
    console.log('🔌 Conectando a MongoDB...');
    await connectDB();
    console.log('✅ Conectado\n');

    console.log('🚀 Iniciando sincronización con límite de 50 productos...\n');
    
    const result = await syscomService.syncAllSuperPrecioByCategories({
      maxTotalProducts: 50 // Solo 50 productos para probar rápido
    });

    console.log('\n' + '='.repeat(60));
    console.log('📊 RESULTADO FINAL');
    console.log('='.repeat(60));
    console.log(`✅ Categorías encontradas: ${result.totalCategories}`);
    console.log(`✅ Total productos sincronizados: ${result.totalProductsSynced}`);
    console.log(`❌ Total productos fallidos: ${result.totalProductsFailed}`);
    console.log('='.repeat(60));
    
    if (result.categoriesDetails && result.categoriesDetails.length > 0) {
      console.log('\n📋 Detalle por categoría:');
      console.log('-'.repeat(60));
      result.categoriesDetails.forEach(detail => {
        console.log(`✅ ${detail.category}: ${detail.synced} productos`);
      });
      console.log('-'.repeat(60));
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

testQuickSync();
