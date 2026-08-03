export const getWelcomeEmailHtml = ({ nombre_usuario, url_catalogo, url_soporte, url_terminos, url_privacidad }) => `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bienvenido a Gaza</title>
    <style>
        body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
        img { -ms-interpolation-mode: bicubic; }
        body { margin: 0; padding: 0; width: 100% !important; background-color: #f4f7f6; }
        @media (prefers-color-scheme: dark) {
            .email-bg { background-color: #121212 !important; }
            .content-bg { background-color: #1e1e1e !important; border-color: #333333 !important; }
            .text-main { color: #ffffff !important; }
            .text-muted { color: #aaaaaa !important; }
            .footer-bg { background-color: #0f0f0f !important; }
        }
    </style>
</head>
<body class="email-bg" style="margin:0; padding:0; background-color:#f4f7f6; font-family:Arial, Helvetica, sans-serif;">
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:#f4f7f6;" class="email-bg">
        <tr>
            <td align="center" style="padding: 40px 10px;">
                <table border="0" cellpadding="0" cellspacing="0" width="600" class="content-bg" style="background-color:#ffffff; border-radius:8px; overflow:hidden; border:1px solid #e0e0e0;">
                    <tr>
                        <td align="center" style="padding: 30px 20px; background-color:#001F3F;">
                            <h1 style="color:#ffffff; margin:0; font-size:28px; letter-spacing: 2px;">GAZA</h1>
                        </td>
                    </tr>
                    <tr>
                        <td align="left" style="padding: 40px 30px; color:#333333;" class="text-main">
                            <h2 style="margin:0 0 20px 0; font-size:24px; color:#001F3F;" class="text-main">¡Hola, ${nombre_usuario}!</h2>
                            <p style="margin:0 0 15px 0; font-size:16px; line-height:1.6;">Nos emociona darte la bienvenida oficial a <strong>Gaza</strong>. Tu cuenta ha sido creada exitosamente y ahora formas parte de nuestra comunidad.</p>
                            <p style="margin:0 0 25px 0; font-size:16px; line-height:1.6;">Desde hoy, tienes acceso exclusivo a nuestro catálogo completo, donde encontrarás las mejores soluciones en tecnología y seguridad al alcance de un clic.</p>
                            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td align="center" style="padding: 10px 0 30px 0;">
                                        <a href="${url_catalogo}" style="background-color:#001F3F; color:#ffffff; text-decoration:none; padding:15px 30px; border-radius:5px; font-size:16px; font-weight:bold; display:inline-block;">Explorar el Catálogo</a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td align="center" style="padding: 30px; background-color:#f8f9fa;" class="footer-bg">
                            <h3 style="margin:0 0 15px 0; font-size:18px; color:#001F3F;" class="text-main">Lleva Gaza siempre contigo</h3>
                            <p style="margin:0 0 20px 0; font-size:14px; color:#666666;" class="text-muted">Descarga nuestra app móvil y gestiona tus pedidos desde cualquier lugar.</p>
                            <table border="0" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center" style="padding: 0 10px;">
                                        <a href="#" style="display:inline-block;"><img src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg" alt="Download on the App Store" width="120" style="display:block; border:none;"></a>
                                    </td>
                                    <td align="center" style="padding: 0 10px;">
                                        <a href="#" style="display:inline-block;"><img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Get it on Google Play" width="120" style="display:block; border:none;"></a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td align="center" style="padding: 30px; background-color:#001F3F; color:#ffffff;">
                            <p style="margin:0 0 10px 0; font-size:12px; line-height:1.5; color:#a0aec0;">Recibes este correo porque te has registrado en Gaza.<br>Si no creaste esta cuenta, comunícate con nosotros inmediatamente.</p>
                            <p style="margin:0; font-size:12px;">
                                <a href="${url_soporte}" style="color:#ffffff; text-decoration:underline;">Soporte</a> | 
                                <a href="${url_terminos}" style="color:#ffffff; text-decoration:underline;">Términos y Condiciones</a> | 
                                <a href="${url_privacidad}" style="color:#ffffff; text-decoration:underline;">Políticas de Privacidad</a>
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
`;

export const getOrderShippingEmailHtml = ({ nombre_usuario, numero_orden, tracking_number, url_estado_pedido, url_soporte, url_terminos, url_privacidad }) => `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tu Pedido va en camino</title>
    <style>
        body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
        img { -ms-interpolation-mode: bicubic; }
        body { margin: 0; padding: 0; width: 100% !important; background-color: #f4f7f6; }
        @media (prefers-color-scheme: dark) {
            .email-bg { background-color: #121212 !important; }
            .content-bg { background-color: #1e1e1e !important; border-color: #333333 !important; }
            .text-main { color: #ffffff !important; }
            .text-muted { color: #aaaaaa !important; }
            .border-line { border-color: #333333 !important; }
            .item-bg { background-color: #2a2a2a !important; }
        }
    </style>
</head>
<body class="email-bg" style="margin:0; padding:0; background-color:#f4f7f6; font-family:Arial, Helvetica, sans-serif;">
    <table border="0" cellpadding="0" cellspacing="0" width="100%" class="email-bg" style="background-color:#f4f7f6;">
        <tr>
            <td align="center" style="padding: 40px 10px;">
                <table border="0" cellpadding="0" cellspacing="0" width="600" class="content-bg" style="background-color:#ffffff; border-radius:8px; overflow:hidden; border:1px solid #e0e0e0;">
                    <tr>
                        <td align="center" style="padding: 25px 20px; background-color:#001F3F;">
                            <h1 style="color:#ffffff; margin:0; font-size:24px; letter-spacing: 1px;">GAZA</h1>
                        </td>
                    </tr>
                    <tr>
                        <td align="left" style="padding: 30px 30px 15px 30px;" class="text-main">
                            <h2 style="margin:0 0 10px 0; font-size:22px; color:#001F3F;" class="text-main">¡Tu pedido va en camino, ${nombre_usuario}!</h2>
                            <p style="margin:0 0 20px 0; font-size:15px; color:#555555; line-height:1.5;" class="text-muted">Nos emociona informarte que tu pedido <strong>#${numero_orden}</strong> ha sido empaquetado y entregado a la paquetería.</p>
                            
                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 25px;">
                                <tr>
                                    <td align="left" style="padding: 15px; background-color: #f8f9fa; border-radius: 5px; border-left: 4px solid #001F3F;" class="item-bg text-main">
                                        <p style="margin:0 0 5px 0; font-size:14px; color:#666666;" class="text-muted">Número de Guía (Tracking):</p>
                                        <p style="margin:0; font-size:22px; font-weight:bold; color:#001F3F;" class="text-main">${tracking_number}</p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td align="center" style="padding: 10px 30px 40px 30px;">
                            <a href="${url_estado_pedido}" style="background-color:#001F3F; color:#ffffff; text-decoration:none; padding:15px 40px; border-radius:5px; font-size:16px; font-weight:bold; display:inline-block;">Rastrear mi paquete</a>
                        </td>
                    </tr>
                    <tr>
                        <td align="center" style="padding: 30px; background-color:#001F3F; color:#ffffff;">
                            <p style="margin:0 0 10px 0; font-size:12px; line-height:1.5; color:#a0aec0;">Recibes este correo porque realizaste una compra en Gaza.<br>¡Gracias por tu preferencia!</p>
                            <p style="margin:0; font-size:12px;">
                                <a href="${url_soporte}" style="color:#ffffff; text-decoration:underline;">Soporte</a> | 
                                <a href="${url_terminos}" style="color:#ffffff; text-decoration:underline;">Términos y Condiciones</a> | 
                                <a href="${url_privacidad}" style="color:#ffffff; text-decoration:underline;">Políticas de Privacidad</a>
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
`;

export const getPasswordResetEmailHtml = ({ nombre_usuario, url_recuperacion, url_soporte, url_terminos, url_privacidad }) => `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Recuperación de Contraseña</title>
    <style>
        body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
        body { margin: 0; padding: 0; width: 100% !important; background-color: #f4f7f6; }
        @media (prefers-color-scheme: dark) {
            .email-bg { background-color: #121212 !important; }
            .content-bg { background-color: #1e1e1e !important; border-color: #333333 !important; }
            .text-main { color: #ffffff !important; }
            .text-muted { color: #aaaaaa !important; }
            .alert-bg { background-color: rgba(255, 193, 7, 0.1) !important; border-color: #ffc107 !important; }
        }
    </style>
</head>
<body class="email-bg" style="margin:0; padding:0; background-color:#f4f7f6; font-family:Arial, Helvetica, sans-serif;">
    <table border="0" cellpadding="0" cellspacing="0" width="100%" class="email-bg" style="background-color:#f4f7f6;">
        <tr>
            <td align="center" style="padding: 40px 10px;">
                <table border="0" cellpadding="0" cellspacing="0" width="600" class="content-bg" style="background-color:#ffffff; border-radius:8px; overflow:hidden; border:1px solid #e0e0e0;">
                    <tr>
                        <td align="center" style="padding: 25px 20px; background-color:#001F3F;">
                            <h1 style="color:#ffffff; margin:0; font-size:24px; letter-spacing: 1px;">GAZA</h1>
                        </td>
                    </tr>
                    <tr>
                        <td align="left" style="padding: 40px 30px; color:#333333;" class="text-main">
                            <h2 style="margin:0 0 20px 0; font-size:22px; color:#001F3F;" class="text-main">Restablecer tu contraseña</h2>
                            <p style="margin:0 0 15px 0; font-size:16px; line-height:1.6;">Hola, <strong>${nombre_usuario}</strong>.</p>
                            <p style="margin:0 0 25px 0; font-size:16px; line-height:1.6;">Hemos recibido una solicitud para cambiar la contraseña asociada a tu cuenta. Para continuar y configurar tu nueva contraseña, haz clic en el botón de abajo.</p>
                            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td align="center" style="padding: 10px 0 35px 0;">
                                        <a href="${url_recuperacion}" style="background-color:#001F3F; color:#ffffff; text-decoration:none; padding:15px 35px; border-radius:5px; font-size:16px; font-weight:bold; display:inline-block; letter-spacing: 0.5px;">Restablecer mi contraseña</a>
                                    </td>
                                </tr>
                            </table>
                            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td align="left" style="padding: 15px; background-color: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 4px;" class="alert-bg">
                                        <p style="margin:0; font-size:13px; color:#555555; line-height:1.5;" class="text-muted"><strong>Seguridad:</strong> Si tú no solicitaste este cambio, por favor ignora este correo. Tu contraseña actual seguirá siendo la misma y tu cuenta está segura.</p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td align="center" style="padding: 30px; background-color:#001F3F; color:#ffffff;">
                            <p style="margin:0 0 10px 0; font-size:12px; line-height:1.5; color:#a0aec0;">Recibes este correo porque estás registrado en Gaza.<br>Este enlace es válido por los próximos 15 minutos.</p>
                            <p style="margin:0; font-size:12px;">
                                <a href="${url_soporte}" style="color:#ffffff; text-decoration:underline;">Soporte</a> | 
                                <a href="${url_terminos}" style="color:#ffffff; text-decoration:underline;">Términos y Condiciones</a> | 
                                <a href="${url_privacidad}" style="color:#ffffff; text-decoration:underline;">Políticas de Privacidad</a>
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
`;
