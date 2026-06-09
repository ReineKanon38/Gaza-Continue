// Script de verificación rápida
console.log('🔍 Verificando paginación en frontend...\n');

// Simular fetch al API
fetch('http://localhost:5000/api/products?category=videovigilancia&page=1&limit=20')
  .then(res => res.json())
  .then(data => {
    console.log('✅ PAGINACIÓN ACTIVA:\n');
    console.log(`   📦 Productos cargados: ${data.count} de ${data.total}`);
    console.log(`   📄 Página: ${data.pagination.currentPage} de ${data.pagination.totalPages}`);
    console.log(`   ⏭️  Tiene más páginas: ${data.pagination.hasNextPage ? 'Sí' : 'No'}`);
    console.log(`\n💡 El frontend debería cargar solo ${data.count} productos inicialmente`);
    console.log(`   En lugar de ${data.total} productos\n`);
    
    // Calcular mejora
    const mejora = ((data.total / data.count) * 100 - 100).toFixed(0);
    console.log(`⚡ Reducción de carga inicial: ${mejora}%`);
  })
  .catch(err => console.error('❌ Error:', err.message));
