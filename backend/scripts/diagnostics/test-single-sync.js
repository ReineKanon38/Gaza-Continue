// Script para probar sincronización de un producto individual
import '../../src/utils/dns-fix.js';
import dotenv from 'dotenv';
import syscomService from '../../src/services/syscomService.js';
import { connectDB } from '../../src/config/db.js';
import Product from '../../src/models/Product.js';

dotenv.config();

async function testSingleProduct() {
  try {
    console.log('🔌 Conectando a MongoDB...');
    await connectDB();
    console.log('✅ Conectado\n');

    // Producto de prueba: 215182 (Fuente de Poder HIKVISION)
    const productId = '215182';
    
    console.log(`🔄 Sincronizando producto ${productId}...\n`);
    
    const result = await syscomService.syncProduct(productId);
    
    console.log('✅ Resultado:', result.action);
    console.log('\n📦 Producto guardado:');
    console.log('- Nombre:', result.product.name);
    console.log('- Precio:', result.product.price);
    console.log('- Categoría:', result.product.category);
    console.log('- Stock:', result.product.stock);
    console.log('- SYSCOM ID:', result.product.syscomId);
    
    // Verificar en la base de datos
    const saved = await Product.findOne({ syscomId: productId });
    console.log('\n📁 Desde MongoDB:');
    console.log('- Categoría guardada:', saved.category);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

testSingleProduct();
