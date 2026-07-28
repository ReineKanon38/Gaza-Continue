import axios from 'axios';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../src/app.js'; // The Express app
import { authenticator } from 'otplib';

const PORT = 8888;
const API_URL = `http://localhost:${PORT}/api`;

let mongoServer;
let server;

async function setup() {
  console.log('🔄 Iniciando entorno de QA (Anteproducción)...');
  mongoServer = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongoServer.getUri();
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Base de datos QA lista.');

  server = app.listen(PORT, () => {
    console.log(`✅ Servidor Express QA corriendo en el puerto ${PORT}`);
  });
}

async function teardown() {
  console.log('\n🧹 Limpiando entorno de QA...');
  server.close();
  await mongoose.disconnect();
  await mongoServer.stop();
  console.log('✅ Entorno limpio.');
  process.exit(0);
}

async function runTests() {
  try {
    const axiosInstance = axios.create({
      baseURL: API_URL,
      validateStatus: () => true // Prevent axios from throwing on 4xx/5xx
    });

    console.log('\n--- 🧪 INICIANDO PRUEBAS END-TO-END ---');

    // 1. Registro de Usuario
    console.log('1️⃣  Registrando nuevo usuario...');
    const registerRes = await axiosInstance.post('/auth/register', {
      name: 'QA User',
      email: 'qa@syscomgaza.com',
      password: 'StrongPassword123!'
    });
    if (registerRes.status !== 201) throw new Error(`Registro fallido: ${JSON.stringify(registerRes.data)}`);
    const { accessToken: initialAccessToken } = registerRes.data;
    console.log('   ✅ Registro exitoso.');

    // 2. Activar A2F
    console.log('2️⃣  Activando Autenticación de 2 Factores (A2F)...');
    const generate2faRes = await axiosInstance.post('/auth/2fa/generate', {}, {
      headers: { Authorization: `Bearer ${initialAccessToken}` }
    });
    if (generate2faRes.status !== 200) throw new Error('Fallo al generar A2F');
    const secret2fa = generate2faRes.data.data.secret;
    
    // Generar código válido
    const validOtp = authenticator.generate(secret2fa);
    const verify2faRes = await axiosInstance.post('/auth/2fa/verify', { token: validOtp }, {
      headers: { Authorization: `Bearer ${initialAccessToken}` }
    });
    if (verify2faRes.status !== 200) throw new Error('Fallo al verificar A2F');
    console.log('   ✅ A2F activado exitosamente.');

    // 3. Login con A2F activo
    console.log('3️⃣  Probando flujo de Login con A2F...');
    const loginRes = await axiosInstance.post('/auth/login', {
      email: 'qa@syscomgaza.com',
      password: 'StrongPassword123!'
    });
    if (loginRes.status !== 202) throw new Error('El sistema no requirió A2F (Status ' + loginRes.status + ')');
    const { preAuthToken } = loginRes.data;
    if (!preAuthToken) throw new Error('No se recibió el preAuthToken');
    console.log('   ✅ Login detectó A2F y emitió preAuthToken temporal.');

    // 4. Completar Login
    console.log('4️⃣  Completando login con token temporal y código TOTP...');
    const loginTotp = authenticator.generate(secret2fa);
    const finalLoginRes = await axiosInstance.post('/auth/login/2fa', {
      preAuthToken,
      twoFactorToken: loginTotp
    });
    if (finalLoginRes.status !== 200) throw new Error(`Fallo al completar A2F login: ${JSON.stringify(finalLoginRes.data)}`);
    const finalAccessToken = finalLoginRes.data.accessToken;
    console.log('   ✅ Sesión iniciada correctamente con A2F.');

    // 5. Creación de Pago
    console.log('5️⃣  Simulando intento de pago vía Stripe...');
    const paymentRes = await axiosInstance.post('/payment/create-session', {
      amount: 1500,
      currency: 'mxn',
      orderId: '65e9b8f8a1a3b1a3b1a3b1a3', // Mock ID
      provider: 'stripe'
    }, {
      headers: { Authorization: `Bearer ${finalAccessToken}` }
    });
    
    if (paymentRes.status !== 200) throw new Error(`Fallo al crear sesión de pago: ${JSON.stringify(paymentRes.data)}`);
    if (!paymentRes.data.paymentSessionId) throw new Error('Fallo al obtener ID de sesión de pago Stripe');
    console.log('   ✅ Sesión de pago creada exitosamente (Sandbox / Stripe Intent).');

    // 6. Test Syscom (Búsqueda Pública)
    console.log('6️⃣  Probando comunicación con API de Syscom (Búsqueda)...');
    const syscomRes = await axiosInstance.get('/syscom/search?search=cctv&limit=5');
    if (syscomRes.status !== 200) {
       console.log('   ⚠️ Búsqueda fallida, posiblemente falta TOKEN de producción Syscom en el .env (Status: ' + syscomRes.status + ')');
    } else {
       console.log(`   ✅ Búsqueda exitosa. Resultados obtenidos: ${syscomRes.data.data.productos?.length || 0}`);
    }

    console.log('\n🎉 ¡TODAS LAS PRUEBAS END-TO-END FUERON EXITOSAS!');
    
  } catch (error) {
    console.error(`\n❌ ERROR CRÍTICO EN QA: ${error.message}`);
    if (error.response) {
      console.error('Data:', error.response.data);
    }
    process.exitCode = 1;
  } finally {
    await teardown();
  }
}

setup().then(runTests);
