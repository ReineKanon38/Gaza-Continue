import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Schema de Usuario
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['client', 'admin'], default: 'client' },
  phone: String,
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

async function createAdmins() {
  try {
    console.log('🔌 Conectando a MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    const admins = [
      {
        name: 'Wilberth',
        email: 'wilberth@syscom-gaza.com',
        password: 'admin123',
        role: 'admin',
        phone: '3331234567'
      },
      {
        name: 'Brandon',
        email: 'brandon@syscom-gaza.com',
        password: 'admin123',
        role: 'admin',
        phone: '3331234568'
      }
    ];

    console.log('\n📝 Creando/actualizando administradores...\n');

    for (const adminData of admins) {
      // Verificar si el usuario ya existe
      const existingUser = await User.findOne({ email: adminData.email });

      if (existingUser) {
        // Actualizar a admin si existe
        existingUser.role = 'admin';
        existingUser.name = adminData.name;
        if (adminData.phone) existingUser.phone = adminData.phone;
        await existingUser.save();
        console.log(`✅ Usuario actualizado a admin: ${adminData.name} (${adminData.email})`);
      } else {
        // Crear nuevo usuario admin
        const hashedPassword = await bcrypt.hash(adminData.password, 10);
        const newAdmin = new User({
          name: adminData.name,
          email: adminData.email,
          password: hashedPassword,
          role: 'admin',
          phone: adminData.phone
        });
        await newAdmin.save();
        console.log(`✅ Usuario admin creado: ${adminData.name} (${adminData.email})`);
      }
    }

    console.log('\n🎉 Proceso completado exitosamente!');
    console.log('\n📋 Credenciales de acceso:');
    console.log('─────────────────────────────────────');
    admins.forEach(admin => {
      console.log(`\n👤 ${admin.name}`);
      console.log(`   Email: ${admin.email}`);
      console.log(`   Password: ${admin.password}`);
      console.log(`   Rol: Administrador`);
    });
    console.log('\n─────────────────────────────────────');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Conexión cerrada');
    process.exit(0);
  }
}

createAdmins();
