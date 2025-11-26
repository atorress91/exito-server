interface PasswordResetEmailParams {
  name: string;
  lastName: string;
  email: string;
  resetCode: string;
  frontendUrl: string;
}

export function getPasswordResetEmailTemplate(
  params: PasswordResetEmailParams,
): string {
  const { name, lastName, resetCode, frontendUrl } = params;

  return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Restablecer Contraseña - Éxito Juntos</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
    <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f4f4f4;">
        <tr>
            <td style="padding: 40px 20px; text-align: center;">
                <table role="presentation" style="width: 600px; max-width: 100%; margin: 0 auto; border-collapse: collapse; background-color: #000000; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    
                    <!-- Header -->
                    <tr>
                        <td style="padding: 40px 30px; text-align: center; border-bottom: 3px solid #d4af37;">
                            <h1 style="margin: 0 0 15px 0; color: #d4af37; font-size: 36px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase;">
                                Éxito Juntos
                            </h1>
                            <p style="margin: 0; color: #ffffff; font-size: 16px; font-weight: 400; letter-spacing: 1px;">
                                🔐 RESTABLECER CONTRASEÑA
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Body -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <p style="margin: 0 0 20px; color: #ffffff; font-size: 18px; line-height: 1.8;">
                                Hola <strong style="color: #d4af37;">${name} ${lastName}</strong>,
                            </p>
                            
                            <p style="margin: 0 0 30px; color: #ffffff; font-size: 16px; line-height: 1.8;">
                                Hemos recibido una solicitud para restablecer la contraseña de tu cuenta.
                            </p>
                            
                            <!-- Info Box -->
                            <p style="margin: 20px 0; padding: 15px; color: #ffffff; font-size: 15px; line-height: 1.6; border: 1px solid #d4af37; border-left: 4px solid #d4af37;">
                                <strong style="color: #d4af37;">📧 Email:</strong> ${params.email}
                            </p>
                            
                            <!-- Divider -->
                            <div style="height: 2px; background-color: #d4af37; margin: 30px 0;"></div>
                            
                            <!-- Code Section -->
                            <h2 style="margin: 30px 0 20px 0; color: #d4af37; font-size: 20px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; text-align: center;">
                                Tu código de seguridad
                            </h2>
                            
                            <p style="margin: 15px 0; color: #ffffff; font-size: 15px; line-height: 1.8; text-align: center;">
                                Utiliza el siguiente código para restablecer tu contraseña:
                            </p>
                            
                            <!-- Code Box -->
                            <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 30px 0;">
                                <tr>
                                    <td style="text-align: center; padding: 30px; background-color: #1a1a1a; border: 2px dashed #d4af37; border-radius: 8px;">
                                        <div style="font-size: 42px; font-weight: bold; color: #d4af37; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                                            ${resetCode}
                                        </div>
                                        <p style="margin: 15px 0 0 0; font-size: 13px; color: #999999;">
                                            Este código expira en 1 hora
                                        </p>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- CTA Button -->
                            <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 30px 0;">
                                <tr>
                                    <td style="text-align: center;">
                                        <a href="${frontendUrl}/reset-password?code=${resetCode}" style="display: inline-block; background-color: #d4af37; color: #000000; text-decoration: none; padding: 18px 60px; font-size: 16px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; border-radius: 5px;">
                                            RESTABLECER CONTRASEÑA
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Divider -->
                            <div style="height: 2px; background-color: #d4af37; margin: 30px 0;"></div>
                            
                            <!-- Warning Box -->
                            <div style="margin: 30px 0; padding: 20px; background-color: #1a1a1a; border: 1px solid #d4af37; border-left: 4px solid #d4af37; border-radius: 4px;">
                                <p style="margin: 0 0 15px 0; color: #d4af37; font-size: 16px; font-weight: 700;">
                                    ⚠️ Importante:
                                </p>
                                <p style="margin: 8px 0; color: #ffffff; font-size: 14px; line-height: 1.6;">
                                    • Si no solicitaste este cambio, ignora este correo.
                                </p>
                                <p style="margin: 8px 0; color: #ffffff; font-size: 14px; line-height: 1.6;">
                                    • Tu contraseña actual seguirá siendo válida.
                                </p>
                                <p style="margin: 8px 0; color: #ffffff; font-size: 14px; line-height: 1.6;">
                                    • Nunca compartas este código con nadie.
                                </p>
                                <p style="margin: 8px 0; color: #ffffff; font-size: 14px; line-height: 1.6;">
                                    • Este código expira en 1 hora.
                                </p>
                            </div>
                            
                            <p style="margin: 25px 0 10px; color: #ffffff; font-size: 14px; line-height: 1.8;">
                                Si tienes problemas con el botón, copia y pega el siguiente código:
                            </p>
                            <p style="margin: 10px 0 0; padding: 15px; background-color: #1a1a1a; border: 1px solid #333333; border-radius: 5px; color: #d4af37; font-family: 'Courier New', monospace; font-size: 16px; word-break: break-all; text-align: center;">
                                ${resetCode}
                            </p>
                            
                            <p style="margin: 30px 0 0; color: #ffffff; font-size: 15px; line-height: 1.8;">
                                Saludos cordiales,<br>
                                <strong style="color: #d4af37;">El equipo de Éxito Juntos</strong>
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 30px 30px; text-align: center; border-top: 3px solid #d4af37;">
                            <p style="margin: 0 0 10px; color: #999999; font-size: 13px; line-height: 1.6;">
                                Este es un correo automático, por favor no respondas a este mensaje.
                            </p>
                            <p style="margin: 0; color: #999999; font-size: 13px; line-height: 1.6;">
                                © ${new Date().getFullYear()} Éxito Juntos. Todos los derechos reservados.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
  `.trim();
}
