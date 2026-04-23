// Test con DNS fix incluido
await import('./dns-fix.js');

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

console.log('\n🔍 Diagnóstico de Conexión MongoDB (con DNS fix)\n');
console.log('📍 URI:', process.env.MONGODB_URI?.replace(/:[^:@]+@/, ':****@'));
console.log('⏳ Intentando conectar...\n');

const uri = process.env.MONGODB_URI;

mongoose.connect(uri, {
    serverSelectionTimeoutMS: 15000,
    socketTimeoutMS: 15000,
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
    process.exit(1);
});
