import axios from 'axios';
import { logger } from '../utils/logger.js';
import { sendEmail } from './emailService.js';
import dotenv from 'dotenv';
dotenv.config();

class NotificationService {
  constructor() {
    this.botToken = process.env.TELEGRAM_BOT_TOKEN || '';
    this.chatId = process.env.TELEGRAM_CHAT_ID || '';
    this.adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER || '';
  }

  getCredentials() {
    return {
      botToken: process.env.TELEGRAM_BOT_TOKEN || this.botToken,
      chatId: process.env.TELEGRAM_CHAT_ID || this.chatId,
      adminEmail: process.env.ADMIN_EMAIL || this.adminEmail
    };
  }

  /**
   * Envía un mensaje formateado a Telegram
   */
  async sendTelegramMessage(text) {
    const { botToken, chatId } = this.getCredentials();
    if (!botToken || !chatId) {
      logger.debug('[Telegram] Notificación no enviada: TELEGRAM_BOT_TOKEN o TELEGRAM_CHAT_ID faltantes en .env');
      return false;
    }

    try {
      const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
      const response = await axios.post(url, {
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true
      }, { timeout: 8000 });

      if (response.data && response.data.ok) {
        logger.info('📱 [Telegram] Notificación enviada con éxito al administrador');
        return true;
      }
      return false;
    } catch (error) {
      logger.error('❌ [Telegram] Error enviando notificación:', { message: error.message });
      return false;
    }
  }

  /**
   * Notifica al administrador sobre una nueva orden pagada
   */
  async notifyNewPaidOrder(order) {
    if (!order) return;

    try {
      const productsSummary = (order.products || [])
        .map(item => `• ${item.quantity}x ${item.product?.name || 'Producto'} ($${Number(item.price || 0).toLocaleString('es-MX')} MXN)`)
        .join('\n');

      const destination = order.shippingAddress
        ? `${order.shippingAddress.city || ''}, ${order.shippingAddress.state || ''} (CP ${order.shippingAddress.zipCode || ''})`
        : 'No especificado';

      const telegramMessage = `
🔔 <b>¡NUEVA VENTA PAGADA EN GAZA!</b> 🚀
━━━━━━━━━━━━━━━━━━━━
💰 <b>Total Cobrado:</b> $${Number(order.total || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
📦 <b>Orden ID:</b> <code>${order.orderId || 'N/A'}</code>
👤 <b>Cliente:</b> ${order.customerName || 'Cliente'}
📧 <b>Email:</b> ${order.customerEmail || 'N/A'}
📱 <b>Teléfono:</b> ${order.customerPhone || 'N/A'}
📍 <b>Destino:</b> ${destination}
💳 <b>Estado de Pago:</b> Aprobado ✅

🛒 <b>Productos:</b>
${productsSummary || 'Sin productos'}

🔗 <a href="${process.env.FRONTEND_URL || 'https://syscomgaza.com'}/admin">Abrir Panel de Administración GAZA</a>
━━━━━━━━━━━━━━━━━━━━
`;

      // 1. Enviar notificación por Telegram (en background)
      this.sendTelegramMessage(telegramMessage).catch(() => {});

      // 2. Enviar notificación por correo administrativo si está configurado
      const { adminEmail } = this.getCredentials();
      if (adminEmail) {
        sendEmail({
          to: adminEmail,
          subject: `🎉 [VENTA] Nueva orden pagada ${order.orderId} - $${Number(order.total || 0).toLocaleString('es-MX')} MXN`,
          text: `Nueva orden ${order.orderId} pagada por $${order.total} MXN de ${order.customerName}. Revisa el panel en ${process.env.FRONTEND_URL || 'https://syscomgaza.com'}/admin`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px;">
              <h2 style="color: #1e3a8a; margin-top: 0;">🎉 ¡Nueva Venta Registrada en GAZA!</h2>
              <p>Se ha confirmado un pago exitoso con los siguientes detalles:</p>
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                <tr><td style="padding: 8px 0; font-weight: bold;">Orden:</td><td>${order.orderId}</td></tr>
                <tr><td style="padding: 8px 0; font-weight: bold;">Monto Total:</td><td style="color: #16a34a; font-size: 18px; font-weight: bold;">$${Number(order.total || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN</td></tr>
                <tr><td style="padding: 8px 0; font-weight: bold;">Cliente:</td><td>${order.customerName} (${order.customerEmail})</td></tr>
                <tr><td style="padding: 8px 0; font-weight: bold;">Destino:</td><td>${destination}</td></tr>
              </table>
              <div style="text-align: center; margin-top: 25px;">
                <a href="${process.env.FRONTEND_URL || 'https://syscomgaza.com'}/admin" style="background: #2563eb; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">Ir a Despachar en Panel de Administración</a>
              </div>
            </div>
          `
        }).catch(err => {
          logger.warn('No se pudo enviar correo al administrador:', err.message);
        });
      }

    } catch (err) {
      logger.error('Error procesando notificación de nueva orden:', err.message);
    }
  }
}

export default new NotificationService();
