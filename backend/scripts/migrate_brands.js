import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Configuraciones para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

import Product from '../src/models/Product.js';
import syscomClient from '../src/utils/syscomClient.js';

const migrateBrands = async () => {
    try {
        console.log('🔗 Conectando a MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Conectado a MongoDB');

        // Buscar productos que vienen de SYSCOM pero que NO tienen 'brand' o 'model'
        const productsToMigrate = await Product.find({
            syscomId: { $exists: true, $ne: null },
            $or: [
                { brand: { $exists: false } },
                { brand: '' },
                { model: { $exists: false } },
                { model: '' }
            ]
        });

        console.log(`📦 Se encontraron ${productsToMigrate.length} productos para migrar.`);

        let updatedCount = 0;
        let failedCount = 0;

        for (const product of productsToMigrate) {
            try {
                // Obtener datos frescos desde SYSCOM
                const result = await syscomClient.getProduct(product.syscomId);
                
                if (result.success && result.data) {
                    const syscomData = result.data;
                    const newBrand = syscomData.marca || syscomData.brand || '';
                    const newModel = syscomData.modelo || syscomData.model || '';

                    // Actualizar si hay algún valor nuevo
                    if (newBrand || newModel) {
                        product.brand = newBrand;
                        product.model = newModel;
                        await product.save();
                        updatedCount++;
                        console.log(`✅ Actualizado: ${product.syscomId} | Marca: ${newBrand} | Modelo: ${newModel}`);
                    }
                } else {
                    console.log(`⚠️ No se pudo obtener la información del producto en SYSCOM: ${product.syscomId}`);
                    failedCount++;
                }

                // Esperar un poco para no bombardear la API de Syscom
                await new Promise(res => setTimeout(res, 200));

            } catch (err) {
                console.error(`❌ Error migrando producto ${product.syscomId}: ${err.message}`);
                failedCount++;
            }
        }

        console.log('\n--- 🎉 Migración Finalizada ---');
        console.log(`Total actualizados: ${updatedCount}`);
        console.log(`Total fallidos: ${failedCount}`);

    } catch (error) {
        console.error('Error fatal durante la migración:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Desconectado de MongoDB');
        process.exit(0);
    }
};

migrateBrands();
