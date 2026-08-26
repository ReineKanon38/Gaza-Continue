// backend/scripts/migrateDbName.js
await import('../src/utils/dns-fix.js');

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const SOURCE_DB_NAME = process.env.SOURCE_DB || 'test';
const TARGET_DB_NAME = process.env.TARGET_DB || 'syscom-gaza';

console.log('====================================================');
console.log('🔄 MIGRACIÓN Y CAMBIO DE NOMBRE DE BASE DE DATOS');
console.log('====================================================');
console.log(`📌 Base de Datos Origen:  [ ${SOURCE_DB_NAME} ]`);
console.log(`📌 Base de Datos Destino: [ ${TARGET_DB_NAME} ]`);
console.log('====================================================\n');

async function migrateDatabase() {
  let client;
  try {
    const rawUri = process.env.MONGODB_URI;
    if (!rawUri) {
      throw new Error('No se encontró MONGODB_URI en el archivo .env');
    }

    // Asegurar URI base del cluster
    const uriObj = new URL(rawUri.startsWith('mongodb+srv://') ? rawUri.replace('mongodb+srv://', 'http://') : rawUri);
    const clusterHost = uriObj.host;
    const auth = uriObj.username && uriObj.password ? `${uriObj.username}:${uriObj.password}@` : '';
    const params = uriObj.search || '?retryWrites=true&w=majority';

    const baseConnectionUri = `mongodb+srv://${auth}${clusterHost}/${params}`;

    console.log('⏳ Conectando al Cluster de MongoDB Atlas...');
    const mongooseInstance = await mongoose.connect(baseConnectionUri);
    client = mongooseInstance.connection.getClient();
    console.log('✅ Conexión establecida con el Cluster.');

    const adminDb = client.db().admin();
    const dbsList = await adminDb.listDatabases();
    const dbExists = dbsList.databases.some(d => d.name === SOURCE_DB_NAME);

    if (!dbExists) {
      console.warn(`⚠️ Advertencia: No se encontró la base de datos origen "${SOURCE_DB_NAME}".`);
      console.log('Bases de datos encontradas:', dbsList.databases.map(d => d.name).join(', '));
    }

    const sourceDb = client.db(SOURCE_DB_NAME);
    const targetDb = client.db(TARGET_DB_NAME);

    const collections = await sourceDb.listCollections().toArray();
    console.log(`\n📦 Colecciones a migrar desde "${SOURCE_DB_NAME}" (${collections.length} colecciones):`);

    for (const col of collections) {
      const colName = col.name;
      if (colName.startsWith('system.')) continue;

      const sourceCollection = sourceDb.collection(colName);
      const targetCollection = targetDb.collection(colName);

      const count = await sourceCollection.countDocuments();
      console.log(`\n⏳ Migrando colección [${colName}] (${count} documentos)...`);

      if (count === 0) {
        console.log(`   ⏩ Colección vacía, omitiendo.`);
        continue;
      }

      // Obtener índices de la colección origen
      try {
        const indexes = await sourceCollection.indexes();
        for (const idx of indexes) {
          if (idx.name === '_id_') continue;
          const { key, name, unique, sparse, expireAfterSeconds } = idx;
          const indexOptions = { name };
          if (unique) indexOptions.unique = true;
          if (sparse) indexOptions.sparse = true;
          if (expireAfterSeconds !== undefined) indexOptions.expireAfterSeconds = expireAfterSeconds;
          
          await targetCollection.createIndex(key, indexOptions).catch(err => {
            console.warn(`   ⚠️ Aviso en índice ${name}: ${err.message}`);
          });
        }
      } catch (idxErr) {
        console.warn(`   ⚠️ No se pudieron copiar algunos índices de ${colName}:`, idxErr.message);
      }

      // Migración en lotes de 500 documentos
      const cursor = sourceCollection.find({});
      let batch = [];
      let processed = 0;

      while (await cursor.hasNext()) {
        const doc = await cursor.next();
        batch.push({
          replaceOne: {
            filter: { _id: doc._id },
            replacement: doc,
            upsert: true
          }
        });

        if (batch.length >= 500) {
          await targetCollection.bulkWrite(batch, { ordered: false });
          processed += batch.length;
          process.stdout.write(`   ↳ Procesados ${processed}/${count} documentos...\r`);
          batch = [];
        }
      }

      if (batch.length > 0) {
        await targetCollection.bulkWrite(batch, { ordered: false });
        processed += batch.length;
      }

      const targetCount = await targetCollection.countDocuments();
      console.log(`   ✅ [${colName}] migrado con éxito: ${targetCount} documentos en "${TARGET_DB_NAME}".`);
    }

    console.log('\n====================================================');
    console.log('🎉 ¡MIGRACIÓN COMPLETADA CON ÉXITO!');
    console.log(`Todas las colecciones y documentos de "${SOURCE_DB_NAME}" ahora están en "${TARGET_DB_NAME}".`);
    console.log('====================================================\n');

  } catch (error) {
    console.error('\n❌ ERROR durante la migración:');
    console.error(error.message);
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    process.exit(0);
  }
}

migrateDatabase();
