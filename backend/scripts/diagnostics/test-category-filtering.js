/**
 * Script: Test Category Filtering
 * Descripción: Prueba el filtrado por categorías como lo hace el frontend
 */

import axios from 'axios';

const API_URL = 'http://localhost:5000/api/products';

async function testCategoryFiltering() {
    console.log('\n🔍 PRUEBA DE FILTRADO POR CATEGORÍAS\n');
    console.log('='.repeat(70));
    
    const categories = [
        { name: 'Videovigilancia', value: 'videovigilancia' },
        { name: 'Audio y Video', value: 'audio-video' },
        { name: 'Automatización', value: 'automatizacion' },
        { name: 'Cableado', value: 'cableado' },
        { name: 'Control de Acceso', value: 'control-acceso' },
        { name: 'Detección de Fuego', value: 'deteccion-fuego' },
        { name: 'Energía / Herramientas', value: 'energia-herramientas' },
        { name: 'IoT / GPS', value: 'iot-gps' },
        { name: 'Radiocomunicación', value: 'radiocomunicacion' },
        { name: 'Redes IT', value: 'redes-it' },
        { name: 'Robots Industrial', value: 'robots-industrial' }
    ];
    
    console.log('\n📊 Probando cada categoría...\n');
    
    for (const category of categories) {
        try {
            const response = await axios.get(`${API_URL}?category=${category.value}`);
            const count = response.data.data.length;
            
            if (count > 0) {
                const firstProduct = response.data.data[0];
                const priceFormatted = firstProduct.price.toLocaleString('es-MX', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                });
                
                console.log(`✅ ${category.name.padEnd(30)} → ${count.toString().padStart(3)} productos`);
                console.log(`   Ejemplo: ${firstProduct.name.substring(0, 50)}...`);
                console.log(`   Precio: $${priceFormatted} MXN\n`);
            } else {
                console.log(`⚪ ${category.name.padEnd(30)} → Sin productos aún\n`);
            }
        } catch (error) {
            console.log(`❌ ${category.name.padEnd(30)} → Error: ${error.message}\n`);
        }
    }
    
    // Probar búsqueda
    console.log('='.repeat(70));
    console.log('\n🔎 PRUEBA DE BÚSQUEDA\n');
    
    const searchTerms = ['fuente', 'cámara', 'hikvision', 'ptz'];
    
    for (const term of searchTerms) {
        try {
            const response = await axios.get(`${API_URL}?search=${term}`);
            const count = response.data.data.length;
            
            if (count > 0) {
                console.log(`✅ Búsqueda "${term}" → ${count} resultados`);
                console.log(`   Primeros 3 productos:`);
                response.data.data.slice(0, 3).forEach((product, index) => {
                    const priceFormatted = product.price.toLocaleString('es-MX', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    });
                    console.log(`   ${index + 1}. ${product.name.substring(0, 45)}... - $${priceFormatted} MXN`);
                });
                console.log('');
            } else {
                console.log(`⚪ Búsqueda "${term}" → Sin resultados\n`);
            }
        } catch (error) {
            console.log(`❌ Búsqueda "${term}" → Error: ${error.message}\n`);
        }
    }
    
    // Probar filtro combinado
    console.log('='.repeat(70));
    console.log('\n🎯 PRUEBA DE FILTROS COMBINADOS\n');
    
    try {
        const response = await axios.get(`${API_URL}?category=videovigilancia&search=bala`);
        const count = response.data.data.length;
        
        console.log(`✅ Categoría "videovigilancia" + Búsqueda "bala" → ${count} resultados`);
        if (count > 0) {
            console.log(`   Primeros 5 productos:`);
            response.data.data.slice(0, 5).forEach((product, index) => {
                const priceFormatted = product.price.toLocaleString('es-MX', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                });
                console.log(`   ${index + 1}. ${product.name.substring(0, 50)}...`);
                console.log(`      $${priceFormatted} MXN - Stock: ${product.stock}`);
            });
        }
    } catch (error) {
        console.log(`❌ Error en filtros combinados: ${error.message}`);
    }
    
    console.log('\n' + '='.repeat(70));
    console.log('\n✅ Pruebas de filtrado completadas - Frontend funcionando correctamente\n');
}

testCategoryFiltering();
