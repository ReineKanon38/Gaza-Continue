/**
 * Script: Simple Bulk Sync
 * Descripción: Sincroniza productos de SYSCOM Súper Precio de manera simple
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import dns from 'dns';
import syscomService from './src/services/syscomService.js';
import Product from './src/models/Product.js';

dotenv.config();
dns.setServers(['8.8.8.8', '8.8.4.4']);

async function simpleBulkSync(targetTotal = 500) {
    try {
        console.log('\n🔄 SINCRONIZACIÓN MASIVA DE PRODUCTOS SYSCOM\n');
        console.log('='.repeat(70));
        
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Conectado a MongoDB\n');
        
        // Contar productos actuales
        const currentCount = await Product.countDocuments();
        console.log(`📊 Productos actuales: ${currentCount}`);
        console.log(`🎯 Meta total: ${targetTotal}`);
        
        if (currentCount >= targetTotal) {
            console.log(`\n✅ Ya tienes ${currentCount} productos. Meta alcanzada!\n`);
            return;
        }
        
        const productsNeeded = targetTotal - currentCount;
        console.log(`📦 A sincronizar: ${productsNeeded} productos más\n`);
        console.log('='.repeat(70));
        console.log('\n⏳ Iniciando sincronización... (esto puede tomar varios minutos)\n');
        
        const startTime = Date.now();
        
        // Sincronizar productos con el límite necesario
        const result = await syscomService.syncSuperPrecioProducts({
            maxTotalProducts: productsNeeded * 2, // Pedir el doble porque algunos pueden repetirse
            limitPerCategory: 100
        });
        
        const endTime = Date.now();
        const durationMin = ((endTime - startTime) / 1000 / 60).toFixed(2);
        
        console.log('\n' + '='.repeat(70));
        console.log('\n📊 RESUMEN DE SINCRONIZACIÓN\n');
        console.log(`   ⏱️  Duración: ${durationMin} minutos`);
        
        // Contar productos finales
        const finalCount = await Product.countDocuments();
        const newProducts = finalCount - currentCount;
        
        console.log(`   📦 Productos nuevos: ${newProducts}`);
        console.log(`   📈 Total en BD: ${finalCount}`);
        console.log(`   🎯 Progreso hacia meta: ${((finalCount / targetTotal) * 100).toFixed(1)}%`);
        
        // Distribución por categoría
        const byCategory = await Product.aggregate([
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);
        
        console.log('\n📦 DISTRIBUCIÓN POR CATEGORÍA:\n');
        byCategory.forEach(cat => {
            const percentage = ((cat.count / finalCount) * 100).toFixed(1);
            const categoryName = cat._id.split('-').map(w => 
                w.charAt(0).toUpperCase() + w.slice(1)
            ).join(' ');
            console.log(`   ${categoryName.padEnd(30)} ${cat.count.toString().padStart(4)} (${percentage.padStart(5)}%)`);
        });
        
        // Muestra de productos nuevos
        const recentProducts = await Product.find({})
            .sort({ createdAt: -1 })
            .limit(5)
            .select('name price category stock');
        
        console.log('\n🆕 ÚLTIMOS 5 PRODUCTOS AGREGADOS:\n');
        recentProducts.forEach((p, i) => {
            const priceFormatted = p.price.toLocaleString('es-MX', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
            console.log(`   ${i + 1}. ${p.name.substring(0, 50)}...`);
            console.log(`      💵 $${priceFormatted} MXN | 📂 ${p.category} | 📊 Stock: ${p.stock}\n`);
        });
        
        console.log('='.repeat(70));
        console.log('\n✅ Sincronización completada!\n');
        
    } catch (error) {
        console.error('\n❌ Error:', error.message);
        console.error(error.stack);
    } finally {
        await mongoose.disconnect();
    }
}

// Leer meta de los argumentos
const targetTotal = parseInt(process.argv[2]) || 500;

console.log(`\n💡 Uso: node simple-bulk-sync.js [total]`);
console.log(`   Ejemplo: node simple-bulk-sync.js 1000\n`);

simpleBulkSync(targetTotal);
