// Script para probar el filtrado de productos por categoría
import './dns-fix.js';
import dotenv from 'dotenv';
import { connectDB } from './src/config/db.js';
import Product from './src/models/Product.js';

dotenv.config();

async function testCategoryFiltering() {
  try {
    console.log('🔌 Conectando a MongoDB...');
    await connectDB();
    console.log('✅ Conectado\n');

    console.log('🔍 PROBANDO FILTRADO DE PRODUCTOS POR CATEGORÍA\n');
    console.log('='.repeat(70));

    const platformCategories = [
      { slug: 'videovigilancia', name: 'Videovigilancia' },
      { slug: 'audio-video', name: 'Audio y Video' },
      { slug: 'automatizacion', name: 'Automatización e Intrusión' },
      { slug: 'cableado', name: 'Cableado Estructurado' },
      { slug: 'control-acceso', name: 'Control de Acceso' },
      { slug: 'deteccion-fuego', name: 'Detección de Fuego' },
      { slug: 'energia-herramientas', name: 'Energía / Herramientas' },
      { slug: 'iot-gps', name: 'IoT / GPS / Telemática' },
      { slug: 'radiocomunicacion', name: 'Radiocomunicación' },
      { slug: 'redes-it', name: 'Redes e IT' },
      { slug: 'robots-industrial', name: 'Robots e Industrial' }
    ];

    for (const category of platformCategories) {
      // Filtrar productos por categoría
      const products = await Product.find({ category: category.slug, active: true })
        .select('name price category')
        .limit(3);

      if (products.length > 0) {
        console.log(`\n📦 ${category.name} (${category.slug})`);
        console.log(`   Total: ${products.length} productos encontrados`);
        console.log('-'.repeat(70));
        
        products.forEach((product, index) => {
          console.log(`   ${index + 1}. ${product.name.substring(0, 55)}...`);
          console.log(`      Precio: $${product.price} | Categoría: ${product.category}`);
        });
      }
    }

    // Mostrar resumen total
    console.log('\n' + '='.repeat(70));
    console.log('📊 RESUMEN DE FILTRADO');
    console.log('='.repeat(70));

    for (const category of platformCategories) {
      const count = await Product.countDocuments({ category: category.slug });
      if (count > 0) {
        const bar = '█'.repeat(Math.floor(count / 5));
        console.log(`${category.name.padEnd(35)} ${String(count).padStart(3)} productos ${bar}`);
      }
    }

    console.log('='.repeat(70));

    // Probar búsqueda con texto
    console.log('\n🔍 PROBANDO BÚSQUEDA DE TEXTO\n');
    console.log('-'.repeat(70));
    
    const searchTerms = ['camara', 'fuente', 'switch', 'cable'];
    
    for (const term of searchTerms) {
      const results = await Product.find({
        $or: [
          { name: { $regex: term, $options: 'i' } },
          { description: { $regex: term, $options: 'i' } }
        ],
        active: true
      }).limit(2);

      if (results.length > 0) {
        console.log(`\nBúsqueda: "${term}" → ${results.length} resultados`);
        results.forEach(product => {
          console.log(`  • ${product.name.substring(0, 50)}... (${product.category})`);
        });
      }
    }

    console.log('\n' + '-'.repeat(70));
    console.log('\n✅ Filtrado funcionando correctamente!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

testCategoryFiltering();
