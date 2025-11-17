import { Controller, Get, Post, Param } from '@nestjs/common';
import type { Job } from 'bull';
import { EmailService } from './email.service';
import type { EmailJob } from './email.processor';

@Controller('email-queue')
export class EmailQueueController {
  constructor(private readonly emailService: EmailService) {}

  /**
   * Obtiene las estadísticas de la cola de emails
   * GET /email-queue/stats
   */
  @Get('stats')
  async getQueueStats() {
    return this.emailService.getQueueStats();
  }

  /**
   * Obtiene los jobs fallidos
   * GET /email-queue/failed
   */
  @Get('failed')
  async getFailedJobs() {
    const jobs = await this.emailService.getFailedJobs();
    return jobs.map((job: Job<EmailJob>) => ({
      id: job.id,
      data: job.data,
      failedReason: job.failedReason,
      attemptsMade: job.attemptsMade,
      timestamp: job.timestamp,
    }));
  }

  /**
   * Reintenta un job fallido
   * POST /email-queue/retry/:jobId
   */
  @Post('retry/:jobId')
  async retryFailedJob(@Param('jobId') jobId: string) {
    await this.emailService.retryFailedJob(jobId);
    return {
      message: `Job ${jobId} reencolado para reintento`,
    };
  }

  /**
   * Limpia jobs antiguos
   * POST /email-queue/clean
   */
  @Post('clean')
  async cleanOldJobs() {
    await this.emailService.cleanOldJobs();
    return {
      message: 'Jobs antiguos limpiados exitosamente',
    };
  }
}
