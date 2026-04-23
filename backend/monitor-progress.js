/**
 * Script: Monitor Progress
 * Descripción: Monitorea el progreso de la sincronización en tiempo real
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
import Product from './src/models/Product.js';

dotenv.config();
dns.setServers(['8.8.8.8', '8.8.4.4']);

async function monitorProgress() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        
        const interval = setInterval(async () => {
            const count = await Product.countDocuments();
            const recent = await Product.find({}).sort({ createdAt: -1 }).limit(1).select('name price createdAt');
            
            console.clear();
            console.log('\n🔄 MONITOR DE SINCRONIZACIÓN\n');
            console.log('='.repeat(60));
            console.log(`\n📦 Productos en BD: ${count}`);
            
            if (recent.length > 0) {
                const secondsAgo = Math.floor((Date.now() - new Date(recent[0].createdAt).getTime()) / 1000);
                console.log(`\n🆕 Último producto agregado (hace ${secondsAgo}s):`);
                console.log(`   ${recent[0].name.substring(0, 50)}...`);
                const priceFormatted = recent[0].price.toLocaleString('es-MX', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                });
                console.log(`   $${priceFormatted} MXN`);
            }
            
            console.log(`\n⏱️  Actualizando cada 5 segundos...`);
            console.log(`   Presiona Ctrl+C para salir\n`);
            console.log('='.repeat(60));
            
        }, 5000);
        
        // Manejar Ctrl+C
        process.on('SIGINT', async () => {
            clearInterval(interval);
            console.log('\n\n👋 Monitoreo detenido\n');
            await mongoose.disconnect();
            process.exit(0);
        });
        
    } catch (error) {
        console.error('Error:', error.message);
        await mongoose.disconnect();
    }
}

monitorProgress();
