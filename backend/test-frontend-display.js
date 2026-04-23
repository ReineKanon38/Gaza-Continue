/**
 * Script: Test Frontend Display
 * Descripción: Verifica cómo se mostrarán los productos en el frontend
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Product from './src/models/Product.js';

dotenv.config();

// DNS fix para Node.js v24
import dns from 'dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);

async function testFrontendDisplay() {
    try {
        console.log('\n🎨 PRUEBA DE VISUALIZACIÓN DEL FRONTEND\n');
        console.log('='.repeat(70));
        
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Conectado a MongoDB\n');
        
        // Obtener productos de diferentes categorías
        const categories = [
            'videovigilancia',
            'energia-herramientas',
            'audio-video',
            'control-acceso'
        ];
        
        for (const category of categories) {
            const products = await Product.find({ 
                category,
                active: true 
            })
            .limit(2)
            .select('name price category stock');
            
            if (products.length > 0) {
                const categoryName = category.split('-').map(w => 
                    w.charAt(0).toUpperCase() + w.slice(1)
                ).join(' ');
                
                console.log(`\n📦 ${categoryName.toUpperCase()}`);
                console.log('-'.repeat(70));
                
                products.forEach(product => {
                    // Formatear precio como lo hará el frontend
                    const priceFormatted = product.price.toLocaleString('es-MX', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    });
                    
                    console.log(`\n  📌 ${product.name.substring(0, 60)}...`);
                    console.log(`     💵 $${priceFormatted} MXN`);
                    console.log(`     📊 Stock: ${product.stock} unidades`);
                });
            }
        }
        
        // Resumen total
        console.log('\n' + '='.repeat(70));
        const totalProducts = await Product.countDocuments({ active: true });
        const avgPrice = await Product.aggregate([
            { $match: { active: true } },
            { $group: { _id: null, avg: { $avg: '$price' } } }
        ]);
        
        console.log('\n📊 RESUMEN DEL CATÁLOGO');
        console.log(`   Total productos activos: ${totalProducts}`);
        console.log(`   Precio promedio: $${avgPrice[0].avg.toLocaleString('es-MX', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })} MXN`);
        
        // Estadísticas de precios
        const priceRanges = await Product.aggregate([
            { $match: { active: true } },
            {
                $bucket: {
                    groupBy: '$price',
                    boundaries: [0, 100, 500, 1000, 5000, 100000],
                    default: 'Otros',
                    output: {
                        count: { $sum: 1 }
                    }
                }
            }
        ]);
        
        console.log('\n💰 DISTRIBUCIÓN DE PRECIOS:');
        const ranges = [
            { min: 0, max: 100, label: 'Bajo costo ($0 - $100)' },
            { min: 100, max: 500, label: 'Económico ($100 - $500)' },
            { min: 500, max: 1000, label: 'Medio ($500 - $1,000)' },
            { min: 1000, max: 5000, label: 'Premium ($1,000 - $5,000)' },
            { min: 5000, max: 100000, label: 'Empresarial ($5,000+)' }
        ];
        
        priceRanges.forEach(range => {
            const rangeLabel = ranges.find(r => r.min === range._id);
            if (rangeLabel) {
                const percentage = ((range.count / totalProducts) * 100).toFixed(1);
                console.log(`   ${rangeLabel.label}: ${range.count} productos (${percentage}%)`);
            }
        });
        
        console.log('\n✅ Verificación completada - el frontend mostrará los precios en MXN\n');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.disconnect();
    }
}

testFrontendDisplay();
