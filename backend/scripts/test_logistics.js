import axios from 'axios';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../src/app.js';
import User from '../src/models/User.js';
import Order from '../src/models/Order.js';

const PORT = 8889;
const API_URL = `http://localhost:${PORT}/api`;

let mongoServer;
let server;

async function setup() {
  console.log('🔄 Iniciando entorno de Logística...');
  mongoServer = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongoServer.getUri();
  await mongoose.connect(process.env.MONGODB_URI);

  server = app.listen(PORT, () => {
    console.log(`✅ Servidor Express corriendo en el puerto ${PORT}`);
  });
}

async function teardown() {
  console.log('\n🧹 Limpiando entorno...');
  server.close();
  await mongoose.disconnect();
  await mongoServer.stop();
  process.exit(0);
}

async function runTests() {
  try {
    const axiosInstance = axios.create({ baseURL: API_URL, validateStatus: () => true });

    // Crear un usuario Admin real en la base de datos
    const adminUser = await User.create({
      name: 'Admin Logística',
      email: 'admin-logistica@syscomgaza.com',
      password: 'password123',
      role: 'admin' // Importante para que pasen las rutas logísticas
    });

    const loginRes = await axiosInstance.post('/auth/login', {
      email: 'admin-logistica@syscomgaza.com',
      password: 'password123'
    });
    const adminToken = loginRes.data.token;
    
    // Crear una Orden directamente en Mongoose
    const order = await Order.create({
      orderId: 'ORD-12345',
      user: adminUser._id,
      customerName: 'Cliente Final',
      customerEmail: 'cliente@test.com',
      total: 100,
      products: [],
      shippingAddress: {
        street: 'Calle',
        city: 'Ciudad',
        state: 'Estado',
        zipCode: '12345'
      },
      paymentInfo: { method: 'credit_card', cardType: 'visa' }
    });

    console.log(`\n📦 Orden creada: ${order._id}`);
    const headers = { Authorization: `Bearer ${adminToken}` };

    // 1. Bodega
    console.log('\n1️⃣  Marcando como recibida en BODEGA...');
    const bodegaRes = await axiosInstance.put(`/orders/${order._id}/logistics/bodega`, {}, { headers });
    if (bodegaRes.status !== 200) throw new Error(JSON.stringify(bodegaRes.data));
    console.log('   ✅ Orden en Bodega GAZA');

    // 2. Ship
    console.log('\n2️⃣  Enviando al cliente...');
    const shipRes = await axiosInstance.put(`/orders/${order._id}/logistics/ship`, {
      trackingNumber: '1Z9999999999999999'
    }, { headers });
    if (shipRes.status !== 200) throw new Error(JSON.stringify(shipRes.data));
    console.log('   ✅ Orden en tránsito y Correo enviado a:', shipRes.data.data.customerEmail);

    // 3. Deliver
    console.log('\n3️⃣  Marcando como Entregada...');
    const deliverRes = await axiosInstance.put(`/orders/${order._id}/logistics/deliver`, {}, { headers });
    if (deliverRes.status !== 200) throw new Error(JSON.stringify(deliverRes.data));
    console.log('   ✅ Orden Entregada.');

    console.log('\n🎉 Flujo de logística probado con éxito.');
  } catch (error) {
    console.error(`\n❌ ERROR: ${error.message}`);
    process.exitCode = 1;
  } finally {
    await teardown();
  }
}

setup().then(runTests);
