// src/config/db.js
import mongoose from 'mongoose';
import { logger } from '../utils/logger.js';

export const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            maxPoolSize: 50,
        });

        logger.info(`MongoDB conectado: ${conn.connection.host}`);

        // Listeners para reconexión y monitoreo en la nube
        mongoose.connection.on('disconnected', () => {
            logger.warn('⚠️ Conexión a MongoDB perdida. Intentando reconectar...');
        });

        mongoose.connection.on('reconnected', () => {
            logger.info('✅ Conexión a MongoDB restaurada.');
        });

    } catch (error) {
        logger.error('Error de conexion MongoDB', { message: error.message });
        process.exit(1);
    }
};
