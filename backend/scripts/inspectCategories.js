import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import dns from 'dns';

try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch {}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI;

const productSchema = new mongoose.Schema({
  name: String,
  category: String,
  brand: String,
  active: Boolean
}, { strict: false });

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

async function inspect() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('\n--- CATEGORÍAS REALES EN MONGODB ---');
    const categories = await Product.aggregate([
      { $group: { _id: '$category', total: { $sum: 1 } } },
      { $sort: { total: -1 } }
    ]);
    
    console.table(categories);
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await mongoose.disconnect();
  }
}

inspect();
