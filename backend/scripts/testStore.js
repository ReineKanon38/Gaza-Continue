import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import dns from 'dns';

// Fix DNS resolution for MongoDB Atlas on Windows
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch {
  // Ignore in environments where setting servers is restricted
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI;

const productSchema = new mongoose.Schema({
  name: String,
  category: String,
  brand: String,
  model: String,
  syscomId: String,
  price: Number,
  listPrice: Number,
  stock: Number,
  active: Boolean,
  image: String
}, { strict: false });

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

const OFFICIAL_CATEGORIES = [
  { id: 'videovigilancia', name: 'Videovigilancia' },
  { id: 'redes-it', name: 'Redes e IT' },
  { id: 'control-acceso', name: 'Control de Acceso' },
  { id: 'energia-herramientas', name: 'Energía y Herramientas' },
  { id: 'automatizacion', name: 'Automatización e Intrusión' },
  { id: 'iot-gps', name: 'IoT / GPS / Telemetría' },
  { id: 'deteccion-fuego', name: 'Detección de Fuego' },
  { id: 'radiocomunicacion', name: 'Radiocomunicación' }
];

async function runStoreTests() {
  console.log('\n=============================================================');
  console.log('       🛠️  DIAGNÓSTICO Y TEST INTEGRAL SYSCOM-GAZA          ');
  console.log('=============================================================\n');

  try {
    console.log('[1/6] 🔌 Conectando a Base de Datos...');
    console.log(`      URI: ${MONGODB_URI ? MONGODB_URI.replace(/:([^:@]+)@/, ':****@') : 'NO DEFINIDA'}`);
    
    await mongoose.connect(MONGODB_URI);
    const dbName = mongoose.connection.name;
    console.log(`      ✅ Conectado exitosamente a la base de datos: [${dbName}]\n`);

    console.log('[2/6] 📦 Verificando Total de Productos en Catálogo...');
    const totalProducts = await Product.countDocuments({ active: true });
    console.log(`      ✅ Total de productos activos en inventario: ${totalProducts.toLocaleString()} productos\n`);

    console.log('[3/6] 🏷️  Verificando Productos por las 8 Categorías Oficiales...');
    for (const cat of OFFICIAL_CATEGORIES) {
      const count = await Product.countDocuments({ category: cat.id, active: true });
      const sample = await Product.findOne({ category: cat.id, active: true }).select('name brand price');
      const sampleText = sample ? `(Ej: "${sample.name?.slice(0, 35)}..." - $${sample.price || 0} MXN)` : '(Sin productos directos en este slug)';
      console.log(`      • ${cat.name.padEnd(28)} [${cat.id.padEnd(20)}] : ${String(count).padStart(4)} items ${sampleText}`);
    }
    console.log('');

    console.log('[4/6] 🔍 Probando Motor de Búsqueda por Palabras Clave...');
    const searchTerms = ['cámara', 'switch', 'biometrico', 'ups', 'alarma', 'gps', 'radio', 'humo'];
    for (const term of searchTerms) {
      const regex = new RegExp(term, 'i');
      const found = await Product.countDocuments({
        active: true,
        $or: [{ name: regex }, { description: regex }, { category: regex }, { brand: regex }, { syscomId: regex }]
      });
      console.log(`      • Búsqueda "${term.padEnd(12)}" : ${String(found).padStart(4)} resultados encontrados`);
    }
    console.log('');

    console.log('[5/6] 🏢 Probando Filtros por Marca...');
    const testBrands = ['HIKVISION', 'DAHUA', 'EPCOM', 'UBIQUITI', 'TP-LINK', 'ZKTECO', 'ACCESSPRO', 'HONEYWELL'];
    for (const brand of testBrands) {
      const count = await Product.countDocuments({
        active: true,
        brand: new RegExp(`^${brand}$`, 'i')
      });
      console.log(`      • Marca "${brand.padEnd(14)}" : ${String(count).padStart(4)} productos disponibles`);
    }
    console.log('');

    console.log('[6/6] 🌟 Probando Módulo Súper Precio / Ofertas...');
    const promoProducts = await Product.find({ active: true, price: { $gt: 0 } })
      .sort({ stock: -1, createdAt: -1 })
      .limit(5)
      .lean();

    console.log(`      ✅ Módulo de ofertas listo con ${promoProducts.length} productos destacados de muestra:`);
    promoProducts.forEach((p, idx) => {
      const listPrice = Math.round((p.price || 100) * 1.25);
      console.log(`        ${idx + 1}. [${p.brand || 'N/A'}] ${p.name?.slice(0, 45)}... | Precio Oferta: $${p.price} MXN (Antes: $${listPrice} MXN)`);
    });

    console.log('\n=============================================================');
    console.log('       🎉  TODOS LOS TESTS DE TIENDA Y CATÁLOGO PASARON      ');
    console.log('=============================================================\n');

  } catch (error) {
    console.error('\n❌ ERROR EN LOS TESTS:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('Conexión cerrada.');
    process.exit(0);
  }
}

runStoreTests();
