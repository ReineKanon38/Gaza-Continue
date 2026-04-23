import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

console.log('🔍 Diagnóstico de Conexión MongoDB\n');
console.log('📍 URI:', process.env.MONGODB_URI?.replace(/:[^:@]+@/, ':****@'));
console.log('⏳ Intentando conectar...\n');

const uri = process.env.MONGODB_URI;

mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 10000,
})
.then(() => {
    console.log('✅ ¡CONEXIÓN EXITOSA!');
    console.log('📊 Host:', mongoose.connection.host);
    console.log('💾 Base de datos:', mongoose.connection.name);
    process.exit(0);
})
.catch((error) => {
    console.log('❌ ERROR DE CONEXIÓN:');
    console.log('   Tipo:', error.name);
    console.log('   Mensaje:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
        console.log('\n💡 Posibles causas:');
        console.log('   1. El cluster está pausado en MongoDB Atlas');
        console.log('   2. Tu IP no está en la whitelist');
        console.log('   3. Firewall bloqueando la conexión');
        console.log('   4. Problema con DNS de tu red');
    }
    
    if (error.message.includes('authentication')) {
        console.log('\n💡 Verifica:');
        console.log('   - Usuario y contraseña correctos');
        console.log('   - Usuario tiene permisos en la base de datos');
    }
    
    process.exit(1);
});

setTimeout(() => {
    console.log('⏱️  Timeout alcanzado sin respuesta');
    process.exit(1);
}, 12000);
