// Fix DNS PRIMERO (para Windows)
await import('./src/utils/dns-fix.js');

// Cargar variables de entorno
import dotenv from 'dotenv';
dotenv.config();

// Ahora importar y arrancar el servidor
await import('./server.js');
