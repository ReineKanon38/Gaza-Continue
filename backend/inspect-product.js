// Script para inspeccionar la estructura de productos de SYSCOM
import './dns-fix.js';
import dotenv from 'dotenv';
import syscomClient from './src/utils/syscomClient.js';

dotenv.config();

async function inspectProductstructure() {
  try {
    console.log('🔍 Obteniendo productos de Súper Precio...\n');
    
    const result = await syscomClient.searchProducts({
      query: 'camara',
      etiqueta: 'Super Precio',
      limite: 3
    });

    if (!result.success) {
      console.error('❌ Error:', result.error);
      return;
    }

    let products = [];
    if (result.data.productos) {
      products = result.data.productos;
    } else if (Array.isArray(result.data)) {
      products = result.data;
    } else if (result.data.data) {
      products = result.data.data;
    }

    console.log(`✅ Productos encontrados: ${products.length}\n`);
    console.log('='.repeat(80));
    console.log('ESTRUCTURA DEL PRIMER PRODUCTO:');
    console.log('='.repeat(80));
    console.log(JSON.stringify(products[0], null, 2));
    console.log('='.repeat(80));
    
    console.log('\n📋 Campos disponibles:');
    console.log(Object.keys(products[0]).join(', '));
    
    console.log('\n📁 Campo categoría:');
    console.log('- categoria:', products[0].categoria);
    console.log('- categorias:', products[0].categorias);
    console.log('- category:', products[0].category);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

inspectProductstructure();
