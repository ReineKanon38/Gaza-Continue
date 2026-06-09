/**
 * Script: Quick Stats
 * Descripción: Muestra estadísticas rápidas del catálogo
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
import Product from './src/models/Product.js';

dotenv.config();
dns.setServers(['8.8.8.8', '8.8.4.4']);

async function showStats() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        
        const total = await Product.countDocuments();
        
        const byCategory = await Product.aggregate([
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);
        
        console.log('\n📊 ESTADÍSTICAS DEL CATÁLOGO\n');
        console.log('='.repeat(60));
        console.log(`\n🎯 TOTAL PRODUCTOS: ${total}\n`);
        console.log('📦 POR CATEGORÍA:\n');
        
        byCategory.forEach(cat => {
            const percentage = ((cat.count / total) * 100).toFixed(1);
            const categoryName = cat._id.split('-').map(w => 
                w.charAt(0).toUpperCase() + w.slice(1)
            ).join(' ');
            console.log(`   ${categoryName.padEnd(30)} ${cat.count.toString().padStart(4)} (${percentage.padStart(5)}%)`);
        });
        
        // Muestra de productos recientes
        const recent = await Product.find({})
            .sort({ createdAt: -1 })
            .limit(5)
            .select('name price category');
        
        console.log('\n' + '='.repeat(60));
        console.log('\n🆕 ÚLTIMOS 5 PRODUCTOS SINCRONIZADOS:\n');
        
        recent.forEach((p, i) => {
            const priceFormatted = p.price.toLocaleString('es-MX', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
            console.log(`   ${(i + 1)}. ${p.name.substring(0, 45)}...`);
            console.log(`      💵 $${priceFormatted} MXN | 📂 ${p.category}\n`);
        });
        
        console.log('='.repeat(60));
        console.log('');
        
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await mongoose.disconnect();
    }
}

showStats();
