import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import fs from 'fs';
import path from 'path';
import authRoutes from './routes/auth.js';
import productsRoutes from './routes/products.js';
import ordersRoutes from './routes/orders.js';
import statsRoutes from './routes/stats.js';
import seedRoutes from './routes/seed.js';
import syscomRoutes from './routes/syscom.js';
import paymentRoutes from './routes/payment.js';
import configRoutes from './routes/config.js';
import addressRoutes from './routes/address.js';
import { errorHandler } from './middleware/errorHandler.js';
import { corsOptions } from './config/cors.js';
import swaggerUi from 'swagger-ui-express';

const app = express();

app.set('trust proxy', 1);
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json());

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: 'draft-7',
  legacyHeaders: false
});
app.use('/api', apiLimiter);

app.get('/', (req, res) => {
  res.send('✅ Backend del proyecto SYSCOM-GAZA funcionando correctamente');
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/seed', seedRoutes);
app.use('/api/syscom', syscomRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/config', configRoutes);
app.use('/api/address', addressRoutes);

try {
  const specPath = path.resolve('./src/docs/openapi.json');
  const raw = fs.readFileSync(specPath, 'utf-8');
  const spec = JSON.parse(raw);
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(spec));
} catch (e) {
  console.warn('⚠️ No se pudo cargar OpenAPI spec:', e.message);
}

app.use(errorHandler);

export default app;
