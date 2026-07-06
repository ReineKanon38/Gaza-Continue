import nodemailer from 'nodemailer';
import { logger } from '../utils/logger.js';
import dotenv from 'dotenv';
dotenv.config();

const createTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    logger.warn('Faltan credenciales de correo (EMAIL_USER o EMAIL_PASS). Los correos se simularán en consola.');
    return null;
  }

  // Si se definen parámetros SMTP individuales, los usamos (ej. Hostinger, Outlook, etc.)
  if (process.env.EMAIL_HOST) {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: process.env.EMAIL_SECURE === 'true', // true para puerto 465, false para otros puertos
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  // Por defecto, cae en Gmail
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

const transporter = createTransporter();

export const sendEmail = async ({ to, subject, text, html }) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER || 'no-reply@syscom-gaza.com',
      to,
      subject,
      text,
      html
    };

    if (transporter) {
      const info = await transporter.sendMail(mailOptions);
      logger.info(`📧 Correo enviado a ${to}: ${info.messageId}`);
    } else {
      logger.info(`📧 [SIMULADO] Correo para ${to} | Asunto: ${subject}`);
    }
    return true;
  } catch (error) {
    logger.error('Error enviando correo:', { error: error.message });
    return false;
  }
};

export const sendWelcomeEmail = async (email, name) => {
  return await sendEmail({
    to: email,
    subject: '¡Bienvenido a SYSCOM-GAZA!',
    text: `Hola ${name},\n\nGracias por registrarte en nuestra plataforma. ¡Esperamos que disfrutes nuestros productos!`,
    html: `<h3>Hola ${name},</h3><p>Gracias por registrarte en nuestra plataforma.</p><p>¡Esperamos que disfrutes nuestros productos!</p>`
  });
};

export const sendPasswordResetEmail = async (email, resetUrl) => {
  return await sendEmail({
    to: email,
    subject: 'Restablecimiento de Contraseña',
    text: `Has solicitado restablecer tu contraseña. Ingresa al siguiente enlace para cambiarla: ${resetUrl}\n\nSi no fuiste tú, ignora este correo.`,
    html: `<h3>Restablecimiento de Contraseña</h3>
           <p>Has solicitado restablecer tu contraseña.</p>
           <p>Ingresa al siguiente enlace para cambiarla: <a href="${resetUrl}">${resetUrl}</a></p>
           <p>Si no fuiste tú, ignora este correo.</p>`
  });
};
