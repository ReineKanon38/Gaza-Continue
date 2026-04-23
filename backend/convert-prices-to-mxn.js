// Script para convertir precios de USD a MXN en productos existentes
import './dns-fix.js';
import dotenv from 'dotenv';
import { connectDB } from './src/config/db.js';
import Product from './src/models/Product.js';
import { convertUSDtoMXN, formatPriceMXN } from './src/config/currency.js';

dotenv.config();

async function convertPricesToMXN() {
  try {
    console.log('🔌 Conectando a MongoDB...');
    await connectDB();
    console.log('✅ Conectado\n');

    console.log('💱 Convirtiendo precios de USD a MXN...\n');
    console.log('Tipo de cambio: 1 USD = 17.5 MXN\n');
    console.log('='.repeat(80));

    // Obtener todos los productos con syscomId (productos de SYSCOM)
    const products = await Product.find({ syscomId: { $exists: true } });
    
    console.log(`📦 Total productos de SYSCOM encontrados: ${products.length}\n`);

    let updated = 0;
    let skipped = 0;
    const examples = [];

    for (const product of products) {
      const oldPriceUSD = product.price;
      
      // Verificar si el precio parece estar en USD (menos de 1000)
      // Los precios en MXN serían mucho más altos
      if (oldPriceUSD < 1000) {
        const newPriceMXN = convertUSDtoMXN(oldPriceUSD);
        product.price = newPriceMXN;
        await product.save();
        updated++;

        // Guardar algunos ejemplos
        if (examples.length < 5) {
          examples.push({
            name: product.name.substring(0, 50),
            oldPrice: oldPriceUSD,
            newPrice: newPriceMXN
          });
        }
      } else {
        skipped++;
      }
    }

    console.log('\n📊 EJEMPLOS DE CONVERSIÓN:');
    console.log('-'.repeat(80));
    examples.forEach(ex => {
      console.log(`${ex.name}...`);
      console.log(`  USD: $${ex.oldPrice.toFixed(2)} → MXN: ${formatPriceMXN(ex.newPrice)}`);
      console.log();
    });

    console.log('='.repeat(80));
    console.log('✅ RESULTADO DE LA CONVERSIÓN');
    console.log('='.repeat(80));
    console.log(`✅ Productos actualizados: ${updated}`);
    console.log(`⏭️  Productos omitidos (ya en MXN): ${skipped}`);
    console.log('='.repeat(80));

    // Verificar algunos precios actualizados
    console.log('\n🔍 Verificación de precios actualizados:');
    const samples = await Product.find({ syscomId: { $exists: true } })
      .limit(5)
      .select('name price category');
    
    console.log('-'.repeat(80));
    samples.forEach(product => {
      console.log(`${product.name.substring(0, 50)}...`);
      console.log(`  Precio: ${formatPriceMXN(product.price)} MXN | Categoría: ${product.category}`);
      console.log();
    });
    console.log('-'.repeat(80));

    console.log('\n✅ Conversión completada!\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

convertPricesToMXN();
