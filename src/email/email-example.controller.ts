import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { BrevoService } from './brevo.service';
import type { SendEmailOptions } from './interfaces';

/**
 * Controlador de ejemplo para demostrar el uso del servicio de Brevo
 * NOTA: Este es un ejemplo educativo. En producción, el envío de emails
 * debería estar protegido con autenticación y autorización adecuada.
 */
@Controller('email')
export class EmailExampleController {
  constructor(private readonly brevoService: BrevoService) {}

  /**
   * Endpoint de ejemplo para enviar un email simple
   * POST /email/send-simple
   */
  @Post('send-simple')
  async sendSimpleEmail(
    @Body() body: { to: string; subject: string; message: string },
  ) {
    // Validación básica
    if (!body.to || !body.subject || !body.message) {
      throw new HttpException(
        'Faltan campos requeridos: to, subject, message',
        HttpStatus.BAD_REQUEST,
      );
    }

    const result = await this.brevoService.sendSimpleEmail(
      body.to,
      body.subject,
      `<p>${body.message}</p>`,
      body.message,
    );

    if (!result.success) {
      throw new HttpException(
        `Error al enviar email: ${result.error}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return {
      success: true,
      messageId: result.messageId,
      message: 'Email enviado exitosamente',
    };
  }

  /**
   * Endpoint de ejemplo para enviar un email con opciones completas
   * POST /email/send
   */
  @Post('send')
  async sendEmail(@Body() options: SendEmailOptions) {
    const result = await this.brevoService.sendEmail(options);

    if (!result.success) {
      throw new HttpException(
        `Error al enviar email: ${result.error}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return {
      success: true,
      messageId: result.messageId,
      message: 'Email enviado exitosamente',
    };
  }

  /**
   * Endpoint de ejemplo para enviar un email usando un template
   * POST /email/send-template
   */
  @Post('send-template')
  async sendTemplateEmail(
    @Body()
    body: {
      to: string;
      templateId: number;
      params?: Record<string, any>;
    },
  ) {
    if (!body.to || !body.templateId) {
      throw new HttpException(
        'Faltan campos requeridos: to, templateId',
        HttpStatus.BAD_REQUEST,
      );
    }

    const result = await this.brevoService.sendTemplateEmail({
      to: [{ email: body.to }],
      templateId: body.templateId,
      params: body.params || {},
    });

    if (!result.success) {
      throw new HttpException(
        `Error al enviar email: ${result.error}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return {
      success: true,
      messageId: result.messageId,
      message: 'Email enviado exitosamente',
    };
  }

  /**
   * Endpoint para verificar si el servicio está configurado
   * GET /email/status
   */
  @Post('status')
  getStatus() {
    return {
      configured: this.brevoService.isConfigured(),
      message: this.brevoService.isConfigured()
        ? 'Servicio de email configurado correctamente'
        : 'Servicio de email no configurado. Verifica BREVO_API_KEY',
    };
  }
}
