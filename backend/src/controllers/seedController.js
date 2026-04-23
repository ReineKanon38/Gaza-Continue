import bcrypt from 'bcrypt';
import User from '../models/User.js';

// Controlador para crear usuarios de prueba
export const createTestUsers = async (req, res) => {
    try {
        // Hash de contraseñas
        const password = await bcrypt.hash('123456', 12);

        // Usuarios de prueba para crear
        const testUsers = [
            {
                name: 'María González',
                email: 'maria@cliente.com',
                password: password,
                role: 'cliente',
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
                role: 'cliente',
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

        const createdUsers = [];
        const skippedUsers = [];

        // Verificar si los usuarios ya existen
        for (const userData of testUsers) {
            const existingUser = await User.findOne({ email: userData.email });
            
            if (existingUser) {
                skippedUsers.push({
                    name: userData.name,
                    email: userData.email,
                    role: userData.role,
                    reason: 'Ya existe'
                });
                continue;
            }

            // Crear el usuario
            const newUser = new User(userData);
            await newUser.save();
            
            createdUsers.push({
                name: userData.name,
                email: userData.email,
                role: userData.role,
                id: newUser._id
            });
        }

        res.status(200).json({
            success: true,
            message: 'Proceso de creación de usuarios completado',
            data: {
                created: createdUsers,
                skipped: skippedUsers,
                credentials: {
                    password: '123456',
                    note: 'Todos los usuarios usan la misma contraseña para pruebas'
                }
            }
        });

    } catch (error) {
        console.error('Error al crear usuarios de prueba:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor al crear usuarios de prueba',
            error: error.message
        });
    }
};

// Controlador para listar todos los usuarios (solo para admin)
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.status(200).json({
            success: true,
            data: users
        });
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener usuarios',
            error: error.message
        });
    }
};