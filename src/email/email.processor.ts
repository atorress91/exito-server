import {
  Processor,
  Process,
  OnQueueActive,
  OnQueueCompleted,
  OnQueueFailed,
} from '@nestjs/bull';
import type { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { BrevoService } from './brevo.service';
import type {
  SendEmailOptions,
  SendTemplateEmailOptions,
  EmailResponse,
} from './interfaces';

export interface EmailJob {
  type: 'simple' | 'template';
  data: SendEmailOptions | SendTemplateEmailOptions;
}

@Processor('email')
export class EmailProcessor {
  private readonly logger = new Logger(EmailProcessor.name);

  constructor(private readonly brevoService: BrevoService) {}

  @Process('send-email')
  async handleSendEmail(job: Job<EmailJob>): Promise<EmailResponse> {
    this.logger.log(
      `Procesando email job ${job.id} - Intento ${job.attemptsMade + 1}`,
    );

    try {
      let result: EmailResponse;

      if (job.data.type === 'template') {
        result = await this.brevoService.sendTemplateEmail(
          job.data.data as SendTemplateEmailOptions,
        );
      } else {
        result = await this.brevoService.sendEmail(
          job.data.data as SendEmailOptions,
        );
      }

      if (!result.success) {
        throw new Error(result.error || 'Error al enviar email');
      }

      this.logger.log(`Email enviado exitosamente - Job ${job.id}`);
      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error desconocido';
      this.logger.error(
        `Error procesando email job ${job.id}: ${errorMessage}`,
      );
      throw error; // Bull reintentará automáticamente
    }
  }

  @OnQueueActive()
  onActive(job: Job<EmailJob>) {
    this.logger.debug(`Procesando job ${job.id} de tipo ${job.data.type}`);
  }

  @OnQueueCompleted()
  onCompleted(job: Job<EmailJob>, result: EmailResponse) {
    this.logger.log(
      `Job ${job.id} completado exitosamente. MessageId: ${result.messageId}`,
    );
  }

  @OnQueueFailed()
  onFailed(job: Job<EmailJob>, error: Error) {
    this.logger.error(
      `Job ${job.id} falló después de ${job.attemptsMade} intentos: ${error.message}`,
    );
  }
}
