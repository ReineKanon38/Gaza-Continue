/**
 * Script: Fix Zero Prices
 * Descripción: Encuentra y corrige productos con precio $0.00
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
import Product from './src/models/Product.js';
import syscomClient from './src/utils/syscomClient.js';
import { convertUSDtoMXN } from './src/config/currency.js';

dotenv.config();
dns.setServers(['8.8.8.8', '8.8.4.4']);

async function fixZeroPrices() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        
        console.log('\n🔍 BUSCANDO PRODUCTOS CON PRECIO $0.00\n');
        console.log('='.repeat(60));
        
        const zeroPrice = await Product.find({ price: 0 });
        console.log(`\n📊 Productos con precio $0.00: ${zeroPrice.length}\n`);
        
        if (zeroPrice.length === 0) {
            console.log('✅ No hay productos con precio $0.00\n');
            return;
        }
        
        console.log('🔧 Intentando corregir precios...\n');
        
        let fixed = 0;
        let failed = 0;
        
        for (const product of zeroPrice.slice(0, 50)) { // Corregir solo primeros 50
            try {
                // Obtener datos actualizados de SYSCOM
                const result = await syscomClient.getProduct(product.syscomId);
                
                if (result.success) {
                    const syscomProduct = result.data;
                    
                    // Intentar diferentes campos de precio
                    let priceUSD = 0;
                    
                    if (syscomProduct.precios) {
                        priceUSD = parseFloat(syscomProduct.precios.precio_descuento) || 
                                  parseFloat(syscomProduct.precios.precio_lista) ||
                                  parseFloat(syscomProduct.precios.precio_especial) || 0;
                    } else {
                        priceUSD = parseFloat(syscomProduct.precio_descuento) || 
                                  parseFloat(syscomProduct.precio_lista) || 
                                  parseFloat(syscomProduct.precio) || 0;
                    }
                    
                    if (priceUSD > 0) {
                        const priceMXN = convertUSDtoMXN(priceUSD);
                        product.price = priceMXN;
                        await product.save();
                        
                        console.log(`✅ ${product.name.substring(0, 50)}...`);
                        console.log(`   ${priceUSD} USD → $${priceMXN.toFixed(2)} MXN\n`);
                        fixed++;
                    } else {
                        failed++;
                    }
                }
            } catch (error) {
                failed++;
            }
        }
        
        console.log('\n' + '='.repeat(60));
        console.log(`\n📊 RESUMEN:`);
        console.log(`   ✅ Corregidos: ${fixed}`);
        console.log(`   ❌ No corregidos: ${failed}`);
        console.log(`   📦 Aún con $0.00: ${zeroPrice.length - fixed}\n`);
        
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await mongoose.disconnect();
    }
}

fixZeroPrices();
