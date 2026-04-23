import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import User from '../src/models/User.js';

// Configuración de conexión a MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sistema-gaza';

async function seedUsers() {
    try {
        console.log('🔄 Conectando a MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Conectado a MongoDB');

        // Hash de contraseñas
        const password = await bcrypt.hash('123456', 12);

        // Usuarios de prueba para crear
        const testUsers = [
            {
                name: 'María González',
                email: 'maria@cliente.com',
                password: password,
                role: 'user',
                phone: '+52 55 1234 5678',
                address: {
                    street: 'Av. Reforma 123',
                    city: 'Ciudad de México',
                    state: 'CDMX',
                    zipCode: '06600',
                    country: 'México'
                }
            },
            {
                name: 'Carlos Rodríguez',
                email: 'carlos@cliente.com',
                password: password,
                role: 'user',
                phone: '+52 33 9876 5432',
                address: {
                    street: 'Calle Juárez 456',
                    city: 'Guadalajara',
                    state: 'Jalisco',
                    zipCode: '44100',
                    country: 'México'
                }
            },
            {
                name: 'Ana Martínez',
                email: 'ana@admin.com',
                password: password,
                role: 'admin',
                phone: '+52 81 5555 7777',
                address: {
                    street: 'Blvd. Díaz Ordaz 789',
                    city: 'Monterrey',
                    state: 'Nuevo León',
                    zipCode: '64000',
                    country: 'México'
                }
            }
        ];

        console.log('🔄 Verificando usuarios existentes...');

        // Verificar si los usuarios ya existen
        for (const userData of testUsers) {
            const existingUser = await User.findOne({ email: userData.email });
            
            if (existingUser) {
                console.log(`⚠️  Usuario ${userData.email} ya existe - Saltando...`);
                continue;
            }

            // Crear el usuario
            const newUser = new User(userData);
            await newUser.save();
            
            console.log(`✅ Usuario ${userData.role} creado: ${userData.name} (${userData.email})`);
        }

        console.log('\n🎉 ¡Usuarios de prueba creados exitosamente!');
        console.log('\n📋 **CREDENCIALES DE ACCESO:**');
        console.log('┌─────────────────────────────────────────────────┐');
        console.log('│                   CLIENTES                      │');
        console.log('├─────────────────────────────────────────────────┤');
        console.log('│ 👤 María González                               │');
        console.log('│ 📧 maria@cliente.com                           │');
        console.log('│ 🔑 123456                                       │');
        console.log('├─────────────────────────────────────────────────┤');
        console.log('│ 👤 Carlos Rodríguez                             │');
        console.log('│ 📧 carlos@cliente.com                          │');
        console.log('│ 🔑 123456                                       │');
        console.log('├─────────────────────────────────────────────────┤');
        console.log('│                ADMINISTRADOR                    │');
        console.log('├─────────────────────────────────────────────────┤');
        console.log('│ 👤 Ana Martínez                                 │');
        console.log('│ 📧 ana@admin.com                               │');
        console.log('│ 🔑 123456                                       │');
        console.log('└─────────────────────────────────────────────────┘');

    } catch (error) {
        console.error('❌ Error al crear usuarios de prueba:', error);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Desconectado de MongoDB');
        process.exit(0);
    }
}

// Ejecutar el script
seedUsers();