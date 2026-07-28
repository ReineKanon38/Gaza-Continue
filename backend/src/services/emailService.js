import nodemailer from 'nodemailer';
import { logger } from '../utils/logger.js';
import dotenv from 'dotenv';
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
  const result = await sendEmail({
    to: email,
    subject: '¡Bienvenido a SYSCOM-GAZA!',
    text: `Hola ${name},\n\nGracias por registrarte en SYSCOM-GAZA. ¡Esperamos que disfrutes nuestros productos!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #ffffff;">
        <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #00d4ff;">
          <h2 style="color: #020617; margin: 0;">SYSCOM-GAZA</h2>
        </div>
        <div style="padding: 20px 0;">
          <h3>Hola ${name},</h3>
          <p>Gracias por registrarte en nuestra plataforma.</p>
          <p>¡Esperamos que disfrutes de nuestros productos!</p>
        </div>
      </div>
    `
  });
  return result?.success === true;
};

export const sendPasswordResetEmail = async (email, resetUrl) => {
  const result = await sendEmail({
    to: email,
    subject: 'Restablecimiento de Contraseña - SYSCOM-GAZA',
    text: `Hola,\n\nHas solicitado restablecer tu contraseña en SYSCOM-GAZA.\nIngresa al siguiente enlace para cambiarla:\n${resetUrl}\n\nEste enlace expirará en 15 minutos.\n\nSi no fuiste tú, ignora este correo.`,
    html: `
      <div style="font-family: Arial, Helvetica, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; color: #1e293b;">
        <div style="text-align: center; padding: 20px 0; border-bottom: 2px solid #00d4ff; background-color: #020617; border-top-left-radius: 12px; border-top-right-radius: 12px;">
          <h2 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: 1px;">SYSCOM<span style="color: #00d4ff;">-GAZA</span></h2>
          <p style="color: #94a3b8; margin: 4px 0 0 0; font-size: 13px;">Seguridad y Soluciones Tecnológicas</p>
        </div>
        <div style="padding: 30px 24px;">
          <h3 style="color: #0f172a; margin-top: 0; font-size: 20px;">Restablecimiento de Contraseña</h3>
          <p style="color: #334155; font-size: 15px; line-height: 1.6;">
            Hemos recibido una solicitud para restablecer la contraseña de tu cuenta registrada con el correo <strong>${email}</strong>.
          </p>
          <p style="color: #334155; font-size: 15px; line-height: 1.6;">
            Haz clic en el siguiente botón para continuar y crear una nueva contraseña segura:
          </p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${resetUrl}" target="_blank" style="background-color: #00d4ff; color: #020617; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 700; font-size: 16px; display: inline-block; box-shadow: 0 4px 14px rgba(0, 212, 255, 0.4);">
              Restablecer Contraseña
            </a>
          </div>
          <p style="color: #64748b; font-size: 13px; line-height: 1.5;">
            Si el botón no funciona, copia y pega el siguiente enlace directamente en tu navegador web:<br/>
            <a href="${resetUrl}" style="color: #0284c7; word-break: break-all;">${resetUrl}</a>
          </p>
          <div style="margin-top: 28px; padding: 12px 16px; background-color: #f8fafc; border-left: 4px solid #3b82f6; border-radius: 4px;">
            <p style="color: #475569; font-size: 12px; margin: 0;">
              <strong>🔒 Seguridad:</strong> Este enlace tiene una validez de <strong>15 minutos</strong>. Si no solicitaste restablecer tu contraseña, puedes ignorar este correo de forma segura.
            </p>
          </div>
        </div>
        <div style="text-align: center; color: #94a3b8; font-size: 12px; padding: 16px; border-top: 1px solid #f1f5f9; background-color: #f8fafc; border-bottom-left-radius: 12px; border-bottom-right-radius: 12px;">
          &copy; ${new Date().getFullYear()} SYSCOM-GAZA. Todos los derechos reservados.
        </div>
      </div>
    `
  });
  return result?.success === true;
};

export const sendShippingEmail = async (email, name, orderId, trackingNumber) => {
  return await sendEmail({
    to: email,
    subject: '¡Tu pedido de SYSCOM-GAZA va en camino!',
    text: `Hola ${name},\n\nNos emociona informarte que tu pedido #${orderId} ha sido enviado y va en camino hacia ti.\nTu número de guía es: ${trackingNumber}\n\nPuedes rastrear tu paquete utilizando este número en la página de la paquetería correspondiente.\n\n¡Gracias por tu compra!`,
    html: `<h3>Hola ${name},</h3>
           <p>Nos emociona informarte que tu pedido <strong>#${orderId}</strong> ha sido enviado y va en camino hacia ti.</p>
           <p>Tu número de guía es: <br/><strong><span style="font-size: 18px;">${trackingNumber}</span></strong></p>
           <p>Puedes rastrear tu paquete utilizando este número en la página de la paquetería correspondiente.</p>
           <br/>
           <p>¡Gracias por tu compra!</p>`
  });
};
