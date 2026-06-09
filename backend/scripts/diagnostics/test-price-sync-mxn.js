// Script para probar sincronización con precios en MXN
import './dns-fix.js';
import dotenv from 'dotenv';
import syscomService from './src/services/syscomService.js';
import { connectDB } from './src/config/db.js';
import { formatPriceMXN } from './src/config/currency.js';

dotenv.config();

async function testPriceSyncMXN() {
  try {
    console.log('🔌 Conectando a MongoDB...');
    await connectDB();
    console.log('✅ Conectado\n');

    // Producto de prueba: 215182 (Fuente de Poder HIKVISION)
    const productId = '215182';
    
    console.log(`🔄 Sincronizando producto ${productId}...\n`);
    
    const result = await syscomService.syncProduct(productId);
    
    console.log('='.repeat(70));
    console.log('✅ PRODUCTO SINCRONIZADO CON PRECIOS EN MXN');
    console.log('='.repeat(70));
    console.log(`Acción: ${result.action}`);
    console.log(`\n📦 ${result.product.name}`);
    console.log('-'.repeat(70));
    console.log(`💵 Precio: ${formatPriceMXN(result.product.price)} MXN`);
    console.log(`📁 Categoría: ${result.product.category}`);
    console.log(`📦 Stock: ${result.product.stock} unidades`);
    console.log(`🆔 SYSCOM ID: ${result.product.syscomId}`);
    console.log('='.repeat(70));
    
    console.log('\n💡 Los nuevos productos se sincronizan con precios en MXN ✅\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

testPriceSyncMXN();
