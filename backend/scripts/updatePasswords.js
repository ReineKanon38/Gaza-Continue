import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { connectDB } from '../src/config/db.js';
import User from '../src/models/User.js';

dotenv.config();

async function updatePasswords() {
  try {
    await connectDB();
    console.log('✅ Conectado a MongoDB\n');

    // Passwords para usuarios clave
    const updates = [
      { email: 'rotsenleon38@gmail.com', password: 'Rotsen2026!', name: 'Rotsen Leon' },
      { email: 'wilberth@syscom-gaza.com', password: 'Wilberth2026!', name: 'Wilberth' },
      { email: 'brandon@syscom-gaza.com', password: 'Brandon2026!', name: 'Brandon' }
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
        console.log(`   Password: ${update.password}\n`);
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
