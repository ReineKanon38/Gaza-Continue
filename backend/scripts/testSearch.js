// Fix DNS primero (para Windows)
await import('../src/utils/dns-fix.js');

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import syscomService from '../src/services/syscomService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

console.log('====================================================');
console.log('🔍 PRUEBA DE BÚSQUEDA Y CONSUMO DE API SYSCOM');
console.log('====================================================');

async function testSearchQueries() {
  const testQueries = [
    { name: 'Búsqueda por Palabra Clave ("camara")', params: { query: 'camara', page: 1, limit: 5 } },
    { name: 'Búsqueda por Marca ("Hikvision")', params: { query: 'Hikvision', page: 1, limit: 5 } },
    { name: 'Búsqueda por Marca ("Epcom")', params: { query: 'Epcom', page: 1, limit: 5 } },
    { name: 'Búsqueda por ID / Modelo ("DS-2CE56D0T")', params: { query: 'DS-2CE56D0T', page: 1, limit: 5 } }
  ];

  for (const test of testQueries) {
    console.log(`\n⏳ Ejecutando: ${test.name}...`);
    try {
      const res = await syscomService.searchProducts(test.params);
      if (res.success) {
        const rawProds = Array.isArray(res.data) ? res.data : (res.data?.productos || []);
        console.log(`✅ Éxito | Total encontrados: ${res.total} | Retornados: ${rawProds.length}`);
        if (rawProds.length > 0) {
          const sample = rawProds[0];
          console.log(`   📌 Ejemplo: [${sample.syscomId}] ${sample.name} - $${sample.price} MXN (Marca: ${sample.distributor || 'N/A'})`);
        }
      } else {
        console.log(`❌ Falló la búsqueda: ${res.message}`);
      }
    } catch (err) {
      console.log(`❌ Error: ${err.message}`);
    }
  }

  console.log('\n====================================================');
  console.log('✅ Pruebas de consumo finalizadas.');
  console.log('====================================================');
  process.exit(0);
}

testSearchQueries();
