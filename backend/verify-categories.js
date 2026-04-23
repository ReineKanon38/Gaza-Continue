// Script para verificar distribución de categorías
import './dns-fix.js';
import dotenv from 'dotenv';
import { connectDB } from './src/config/db.js';
import Product from './src/models/Product.js';

dotenv.config();

async function verifyCategories() {
  try {
    console.log('🔌 Conectando a MongoDB...');
    await connectDB();
    console.log('✅ Conectado\n');

    // Obtener distribución de categorías
    const categoryStats = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    const total = await Product.countDocuments();

    console.log('📊 DISTRIBUCIÓN DE PRODUCTOS POR CATEGORÍA');
    console.log('='.repeat(70));
    console.log(`Total de productos: ${total}\n`);

    const categoryNames = {
      'videovigilancia': 'Videovigilancia',
      'audio-video': 'Audio y Video',
      'automatizacion': 'Automatización e Intrusión',
      'cableado': 'Cableado Estructurado',
      'control-acceso': 'Control de Acceso',
      'deteccion-fuego': 'Detección de Fuego',
      'energia-herramientas': 'Energía / Herramientas',
      'iot-gps': 'IoT / GPS / Telemática',
      'radiocomunicacion': 'Radiocomunicación',
      'redes-it': 'Redes e IT',
      'robots-industrial': 'Robots e Industrial'
    };

    categoryStats.forEach(stat => {
      const displayName = categoryNames[stat._id] || stat._id;
      const percentage = ((stat.count / total) * 100).toFixed(1);
      const bar = '█'.repeat(Math.floor(stat.count / 5));
      console.log(`${displayName.padEnd(35)} ${String(stat.count).padStart(3)} (${percentage}%) ${bar}`);
    });

    console.log('='.repeat(70));

    // Verificar que no hay categorías antiguas
    const platformCats = Object.keys(categoryNames);
    const nonPlatformCategories = categoryStats.filter(stat => !platformCats.includes(stat._id));

    if (nonPlatformCategories.length > 0) {
      console.log('\n⚠️  ADVERTENCIA: Categorías no reconocidas encontradas:');
      nonPlatformCategories.forEach(cat => {
        console.log(`   - ${cat._id}: ${cat.count} productos`);
      });
    } else {
      console.log('\n✅ Todas las categorías son válidas de la plataforma!');
    }

    // Mostrar algunos productos de cada categoría
    console.log('\n📦 EJEMPLOS DE PRODUCTOS POR CATEGORÍA:');
    console.log('-'.repeat(70));

    for (const stat of categoryStats.slice(0, 5)) {
      const displayName = categoryNames[stat._id] || stat._id;
      console.log(`\n${displayName}:`);
      
      const samples = await Product.find({ category: stat._id })
        .limit(2)
        .select('name price');
      
      samples.forEach(product => {
        console.log(`  • ${product.name.substring(0, 60)}... ($${product.price})`);
      });
    }
    console.log('-'.repeat(70));

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

verifyCategories();
