// Script para asignar rol de administrador a un usuario específico
import mongoose from 'mongoose';
import User from '../src/models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gaza-syscom';
const ADMIN_EMAIL = 'rotsenleon38@gmail.com';

async function makeUserAdmin() {
  try {
    console.log('🔗 Conectando a MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB\n');

    // Buscar el usuario por email
    const user = await User.findOne({ email: ADMIN_EMAIL });

    if (!user) {
      console.log(`❌ No se encontró un usuario con el email: ${ADMIN_EMAIL}`);
      console.log('💡 Asegúrate de que el usuario esté registrado primero.\n');
      await mongoose.disconnect();
      process.exit(1);
    }

    // Verificar si ya es admin
    if (user.role === 'admin') {
      console.log(`✅ El usuario ${user.name} (${user.email}) ya es administrador.\n`);
      await mongoose.disconnect();
      process.exit(0);
    }

    // Actualizar a admin
    user.role = 'admin';
    await user.save();

    console.log('🎉 ¡Usuario actualizado exitosamente!');
    console.log('\n═══════════════════════════════════════');
    console.log('📋 Información del Administrador:');
    console.log('═══════════════════════════════════════');
    console.log(`👤 Nombre: ${user.name}`);
    console.log(`📧 Email: ${user.email}`);
    console.log(`🔑 Rol: ${user.role}`);
    console.log(`📅 Creado: ${user.createdAt}`);
    console.log('═══════════════════════════════════════\n');

    await mongoose.disconnect();
    console.log('✅ Desconectado de MongoDB');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Ejecutar
console.log('\n🛠️  Asignando Rol de Administrador');
console.log('══════════════════════════════════\n');
makeUserAdmin();
