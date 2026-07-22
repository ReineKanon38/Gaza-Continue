import axios from 'axios';

const API_URL = process.env.API_URL || 'http://localhost:5000/api';

async function runConcurrencyTest() {
  console.log('🚀 Iniciando prueba de concurrencia y transacciones ACID en GAZA Backend...\n');

  try {
    // 1. Iniciar sesión o registrar un usuario de prueba
    const authRes = await axios.post(`${API_URL}/auth/register`, {
      name: 'Tester Concurrente',
      email: `tester_${Date.now()}@example.com`,
      password: 'password123'
    });

    const token = authRes.data.token || authRes.data.data?.token;
    console.log('✅ Usuario registrado y token obtenido.');

    // Note: Reemplaza esto con un ID de producto real con stock = 1 de tu base de datos
    console.log('\n⚠️ Instrucciones para probar con un producto real:');
    console.log('1. Crea un producto en la base de datos con stock = 1.');
    console.log('2. Envía dos peticiones simultáneas con el siguiente script.\n');

    const orderPayload = {
      products: [{ productId: 'ID_DE_TU_PRODUCTO_AQUÍ', quantity: 1 }],
      shippingAddress: {
        street: 'Calle Prueba',
        number: '123',
        neighborhood: 'Centro',
        city: 'CDMX',
        state: 'CDMX',
        zipCode: '01000'
      },
      paymentInfo: {
        method: 'credit_card',
        cardType: 'visa',
        cardLastFour: '4242'
      }
    };

    console.log('🔥 Simulando 2 compras SIMULTÁNEAS al mismo tiempo (Promise.all)...');
    
    const req1 = axios.post(`${API_URL}/orders`, orderPayload, {
      headers: { Authorization: `Bearer ${token}` }
    }).catch(err => err.response);

    const req2 = axios.post(`${API_URL}/orders`, orderPayload, {
      headers: { Authorization: `Bearer ${token}` }
    }).catch(err => err.response);

    const [res1, res2] = await Promise.all([req1, req2]);

    console.log(`\nResultado Petición 1: Status ${res1.status} - ${JSON.stringify(res1.data)}`);
    console.log(`Resultado Petición 2: Status ${res2.status} - ${JSON.stringify(res2.data)}`);

    if ((res1.status === 201 && res2.status === 400) || (res1.status === 400 && res2.status === 201)) {
      console.log('\n🎉 ¡ÉXITO! La transacción de Mongoose bloqueó la segunda compra y evitó la sobreventa (Overbooking).');
    } else {
      console.log('\n⚠️ Revisa los códigos de respuesta arriba.');
    }
  } catch (error) {
    console.error('❌ Error en el script:', error.message);
  }
}

runConcurrencyTest();
