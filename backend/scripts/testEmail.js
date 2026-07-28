import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { sendPasswordResetEmail } from '../src/services/emailService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

console.log('----------------------------------------------------');
console.log('📧 PRUEBA DE ENVÍO DE CORREO DE RESTABLECIMIENTO');
console.log('----------------------------------------------------');
console.log('Usuario SMTP (EMAIL_USER):', process.env.EMAIL_USER || 'NO CONFIGURADO');
console.log('Password SMTP (EMAIL_PASS):', process.env.EMAIL_PASS ? '********' : 'NO CONFIGURADO');

async function runTest() {
  const targetEmail = process.argv[2] || process.env.EMAIL_USER;
  console.log(`\n⏳ Enviando correo de prueba a: ${targetEmail}...`);

  const dummyResetUrl = 'http://localhost:5173/reset/ejemplo_token_123456';
  const success = await sendPasswordResetEmail(targetEmail, dummyResetUrl);

  if (success) {
    console.log(`\n✅ ¡ÉXITO! El correo de restablecimiento fue enviado exitosamente a ${targetEmail}.`);
    console.log('Revisa tu bandeja de entrada o carpeta de SPAM.');
  } else {
    console.log('\n❌ ERROR: Ocurrió un fallo al enviar el correo. Verifica las credenciales en .env.');
  }
}

runTest();
