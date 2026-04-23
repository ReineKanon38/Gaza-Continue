import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const password = process.env.MONGO_TEST_PASSWORD;
const username = process.env.MONGO_TEST_USERNAME;
const database = process.env.MONGO_TEST_DATABASE || 'syscom-gaza';

if (!username || !password) {
    console.error('❌ Faltan variables MONGO_TEST_USERNAME y MONGO_TEST_PASSWORD en tu entorno local.');
    process.exit(1);
}

const connectionStrings = [
    {
        name: 'MongoDB+SRV (Original)',
        uri: `mongodb+srv://${username}:${password}@syscom-gaza.2ymfknz.mongodb.net/${database}?retryWrites=true&w=majority`
    },
    {
        name: 'Sin nombre de base de datos',
        uri: `mongodb+srv://${username}:${password}@syscom-gaza.2ymfknz.mongodb.net/?retryWrites=true&w=majority`
    },
    {
        name: 'Conexión directa a hosts',
        uri: `mongodb://${username}:${password}@ac-utsmduc-shard-00-00.2ymfknz.mongodb.net:27017,ac-utsmduc-shard-00-01.2ymfknz.mongodb.net:27017,ac-utsmduc-shard-00-02.2ymfknz.mongodb.net:27017/${database}?ssl=true&replicaSet=atlas-fzt5ia-shard-0&authSource=admin&retryWrites=true&w=majority`
    },
    {
        name: 'Con appName',
        uri: `mongodb+srv://${username}:${password}@syscom-gaza.2ymfknz.mongodb.net/${database}?retryWrites=true&w=majority&appName=SYSCOM-GAZA`
    }
];

async function testConnection(config) {
    console.log(`\n🧪 Probando: ${config.name}`);
    console.log(`📍 URI: ${config.uri.replace(password, '****')}`);
    
    try {
        await mongoose.connect(config.uri, {
            serverSelectionTimeoutMS: 8000,
            socketTimeoutMS: 8000,
        });
        
        console.log(`✅ ¡ÉXITO! Conectado a: ${mongoose.connection.host}`);
        console.log(`💾 Base de datos: ${mongoose.connection.name || 'admin'}`);
        
        await mongoose.disconnect();
        return true;
    } catch (error) {
        console.log(`❌ Error: ${error.message}`);
        await mongoose.disconnect();
        return false;
    }
}

async function runTests() {
    console.log('🔍 === PROBANDO DIFERENTES MÉTODOS DE CONEXIÓN ===\n');
    
    for (const config of connectionStrings) {
        const success = await testConnection(config);
        if (success) {
            console.log(`\n✅ ¡SOLUCIÓN ENCONTRADA!`);
            console.log(`\n📝 Actualiza tu .env con esta URI:`);
            console.log(`MONGODB_URI=${config.uri.replace(password, '<PASSWORD>')}`);
            process.exit(0);
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('\n❌ Ningún método funcionó.');
    console.log('\n💡 Verifica en MongoDB Atlas:');
    console.log('   1. El cluster está Running (luz verde)');
    console.log('   2. Network Access tiene 0.0.0.0/0');
    console.log('   3. Database Access tiene el usuario correcto');
    console.log('   4. Espera 2-3 minutos después de cambiar Network Access');
    process.exit(1);
}

runTests();
