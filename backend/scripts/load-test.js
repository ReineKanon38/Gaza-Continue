import http from 'k6/http';
import { check, sleep } from 'k6';

// 1. Configuración del perfil de carga (Ramp-up) y Umbrales (Thresholds)
export const options = {
  stages: [
    { duration: '2m', target: 50 }, // Ramp-up: 0 a 50 VUs en 2 minutos
    { duration: '3m', target: 50 }, // Sustained: Mantener 50 VUs por 3 minutos
    { duration: '1m', target: 0 },  // Ramp-down: 50 a 0 VUs en 1 minuto
  ],
  thresholds: {
    // Latencia p95 debe ser menor a 300ms
    http_req_duration: ['p(95)<300'],
    // La tasa de errores de servidor (5xx) debe ser inferior al 1%
    http_req_failed: ['rate<0.01'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:5000/api/products';

export default function () {
  // Simulación de búsqueda aleatoria o consulta general del catálogo
  const searchTerms = ['', '?search=camara', '?category=seguridad', '?page=1&limit=10'];
  const randomQuery = searchTerms[Math.floor(Math.random() * searchTerms.length)];

  const res = http.get(`${BASE_URL}${randomQuery}`, {
    headers: {
      'Accept': 'application/json',
    },
  });

  // Validaciones a nivel de HTTP Response
  check(res, {
    'código de estado es 200 OK': (r) => r.status === 200,
    'tiempo de respuesta es aceptable (<300ms)': (r) => r.timings.duration < 300,
    'sin errores internos de servidor (5xx)': (r) => r.status < 500,
  });

  // Pausa realista entre peticiones por usuario virtual (1s a 2s)
  sleep(Math.random() * 1 + 1);
}
