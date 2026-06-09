// Script para verificar precios de SYSCOM
import './dns-fix.js';
import dotenv from 'dotenv';
import syscomClient from './src/utils/syscomClient.js';

dotenv.config();

async function checkPrices() {
  try {
    console.log('🔍 Verificando precios de SYSCOM...\n');
    
    const result = await syscomClient.searchProducts({
      query: 'camara',
      etiqueta: 'Super Precio',
      limite: 3
    });

    if (!result.success) {
      console.error('❌ Error:', result.error);
      return;
    }

    let products = result.data.productos || result.data.data || result.data;

    console.log('📊 PRECIOS DE 3 PRODUCTOS DE EJEMPLO:\n');
    console.log('='.repeat(80));

    products.slice(0, 3).forEach((product, index) => {
      console.log(`\n${index + 1}. ${product.titulo || product.nombre}`);
      console.log('-'.repeat(80));
      console.log('Precios objeto completo:', JSON.stringify(product.precios, null, 2));
      console.log('\nPrecios individuales:');
      console.log('  precio_descuento:', product.precio_descuento);
      console.log('  precio_lista:', product.precio_lista);
      console.log('  precio:', product.precio);
      if (product.precios) {
        console.log('\nPrecios anidados:');
        console.log('  precios.precio_descuento:', product.precios.precio_descuento);
        console.log('  precios.precio_lista:', product.precios.precio_lista);
        console.log('  precios.precio_1:', product.precios.precio_1);
        console.log('  precios.precio_especial:', product.precios.precio_especial);
      }
      console.log('\n' + '='.repeat(80));
    });

    console.log('\n💡 CONCLUSIÓN:');
    console.log('Los precios de SYSCOM están en DÓLARES USD');
    console.log('Necesitamos convertir a PESOS MEXICANOS (MXN)');
    console.log('\n📌 Tipo de cambio aproximado: 1 USD = 17-18 MXN');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkPrices();
