// Fix DNS PRIMERO (para Windows)
import '../dns-fix.js';

import dotenv from 'dotenv';
import bcryptjs from 'bcryptjs';
import { connectDB } from '../src/config/db.js';
import User from '../src/models/User.js';

dotenv.config();

async function resetPassword() {
  try {
    console.log('🔄 Iniciando restauración de contraseña...\n');
    
    await connectDB();
    console.log('✅ Conectado a MongoDB\n');

    const newPassword = 'ReineKanon38#';
    
    // Buscar usuario por nombre o email
    const user = await User.findOne({
      $or: [
        { email: 'rotsenleon38@gmail.com' },
        { name: /Rotsen.*Leon/i }
      ]
    });

    if (!user) {
      console.log('⚠️  Usuario "Rotsen Leon" no encontrado');
      console.log('🔨 Creando usuario...\n');
      
      // Crear el usuario con la contraseña en texto plano
      // El pre-save hook del modelo la hasheará automáticamente
      const newUser = new User({
        name: 'Rotsen Leon',
        email: 'rotsenleon38@gmail.com',
        password: newPassword, // Sin hashear - el modelo lo hará
        role: 'admin',
        phone: '+52 55 0000 0000',
        address: {
          street: 'Direccion por definir',
          city: 'Ciudad de México',
          state: 'CDMX',
          zipCode: '00000',
          country: 'México'
        }
      });
      
      await newUser.save();
      
      console.log('✅ Usuario creado exitosamente!');
      console.log('\n📝 Credenciales del nuevo usuario:');
      console.log(`   Nombre: Rotsen Leon`);
      console.log(`   Email: rotsenleon38@gmail.com`);
      console.log(`   Contraseña: ${newPassword}`);
      console.log(`   Role: admin`);
      console.log('\n⚠️  Guarda esta contraseña en un lugar seguro\n');
      
      process.exit(0);
    }

    console.log('👤 Usuario encontrado:');
    console.log(`   Nombre: ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}\n`);

    // Asignar la contraseña en texto plano
    // El pre-save hook la hasheará automáticamente
    user.password = newPassword;
    await user.save();

    console.log('✅ Contraseña actualizada exitosamente!');
    console.log('\n📝 Nuevas credenciales:');
    console.log(`   Email: ${user.email}`);
    console.log(`   Contraseña: ${newPassword}`);
    console.log('\n⚠️  Guarda esta contraseña en un lugar seguro\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

resetPassword();
