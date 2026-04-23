// src/config/db.js
import mongoose from 'mongoose';
import { logger } from '../utils/logger.js';

export const connectDB = async () => { // <--- Agrega el "export" aquí
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        logger.info(`MongoDB conectado: ${conn.connection.host}`);
    } catch (error) {
        logger.error('Error de conexion MongoDB', { message: error.message });
        process.exit(1);
    }
};
