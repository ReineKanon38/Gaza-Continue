/**
 * Script: Bulk Sync Products (Gradual)
 * Descripción: Sincroniza productos de SYSCOM gradualmente con pausas
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import dns from 'dns';
import syscomService from './src/services/syscomService.js';

dotenv.config();
dns.setServers(['8.8.8.8', '8.8.4.4']);

async function bulkSyncProducts(targetCount = 500, batchSize = 50) {
    try {
        console.log('\n🔄 SINCRONIZACIÓN GRADUAL DE PRODUCTOS SYSCOM\n');
        console.log('='.repeat(70));
        console.log(`📊 Meta: ${targetCount} productos totales`);
        console.log(`📦 Tamaño de lote: ${batchSize} productos`);
        console.log('='.repeat(70));
        
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('\n✅ Conectado a MongoDB');
        
        const Product = (await import('./src/models/Product.js')).default;
        
        // Contar productos actuales
        const currentCount = await Product.countDocuments();
        console.log(`📊 Productos actuales: ${currentCount}`);
        
        if (currentCount >= targetCount) {
            console.log(`✅ Ya tienes ${currentCount} productos. Meta alcanzada!`);
            return;
        }
        
        const productsNeeded = targetCount - currentCount;
        console.log(`🎯 Necesitas sincronizar: ${productsNeeded} productos más\n`);
        
        // Calcular número de lotes
        const batches = Math.ceil(productsNeeded / batchSize);
        let totalSynced = 0;
        let totalErrors = 0;
        
        const categoryStats = {};
        
        for (let batch = 1; batch <= batches; batch++) {
            console.log(`\n${'='.repeat(70)}`);
            console.log(`📦 LOTE ${batch}/${batches}`);
            console.log(`${'='.repeat(70)}`);
            
            const startPage = Math.floor((currentCount + totalSynced) / 100) + 1;
            const startProduct = ((currentCount + totalSynced) % 100) + 1;
            
            console.log(`\n⏳ Sincronizando desde página ${startPage}, producto ${startProduct}...`);
            
            try {
                const result = await syscomService.syncSuperPrecioProducts({
                    page: startPage,
                    maxTotalProducts: Math.min(batchSize, productsNeeded - totalSynced)
                });
                
                console.log(`\n✅ Lote completado:`);
                console.log(`   • Nuevos: ${result.newProducts}`);
                console.log(`   • Actualizados: ${result.updatedProducts}`);
                console.log(`   • Errores: ${result.errors}`);
                
                totalSynced += result.newProducts + result.updatedProducts;
                totalErrors += result.errors;
                
                // Actualizar estadísticas de categorías
                const products = await Product.find({}).select('category').limit(currentCount + totalSynced);
                const categoryCounts = {};
                products.forEach(p => {
                    categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
                });
                
                console.log(`\n📊 Distribución de categorías actual:`);
                Object.entries(categoryCounts)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 5)
                    .forEach(([cat, count]) => {
                        const percentage = ((count / (currentCount + totalSynced)) * 100).toFixed(1);
                        console.log(`   ${cat.padEnd(25)}: ${count} (${percentage}%)`);
                    });
                
                // Mostrar progreso
                const progress = ((totalSynced / productsNeeded) * 100).toFixed(1);
                console.log(`\n📈 Progreso total: ${totalSynced}/${productsNeeded} (${progress}%)`);
                
                // Pausa entre lotes (excepto en el último)
                if (batch < batches && totalSynced < productsNeeded) {
                    console.log(`\n⏸️  Pausa de 3 segundos antes del siguiente lote...`);
                    await new Promise(resolve => setTimeout(resolve, 3000));
                }
                
            } catch (error) {
                console.error(`\n❌ Error en lote ${batch}:`, error.message);
                totalErrors++;
                
                // Si hay muchos errores consecutivos, detener
                if (totalErrors > 5) {
                    console.log(`\n⚠️  Demasiados errores. Deteniendo sincronización.`);
                    break;
                }
            }
        }
        
        // Resumen final
        console.log(`\n${'='.repeat(70)}`);
        console.log(`\n📊 RESUMEN FINAL\n`);
        
        const finalCount = await Product.countDocuments();
        console.log(`   Total productos en BD: ${finalCount}`);
        console.log(`   Productos sincronizados: ${totalSynced}`);
        console.log(`   Errores: ${totalErrors}`);
        
        // Verificar precios en MXN
        const sampleProducts = await Product.find({}).limit(5).select('name price category');
        console.log(`\n💵 Muestra de precios (verificar MXN):`);
        sampleProducts.forEach(product => {
            const priceFormatted = product.price.toLocaleString('es-MX', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
            console.log(`   ${product.name.substring(0, 50)}...`);
            console.log(`   → $${priceFormatted} MXN (${product.category})\n`);
        });
        
        console.log(`${'='.repeat(70)}`);
        console.log(`\n✅ Sincronización completada!\n`);
        
    } catch (error) {
        console.error('\n❌ Error general:', error.message);
        throw error;
    } finally {
        await mongoose.disconnect();
    }
}

// Leer argumentos de línea de comandos
const args = process.argv.slice(2);
const targetCount = parseInt(args[0]) || 500;
const batchSize = parseInt(args[1]) || 50;

console.log(`\n💡 Uso: node bulk-sync-gradual.js [meta] [tamaño_lote]`);
console.log(`   Ejemplo: node bulk-sync-gradual.js 1000 100\n`);

bulkSyncProducts(targetCount, batchSize);
