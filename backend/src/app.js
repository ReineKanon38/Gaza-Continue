import express from 'express';
import compression from 'compression';
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
import categoriesRoutes from './routes/categories.js';
import couponsRoutes from './routes/coupons.js';
import inventoryRoutes from './routes/inventory.js';
import { stripeWebhook } from './controllers/paymentController.js';
import { errorHandler } from './middleware/errorHandler.js';
import { corsOptions } from './config/cors.js';
import swaggerUi from 'swagger-ui-express';

const app = express();

app.set('trust proxy', 1);
app.use(helmet());
app.use(compression());
app.use(cors(corsOptions));

// Stripe Webhook needs raw body, must be before express.json()
app.post('/api/payment/webhook', express.raw({ type: 'application/json' }), stripeWebhook);

app.use(express.json());

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: process.env.DISABLE_RATE_LIMIT === 'true' ? 0 : (process.env.RATE_LIMIT_MAX ? parseInt(process.env.RATE_LIMIT_MAX) : 100),
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skip: () => process.env.DISABLE_RATE_LIMIT === 'true'
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
app.use('/api/categories', categoriesRoutes);
app.use('/api/coupons', couponsRoutes);
app.use('/api/inventory', inventoryRoutes);

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
