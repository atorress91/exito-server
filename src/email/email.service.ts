import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import {
  SendEmailOptions,
  SendTemplateEmailOptions,
  EmailRecipient,
} from './interfaces';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(@InjectQueue('email') private emailQueue: Queue) {}

  /**
   * Encola un email transaccional para ser enviado
   */
  async queueEmail(options: SendEmailOptions): Promise<void> {
    try {
      const job = await this.emailQueue.add(
        'send-email',
        {
          type: 'simple',
          data: options,
        },
        {
          attempts: 5, // Reintenta hasta 5 veces
          backoff: {
            type: 'exponential',
            delay: 2000, // Empieza con 2 segundos y aumenta exponencialmente
          },
          removeOnComplete: true, // Limpia jobs completados
          removeOnFail: false, // Mantiene jobs fallidos para análisis
          timeout: 30000, // Timeout de 30 segundos
        },
      );

      this.logger.log(
        `Email encolado (Job ID: ${job.id}) para ${options.to.map((r) => r.email).join(', ')}`,
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error desconocido';
      this.logger.error(`Error al encolar email: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Encola un email basado en template para ser enviado
   */
  async queueTemplateEmail(options: SendTemplateEmailOptions): Promise<void> {
    try {
      const job = await this.emailQueue.add(
        'send-email',
        {
          type: 'template',
          data: options,
        },
        {
          attempts: 5,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
          removeOnComplete: true,
          removeOnFail: false,
          timeout: 30000,
        },
      );

      this.logger.log(
        `Email de template ${options.templateId} encolado (Job ID: ${job.id}) para ${options.to.map((r) => r.email).join(', ')}`,
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error desconocido';
      this.logger.error(`Error al encolar email de template: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Método auxiliar para enviar un email simple
   */
  async queueSimpleEmail(
    to: string | EmailRecipient,
    subject: string,
    htmlContent: string,
    textContent?: string,
  ): Promise<void> {
    const recipient: EmailRecipient =
      typeof to === 'string' ? { email: to } : to;

    return this.queueEmail({
      to: [recipient],
      subject,
      htmlContent,
      textContent,
    });
  }

  /**
   * Obtiene estadísticas de la cola de emails
   */
  async getQueueStats() {
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      this.emailQueue.getWaitingCount(),
      this.emailQueue.getActiveCount(),
      this.emailQueue.getCompletedCount(),
      this.emailQueue.getFailedCount(),
      this.emailQueue.getDelayedCount(),
    ]);

    return {
      waiting,
      active,
      completed,
      failed,
      delayed,
      total: waiting + active + completed + failed + delayed,
    };
  }

  /**
   * Obtiene los jobs fallidos
   */
  async getFailedJobs() {
    return this.emailQueue.getFailed();
  }

  /**
   * Reintenta un job fallido
   */
  async retryFailedJob(jobId: string) {
    const job = await this.emailQueue.getJob(jobId);
    if (job) {
      await job.retry();
      this.logger.log(`Job ${jobId} reencolado para reintento`);
    }
  }

  /**
   * Limpia jobs completados y fallidos antiguos
   */
  async cleanOldJobs(gracePeriod: number = 24 * 60 * 60 * 1000) {
    // Por defecto, limpia jobs de más de 24 horas
    await this.emailQueue.clean(gracePeriod, 'completed');
    await this.emailQueue.clean(gracePeriod * 7, 'failed'); // Mantiene fallidos por 7 días
    this.logger.log('Jobs antiguos limpiados');
  }
}
