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
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #000000;">
    <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #000000;">
        <tr>
            <td style="padding: 40px 20px;" align="center">
                <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #000000;">
                    
                    <!-- Header -->
                    <tr>
                        <td style="padding: 40px 30px; text-align: center; border-bottom: 3px solid #d4af37;">
                            <h1 style="margin: 0 0 15px 0; color: #d4af37; font-size: 36px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase;">
                                Éxito Juntos
                            </h1>
                            <p style="margin: 0; color: #ffffff; font-size: 16px; font-weight: 400; letter-spacing: 1px;">
                                BIENVENIDO A NUESTRA PLATAFORMA
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Body -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <p style="margin: 0 0 20px; color: #ffffff; font-size: 18px; line-height: 1.8;">
                                Hola <strong style="color: #d4af37;">${params.name} ${params.lastName}</strong>,
                            </p>
                            
                            <p style="margin: 0 0 30px; color: #ffffff; font-size: 16px; line-height: 1.8;">
                                ¡Nos complace darte la bienvenida! Tu cuenta ha sido creada exitosamente y estamos emocionados de tenerte con nosotros.
                            </p>
                            
                            <!-- Divider -->
                            <div style="height: 2px; background-color: #d4af37; margin: 30px 0;"></div>
                            
                            <!-- Credentials Section -->
                            <h2 style="margin: 30px 0 25px 0; color: #d4af37; font-size: 22px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">
                                Tus credenciales de acceso
                            </h2>
                            
                            <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                                <tr>
                                    <td style="padding: 15px 0; border-bottom: 1px solid #333333;">
                                        <strong style="color: #ffffff; font-size: 14px; display: block; margin-bottom: 8px;">
                                            Correo electrónico:
                                        </strong>
                                        <span style="color: #d4af37; font-size: 16px; font-weight: 600;">
                                            ${params.email}
                                        </span>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 15px 0; border-bottom: 1px solid #333333;">
                                        <strong style="color: #ffffff; font-size: 14px; display: block; margin-bottom: 8px;">
                                            Teléfono:
                                        </strong>
                                        <span style="color: #d4af37; font-size: 16px; font-weight: 600;">
                                            ${params.phone}
                                        </span>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 15px 0; border-bottom: 1px solid #333333;">
                                        <strong style="color: #ffffff; font-size: 14px; display: block; margin-bottom: 8px;">
                                            Contraseña temporal:
                                        </strong>
                                        <span style="color: #d4af37; font-size: 16px; font-weight: 600; font-family: 'Courier New', monospace;">
                                            ${params.password}
                                        </span>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Important Notice -->
                            <p style="margin: 30px 0; padding: 20px; color: #ffffff; font-size: 14px; line-height: 1.6; border: 1px solid #d4af37; border-left: 4px solid #d4af37;">
                                <strong style="color: #d4af37;">⚠️ Importante:</strong> Por tu seguridad, te recomendamos cambiar tu contraseña después de tu primer inicio de sesión.
                            </p>
                            
                            <!-- Divider -->
                            <div style="height: 2px; background-color: #d4af37; margin: 30px 0;"></div>
                            
                            <!-- CTA Button -->
                            <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 30px 0;">
                                <tr>
                                    <td style="text-align: center;">
                                        <a href="#" style="display: inline-block; background-color: #d4af37; color: #000000; text-decoration: none; padding: 18px 60px; font-size: 16px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">
                                            INICIAR SESIÓN
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="margin: 30px 0 0; color: #ffffff; font-size: 15px; line-height: 1.8;">
                                Si tienes alguna pregunta o necesitas ayuda, no dudes en contactarnos. Estamos aquí para apoyarte en cada paso del camino.
                            </p>
                            
                            <p style="margin: 25px 0 0; color: #ffffff; font-size: 15px; line-height: 1.8;">
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
};
