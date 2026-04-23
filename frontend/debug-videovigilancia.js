/**
 * Script: Debug Frontend Videovigilancia
 * Descripción: Simula exactamente lo que hace el frontend
 */

console.log('🔍 SIMULANDO FRONTEND PARA VIDEOVIGILANCIA\n');
console.log('='.repeat(70));

const API_URL = 'http://localhost:5000/api/products';

// Simular lo que hace productService.getAllProducts()
async function testFrontendCall() {
    try {
        // EXACTAMENTE como lo hace el frontend
        const params = {
            page: 1,
            limit: 20,
            category: 'videovigilancia'
        };
        
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append('page', params.page);
        if (params.limit) queryParams.append('limit', params.limit);
        if (params.category) queryParams.append('category', params.category);
        
        const queryString = queryParams.toString();
        const url = `${API_URL}?${queryString}`;
        
        console.log('\n📡 REQUEST que hace el frontend:');
        console.log(`   URL: ${url}\n`);
        
        const response = await fetch(url);
        const data = await response.json();
        
        console.log('✅ RESPUESTA:');
        console.log(`   success: ${data.success}`);
        console.log(`   count: ${data.count}`);
        console.log(`   total: ${data.total}`);
        console.log(`   pagination.currentPage: ${data.pagination?.currentPage}`);
        console.log(`   pagination.totalPages: ${data.pagination?.totalPages}`);
        console.log(`   data.length: ${data.data?.length}`);
        
        console.log('\n📦 PRODUCTOS RECIBIDOS:');
        if (data.data && data.data.length > 0) {
            data.data.slice(0, 5).forEach((p, i) => {
                console.log(`   ${i + 1}. ${p.name.substring(0, 60)}...`);
            });
            console.log(`   ... y ${data.count - 5} más`);
        } else {
            console.log('   ❌ NO HAY PRODUCTOS EN LA RESPUESTA');
        }
        
        // Verificar lo que el frontend haría con esta data
        console.log('\n🎨 LO QUE HARÍA EL FRONTEND:');
        const products = data.data || [];
        console.log(`   setProducts(${products.length} productos)`);
        console.log(`   setTotalProducts(${data.total})`);
        console.log(`   setHasMore(${data.pagination?.hasNextPage})`);
        
        if (products.length === 0) {
            console.log('\n❌ PROBLEMA: No hay productos para renderizar');
            console.log('   El frontend mostraría una página vacía');
        } else if (products.length === 466) {
            console.log('\n⚠️  PROBLEMA: Cargó TODOS los productos');
            console.log('   La paginación NO está funcionando en el frontend');
        } else if (products.length === 20) {
            console.log('\n✅ CORRECTO: Cargó solo 20 productos');
            console.log('   La paginación SÍ está funcionando');
        }
        
    } catch (error) {
        console.error('\n❌ ERROR:', error.message);
        console.log('\nEsto es lo que vería el usuario: Una página vacía o spinner infinito');
    }
}

testFrontendCall();
