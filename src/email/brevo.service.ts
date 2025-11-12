import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TransactionalEmailsApi, SendSmtpEmail } from '@getbrevo/brevo';
import {
  SendEmailOptions,
  SendTemplateEmailOptions,
  EmailResponse,
  EmailRecipient,
} from './interfaces';

@Injectable()
export class BrevoService {
  private readonly logger = new Logger(BrevoService.name);
  private readonly apiInstance: TransactionalEmailsApi;
  private readonly apiKey: string | undefined;
  private readonly senderEmail: string;
  private readonly senderName: string;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('BREVO_API_KEY');
    this.senderEmail = this.configService.get<string>(
      'BREVO_SENDER_EMAIL',
      'noreply@example.com',
    );
    this.senderName = this.configService.get<string>(
      'BREVO_SENDER_NAME',
      'ExitoJuntos',
    );

    if (!this.apiKey) {
      this.logger.warn(
        'BREVO_API_KEY no está configurada. El servicio de email no funcionará correctamente.',
      );
    }

    // Configurar la autenticación
    this.apiInstance = new TransactionalEmailsApi(this.apiKey || '');
  }

  /**
   * Envía un email transaccional con contenido HTML/texto
   */
  async sendEmail(options: SendEmailOptions): Promise<EmailResponse> {
    try {
      const sendSmtpEmail: SendSmtpEmail = {
        sender: {
          email: this.senderEmail,
          name: this.senderName,
        },
        to: options.to.map((recipient) => ({
          email: recipient.email,
          name: recipient.name,
        })),
        subject: options.subject,
        htmlContent: options.htmlContent,
        textContent: options.textContent,
      };

      // Configurar CC si existe
      if (options.cc && options.cc.length > 0) {
        sendSmtpEmail.cc = options.cc.map((recipient) => ({
          email: recipient.email,
          name: recipient.name,
        }));
      }

      // Configurar BCC si existe
      if (options.bcc && options.bcc.length > 0) {
        sendSmtpEmail.bcc = options.bcc.map((recipient) => ({
          email: recipient.email,
          name: recipient.name,
        }));
      }

      // Configurar Reply-To si existe
      if (options.replyTo) {
        sendSmtpEmail.replyTo = {
          email: options.replyTo.email,
          name: options.replyTo.name,
        };
      }

      // Configurar headers personalizados si existen
      if (options.headers) {
        sendSmtpEmail.headers = options.headers;
      }

      // Configurar parámetros de template si existen
      if (options.params) {
        sendSmtpEmail.params = options.params;
      }

      // Configurar adjuntos si existen
      if (options.attachments && options.attachments.length > 0) {
        sendSmtpEmail.attachment = options.attachments.map((att) => ({
          content: att.content,
          name: att.name,
        }));
      }

      // Enviar el email
      const response = await this.apiInstance.sendTransacEmail(sendSmtpEmail);

      this.logger.log(
        `Email enviado exitosamente a ${options.to.map((r) => r.email).join(', ')}`,
      );

      return {
        messageId: response.body.messageId || 'unknown',
        success: true,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error desconocido';
      const errorStack = error instanceof Error ? error.stack : undefined;

      this.logger.error(`Error al enviar email: ${errorMessage}`, errorStack);
      return {
        messageId: '',
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Envía un email usando un template de Brevo
   */
  async sendTemplateEmail(
    options: SendTemplateEmailOptions,
  ): Promise<EmailResponse> {
    try {
      const sendSmtpEmail: SendSmtpEmail = {
        sender: {
          email: this.senderEmail,
          name: this.senderName,
        },
        to: options.to.map((recipient) => ({
          email: recipient.email,
          name: recipient.name,
        })),
        templateId: options.templateId,
        params: options.params,
      };

      // Configurar CC si existe
      if (options.cc && options.cc.length > 0) {
        sendSmtpEmail.cc = options.cc.map((recipient) => ({
          email: recipient.email,
          name: recipient.name,
        }));
      }

      // Configurar BCC si existe
      if (options.bcc && options.bcc.length > 0) {
        sendSmtpEmail.bcc = options.bcc.map((recipient) => ({
          email: recipient.email,
          name: recipient.name,
        }));
      }

      // Configurar Reply-To si existe
      if (options.replyTo) {
        sendSmtpEmail.replyTo = {
          email: options.replyTo.email,
          name: options.replyTo.name,
        };
      }

      // Configurar adjuntos si existen
      if (options.attachments && options.attachments.length > 0) {
        sendSmtpEmail.attachment = options.attachments.map((att) => ({
          content: att.content,
          name: att.name,
        }));
      }

      // Configurar headers personalizados si existen
      if (options.headers) {
        sendSmtpEmail.headers = options.headers;
      }

      // Enviar el email
      const response = await this.apiInstance.sendTransacEmail(sendSmtpEmail);

      this.logger.log(
        `Email de template ${options.templateId} enviado exitosamente a ${options.to.map((r) => r.email).join(', ')}`,
      );

      return {
        messageId: response.body.messageId || 'unknown',
        success: true,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error desconocido';
      const errorStack = error instanceof Error ? error.stack : undefined;

      this.logger.error(
        `Error al enviar email de template: ${errorMessage}`,
        errorStack,
      );
      return {
        messageId: '',
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Método auxiliar para enviar un email simple
   */
  async sendSimpleEmail(
    to: string | EmailRecipient,
    subject: string,
    htmlContent: string,
    textContent?: string,
  ): Promise<EmailResponse> {
    const recipient: EmailRecipient =
      typeof to === 'string' ? { email: to } : to;

    return this.sendEmail({
      to: [recipient],
      subject,
      htmlContent,
      textContent,
    });
  }

  /**
   * Método para verificar si el servicio está configurado correctamente
   */
  isConfigured(): boolean {
    return !!this.apiKey;
  }
}
