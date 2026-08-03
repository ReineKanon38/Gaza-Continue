import nodemailer from 'nodemailer';
import { logger } from '../utils/logger.js';
import dotenv from 'dotenv';
import { getWelcomeEmailHtml, getPasswordResetEmailHtml, getOrderShippingEmailHtml } from '../templates/emailTemplates.js';
dotenv.config();

let cachedTransporter = null;
let cachedCredentials = '';

const getTransporter = () => {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    logger.warn('Faltan credenciales de correo (EMAIL_USER o EMAIL_PASS). Los correos se simularán en consola.');
    return null;
  }

  const currentCreds = `${user}:${pass}:${process.env.EMAIL_HOST || 'gmail'}`;
  if (cachedTransporter && cachedCredentials === currentCreds) {
    return cachedTransporter;
  }

  if (process.env.EMAIL_HOST) {
    cachedTransporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: { user, pass },
      tls: { rejectUnauthorized: false }
    });
  } else {
    cachedTransporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass },
      tls: { rejectUnauthorized: false }
    });
  }

  cachedCredentials = currentCreds;
  return cachedTransporter;
};

export const sendEmail = async ({ to, subject, text, html }) => {
  try {
    const transporter = getTransporter();
    const sender = process.env.EMAIL_USER ? `"SYSCOM-GAZA" <${process.env.EMAIL_USER}>` : 'no-reply@syscom-gaza.com';

    const mailOptions = {
      from: sender,
      to,
      subject,
      text,
      html
    };

    if (transporter) {
      const info = await transporter.sendMail(mailOptions);
      logger.info(`📧 Correo enviado a ${to}: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } else {
      logger.info(`📧 [SIMULADO] Correo para ${to} | Asunto: ${subject}`);
      return { success: true, simulated: true };
    }
  } catch (error) {
    logger.error('Error enviando correo:', { error: error.message, stack: error.stack });
    return { success: false, error: error.message };
  }
};

export const sendWelcomeEmail = async (email, name) => {
  const htmlContent = getWelcomeEmailHtml({
    nombre_usuario: name,
    url_catalogo: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/products`,
    url_soporte: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/contact`,
    url_terminos: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/terms`,
    url_privacidad: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/privacy`
  });

  const result = await sendEmail({
    to: email,
    subject: '¡Bienvenido a SYSCOM-GAZA!',
    text: `Hola ${name},\n\nGracias por registrarte en SYSCOM-GAZA. ¡Esperamos que disfrutes nuestros productos!`,
    html: htmlContent
  });
  return result?.success === true;
};

export const sendPasswordResetEmail = async (email, resetUrl) => {
  const htmlContent = getPasswordResetEmailHtml({
    nombre_usuario: email.split('@')[0], // Using email prefix as name if not provided
    url_recuperacion: resetUrl,
    url_soporte: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/contact`,
    url_terminos: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/terms`,
    url_privacidad: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/privacy`
  });

  const result = await sendEmail({
    to: email,
    subject: 'Restablecimiento de Contraseña - SYSCOM-GAZA',
    text: `Hola,\n\nHas solicitado restablecer tu contraseña en SYSCOM-GAZA.\nIngresa al siguiente enlace para cambiarla:\n${resetUrl}\n\nEste enlace expirará en 15 minutos.\n\nSi no fuiste tú, ignora este correo.`,
    html: htmlContent
  });
  return result?.success === true;
};

export const sendShippingEmail = async (email, name, orderId, trackingNumber) => {
  const htmlContent = getOrderShippingEmailHtml({
    nombre_usuario: name,
    numero_orden: orderId,
    tracking_number: trackingNumber,
    url_estado_pedido: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/profile`,
    url_soporte: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/contact`,
    url_terminos: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/terms`,
    url_privacidad: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/privacy`
  });

  return await sendEmail({
    to: email,
    subject: '¡Tu pedido de SYSCOM-GAZA va en camino!',
    text: `Hola ${name},\n\nNos emociona informarte que tu pedido #${orderId} ha sido enviado y va en camino hacia ti.\nTu número de guía es: ${trackingNumber}\n\nPuedes rastrear tu paquete utilizando este número en la página de la paquetería correspondiente.\n\n¡Gracias por tu compra!`,
    html: htmlContent
  });
};
