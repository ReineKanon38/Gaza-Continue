// Fix DNS PRIMERO (para Windows)
import '../dns-fix.js';

import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { connectDB } from '../src/config/db.js';
import User from '../src/models/User.js';

dotenv.config();

async function verifyUser() {
  try {
    await connectDB();
    console.log('✅ Conectado a MongoDB\n');

    const user = await User.findOne({ email: 'rotsenleon38@gmail.com' });

    if (!user) {
      console.log('❌ Usuario no encontrado');
      process.exit(1);
    }

    console.log('👤 Usuario encontrado:');
    console.log(`   ID: ${user._id}`);
    console.log(`   Nombre: ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Hash de contraseña: ${user.password.substring(0, 30)}...`);

    // Probar la contraseña
    const testPassword = 'ReineKanon38#';
    const isMatch = await bcrypt.compare(testPassword, user.password);

    console.log(`\n🔐 Prueba de contraseña: ${testPassword}`);
    console.log(`   Resultado: ${isMatch ? '✅ CORRECTA' : '❌ INCORRECTA'}`);

    if (!isMatch) {
      console.log('\n🔄 Actualizando contraseña...');
      const hashedPassword = await bcrypt.hash(testPassword, 10);
      user.password = hashedPassword;
      await user.save();
      console.log('✅ Contraseña actualizada');
      
      // Verificar de nuevo
      const user2 = await User.findOne({ email: 'rotsenleon38@gmail.com' });
      const isMatch2 = await bcrypt.compare(testPassword, user2.password);
      console.log(`\n✔️  Verificación final: ${isMatch2 ? '✅ CORRECTA' : '❌ INCORRECTA'}`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

verifyUser();
