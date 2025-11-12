export interface WelcomeEmailParams {
  name: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
}

export const getWelcomeEmailTemplate = (params: WelcomeEmailParams): string => {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bienvenido a Éxito Juntos</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0a0a0a;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #1a1a1a; border-radius: 12px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #1a1a1a 0%, #000000 100%); padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0; border-bottom: 2px solid #d4af37;">
                            <h1 style="margin: 0; color: #d4af37; font-size: 32px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;">
                                ¡Bienvenido a Éxito Juntos! 🎉
                            </h1>
                            <p style="margin: 10px 0 0; color: #d4af37; font-size: 14px; letter-spacing: 0.5px;">
                                UNIDOS EN EL CAMINO AL ÉXITO
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Body -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <p style="margin: 0 0 20px; color: #ffffff; font-size: 18px; line-height: 1.6;">
                                Hola <strong style="color: #d4af37;">${params.name} ${params.lastName}</strong>,
                            </p>
                            
                            <p style="margin: 0 0 25px; color: #cccccc; font-size: 16px; line-height: 1.6;">
                                ¡Nos complace darte la bienvenida a nuestra plataforma! Tu cuenta ha sido creada exitosamente y estamos emocionados de tenerte con nosotros.
                            </p>
                            
                            <!-- Credentials Box -->
                            <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 30px 0;">
                                <tr>
                                    <td style="background-color: #0a0a0a; border-left: 4px solid #d4af37; padding: 25px; border-radius: 8px; border: 1px solid #333333;">
                                        <h2 style="margin: 0 0 20px; color: #d4af37; font-size: 20px; font-weight: 600;">
                                            📧 Tus credenciales de acceso:
                                        </h2>
                                        
                                        <table role="presentation" style="width: 100%; border-collapse: collapse;">
                                            <tr>
                                                <td style="padding: 10px 0;">
                                                    <span style="color: #cccccc; font-size: 14px; font-weight: 600; display: block; margin-bottom: 5px;">
                                                        Correo electrónico:
                                                    </span>
                                                    <span style="color: #d4af37; font-size: 16px; font-weight: 500; background-color: #1a1a1a; padding: 8px 12px; border-radius: 4px; display: inline-block; border: 1px solid #333333;">
                                                        ${params.email}
                                                    </span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 10px 0;">
                                                    <span style="color: #cccccc; font-size: 14px; font-weight: 600; display: block; margin-bottom: 5px;">
                                                        Teléfono:
                                                    </span>
                                                    <span style="color: #d4af37; font-size: 16px; font-weight: 500; background-color: #1a1a1a; padding: 8px 12px; border-radius: 4px; display: inline-block; border: 1px solid #333333;">
                                                        ${params.phone}
                                                    </span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 10px 0;">
                                                    <span style="color: #cccccc; font-size: 14px; font-weight: 600; display: block; margin-bottom: 5px;">
                                                        Contraseña temporal:
                                                    </span>
                                                    <span style="color: #d4af37; font-size: 16px; font-weight: 500; background-color: #1a1a1a; padding: 8px 12px; border-radius: 4px; display: inline-block; font-family: 'Courier New', monospace; border: 1px solid #333333;">
                                                        ${params.password}
                                                    </span>
                                                </td>
                                            </tr>
                                        </table>
                                        
                                        <div style="margin-top: 20px; padding: 15px; background-color: #2a2200; border-left: 3px solid #d4af37; border-radius: 4px;">
                                            <p style="margin: 0; color: #d4af37; font-size: 14px; line-height: 1.5;">
                                                ⚠️ <strong>Importante:</strong> Por tu seguridad, te recomendamos cambiar tu contraseña después de tu primer inicio de sesión.
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- CTA Button -->
                            <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 30px 0;">
                                <tr>
                                    <td align="center">
                                        <a href="#" style="display: inline-block; background: linear-gradient(135deg, #d4af37 0%, #b8941f 100%); color: #000000; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 700; box-shadow: 0 4px 15px rgba(212, 175, 55, 0.4); transition: all 0.3s ease; text-transform: uppercase; letter-spacing: 0.5px;">
                                            Iniciar Sesión Ahora
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="margin: 25px 0 0; color: #cccccc; font-size: 15px; line-height: 1.6;">
                                Si tienes alguna pregunta o necesitas ayuda, no dudes en contactarnos. Estamos aquí para apoyarte en cada paso del camino.
                            </p>
                            
                            <p style="margin: 25px 0 0; color: #cccccc; font-size: 15px; line-height: 1.6;">
                                Saludos cordiales,<br>
                                <strong style="color: #d4af37;">El equipo de Éxito Juntos</strong>
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #0a0a0a; padding: 30px; text-align: center; border-radius: 0 0 12px 12px; border-top: 2px solid #d4af37;">
                            <p style="margin: 0 0 10px; color: #999999; font-size: 13px; line-height: 1.5;">
                                Este es un correo automático, por favor no respondas a este mensaje.
                            </p>
                            <p style="margin: 0; color: #999999; font-size: 13px; line-height: 1.5;">
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
};
