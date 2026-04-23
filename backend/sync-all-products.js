/**
 * Script: Sync All Products (Sin filtro Super Precio)
 * Descripción: Sincroniza productos de SYSCOM sin filtro de precio especial
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import dns from 'dns';
import syscomClient from './src/utils/syscomClient.js';
import Product from './src/models/Product.js';
import Category from './src/models/Category.js';
import { mapSyscomCategoryToPlatform } from './src/config/categoryMapping.js';
import { convertUSDtoMXN } from './src/config/currency.js';

dotenv.config();
dns.setServers(['8.8.8.8', '8.8.4.4']);

async function syncAllProducts(targetTotal = 500) {
    try {
        console.log('\n🔄 SINCRONIZACIÓN DE PRODUCTOS SYSCOM (TODOS)\n');
        console.log('='.repeat(70));
        
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Conectado a MongoDB\n');
        
        const currentCount = await Product.countDocuments();
        console.log(`📊 Productos actuales: ${currentCount}`);
        console.log(`🎯 Meta total: ${targetTotal}`);
        
        if (currentCount >= targetTotal) {
            console.log(`\n✅ Ya tienes ${currentCount} productos!\n`);
            return;
        }
        
        const productsNeeded = targetTotal - currentCount;
        console.log(`📦 A sincronizar: ${productsNeeded} más\n`);
        console.log('='.repeat(70));
        
        // Términos de búsqueda más amplios
        const searchTerms = [
            'camara', 'dvr', 'nvr', 'cable', 'switch', 'router', 
            'panel', 'fuente', 'sensor', 'alarma', 'monitor', 'control',
            'hikvision', 'dahua', 'epcom', 'mikrotik', 'ubiquiti',
            'detector', 'sirena', 'ups', 'poe', 'wifi', 'antena'
        ];
        
        let allProductIds = new Set();
        let synced = 0;
        let failed = 0;
        
        console.log('\n📋 Paso 1: Buscando productos en SYSCOM...\n');
        
        for (const term of searchTerms) {
            if (allProductIds.size >= productsNeeded * 3) {
                break;
            }
            
            for (let page = 1; page <= 5; page++) {
                try {
                    const result = await syscomClient.searchProducts({
                        query: term,
                        // Sin etiqueta para obtener todos los productos
                        pagina: page,
                        limite: 50
                    });
                    
                    if (!result.success) break;
                    
                    let products = result.data?.productos || result.data?.data || result.data || [];
                    if (products.length === 0) break;
                    
                    for (const product of products) {
                        const productId = product.producto_id || product.id;
                        if (productId) {
                            allProductIds.add(productId);
                        }
                    }
                } catch (error) {
                    console.log(`  ⚠️  Error en búsqueda "${term}" página ${page}`);
                    break;
                }
            }
            
            console.log(`  "${term}": ${allProductIds.size} productos únicos acumulados`);
        }
        
        const productIds = Array.from(allProductIds);
        console.log(`\n✅ Total IDs encontrados: ${productIds.length}\n`);
        console.log('='.repeat(70));
        console.log('\n📋 Paso 2: Sincronizando productos individualmente...\n');
        
        for (const productId of productIds) {
            if (synced >= productsNeeded) {
                console.log(`\n✅ Meta alcanzada: ${synced} productos nuevos sincronizados\n`);
                break;
            }
            
            try {
                // Verificar si ya existe
                const existing = await Product.findOne({ syscomId: productId });
                if (existing) {
                    continue; // Skip productos que ya existen
                }
                
                // Obtener detalles del producto
                const result = await syscomClient.getProduct(productId);
                if (!result.success) {
                    failed++;
                    continue;
                }
                
                const syscomProduct = result.data;
                
                // Convertir precio USD a MXN
                const priceUSD = parseFloat(syscomProduct.precio_descuento || syscomProduct.precio_lista || 0);
                const priceMXN = convertUSDtoMXN(priceUSD);
                
                // Mapear categoría
                const syscomCategoryText = syscomProduct.categorias?.join(' ') || syscomProduct.categoria || '';
                const platformCategory = mapSyscomCategoryToPlatform(syscomCategoryText);
                
                // Crear producto
                const productData = {
                    syscomId: productId,
                    name: syscomProduct.titulo || syscomProduct.nombre || 'Producto sin nombre',
                    description: syscomProduct.descripcion || '',
                    price: priceMXN,
                    stock: parseInt(syscomProduct.total_existencia) || 0,
                    category: platformCategory,
                    imageUrl: syscomProduct.img_portada || syscomProduct.imagen || '',
                    brand: syscomProduct.marca || 'Sin marca',
                    sku: syscomProduct.modelo || productId,
                    active: true,
                    isFeatured: false,
                    metadata: {
                        syscomCategories: syscomProduct.categorias || [],
                        syscomBrand: syscomProduct.marca,
                        lastSyncedAt: new Date()
                    }
                };
                
                await Product.create(productData);
                synced++;
                
                if (synced % 25 === 0) {
                    console.log(`  ✅ Progreso: ${synced}/${productsNeeded} productos nuevos`);
                }
                
            } catch (error) {
                failed++;
            }
        }
        
        // Resumen final
        console.log('\n' + '='.repeat(70));
        console.log('\n📊 RESUMEN FINAL\n');
        
        const finalCount = await Product.countDocuments();
        console.log(`   📦 Productos nuevos: ${synced}`);
        console.log(`   ❌ Fallidos: ${failed}`);
        console.log(`   📈 Total en BD: ${finalCount}`);
        console.log(`   🎯 Progreso: ${((finalCount / targetTotal) * 100).toFixed(1)}%`);
        
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
        
        console.log('\n' + '='.repeat(70));
        console.log('\n✅ Sincronización completada!\n');
        
    } catch (error) {
        console.error('\n❌ Error:', error.message);
    } finally {
        await mongoose.disconnect();
    }
}

const targetTotal = parseInt(process.argv[2]) || 500;
syncAllProducts(targetTotal);
