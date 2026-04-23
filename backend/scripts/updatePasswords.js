import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { connectDB } from '../src/config/db.js';
import User from '../src/models/User.js';

dotenv.config();

async function updatePasswords() {
  try {
    await connectDB();
    console.log('✅ Conectado a MongoDB\n');

    // Passwords via environment to avoid storing secrets in repository.
    const envPasswords = {
      rotsen: process.env.ADMIN_PASS_ROTSEN,
      wilberth: process.env.ADMIN_PASS_WILBERTH,
      brandon: process.env.ADMIN_PASS_BRANDON
    };

    const missing = Object.entries(envPasswords)
      .filter(([, value]) => !value)
      .map(([key]) => key);

    if (missing.length) {
      console.error('❌ Faltan variables de entorno para passwords:', missing.join(', '));
      console.error('   Define ADMIN_PASS_ROTSEN, ADMIN_PASS_WILBERTH y ADMIN_PASS_BRANDON en backend/.env');
      process.exit(1);
    }

    const updates = [
      { email: 'rotsenleon38@gmail.com', password: envPasswords.rotsen, name: 'Rotsen Leon' },
      { email: 'wilberth@syscom-gaza.com', password: envPasswords.wilberth, name: 'Wilberth' },
      { email: 'brandon@syscom-gaza.com', password: envPasswords.brandon, name: 'Brandon' }
    ];

    console.log('🔄 Actualizando passwords...\n');

    for (const update of updates) {
      const hashedPassword = await bcrypt.hash(update.password, 10);
      const result = await User.updateOne(
        { email: update.email },
        { password: hashedPassword }
      );

      if (result.matchedCount > 0) {
        console.log(`✅ ${update.name}`);
        console.log(`   Email: ${update.email}`);
        console.log('   Password: [actualizado desde variable de entorno]\n');
      } else {
        console.log(`⚠️  Usuario no encontrado: ${update.email}\n`);
      }
    }

    console.log('✅ Actualización completada!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

updatePasswords();
