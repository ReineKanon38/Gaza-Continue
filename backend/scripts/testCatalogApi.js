await import('../src/utils/dns-fix.js');

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import syscomService from '../src/services/syscomService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

console.log('Testing default Catalog search parameters...');

async function run() {
  const result = await syscomService.searchProducts({ page: 1, limit: 20 });
  console.log('Result Success:', result.success);
  console.log('Total:', result.total);
  const products = result.data?.productos || (Array.isArray(result.data) ? result.data : []);
  console.log('Products Count:', products.length);
  if (products.length > 0) {
    console.log('Sample Product:', products[0].name, '| Price:', products[0].price, '| Stock:', products[0].stock);
  } else {
    console.log('Full result:', JSON.stringify(result, null, 2));
  }
  process.exit(0);
}

run();
