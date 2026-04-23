// Script para probar la sincronización completa de Súper Precio por categorías
import './dns-fix.js';
import dotenv from 'dotenv';
import syscomService from './src/services/syscomService.js';
import { connectDB } from './src/config/db.js';

dotenv.config();

async function testSyncAll() {
  try {
    console.log('🔌 Conectando a MongoDB...');
    await connectDB();
    console.log('✅ Conectado\n');

    console.log('🚀 Iniciando sincronización completa de Súper Precio por categorías...\n');
    console.log('⏱️  Esto puede tardar varios minutos...\n');
    
    const result = await syscomService.syncAllSuperPrecioByCategories({
      limitPerCategory: 100 // 100 productos por cada categoría
    });

    console.log('\n' + '='.repeat(60));
    console.log('📊 RESULTADO FINAL');
    console.log('='.repeat(60));
    console.log(`✅ Categorías procesadas: ${result.processedCategories}/${result.totalCategories}`);
    console.log(`✅ Total productos sincronizados: ${result.totalProductsSynced}`);
    console.log(`❌ Total productos fallidos: ${result.totalProductsFailed}`);
    console.log('='.repeat(60));
    
    console.log('\n📋 Detalle por categoría:');
    console.log('-'.repeat(60));
    if (result.categoriesDetails && result.categoriesDetails.length > 0) {
      result.categoriesDetails.forEach(detail => {
        if (detail.status === 'success') {
          console.log(`✅ ${detail.category}: ${detail.synced} sincronizados de ${detail.totalFound} encontrados`);
        } else {
          console.log(`❌ ${detail.category}: ERROR - ${detail.error}`);
        }
      });
    } else {
      console.log('No se procesaron categorías');
    }
    console.log('-'.repeat(60));

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

testSyncAll();
