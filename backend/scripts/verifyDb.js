// Fix DNS primero (para Windows)
await import('../src/utils/dns-fix.js');

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from '../src/config/db.js';
import User from '../src/models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

console.log('====================================================');
console.log('🔍 VERIFICACIÓN DE BASE DE DATOS MONGODB');
console.log('====================================================');
console.log('📍 URI:', process.env.MONGODB_URI?.replace(/:[^:@]+@/, ':****@'));

async function runDiagnostics() {
  try {
    console.log('\n⏳ Conectando a MongoDB...');
    await connectDB();

    console.log('✅ ¡Conexión establecida exitosamente!');
    console.log(`🌐 Cluster Host: ${mongoose.connection.host}`);
    console.log(`💾 Base de datos activa: ${mongoose.connection.name}`);

    // Obtener colecciones existentes
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`\n📚 Total de Colecciones: ${collections.length}`);

    for (const col of collections) {
      const count = await mongoose.connection.db.collection(col.name).countDocuments();
      console.log(`   - 📁 ${col.name}: ${count} documentos`);
    }

    // Listar usuarios
    console.log('\n👥 Usuarios Registrados en la Base de Datos:');
    const users = await User.find({}).select('name email role isBlocked createdAt').sort({ createdAt: -1 });

    if (users.length === 0) {
      console.log('   ⚠️ No hay usuarios registrados actualmente.');
    } else {
      users.forEach((u, index) => {
        console.log(`   ${index + 1}. ${u.name} | ${u.email} | Rol: ${u.role} ${u.isBlocked ? '[BLOQUEADO]' : ''}`);
      });
    }

    console.log('\n====================================================');
    console.log('✅ Verificación completada con éxito.');
    console.log('====================================================');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ ERROR al conectar con la base de datos:');
    console.error(`   ${error.message}`);
    process.exit(1);
  }
}

runDiagnostics();
