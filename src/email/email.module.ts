import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import { BrevoService } from './brevo.service';
import { EmailService } from './email.service';
import { EmailProcessor } from './email.processor';
import { EmailQueueController } from './email-queue.controller';

@Module({
  imports: [
    ConfigModule,
    BullModule.registerQueue({
      name: 'email',
    }),
  ],
  controllers: [EmailQueueController],
  providers: [BrevoService, EmailService, EmailProcessor],
  exports: [EmailService, BrevoService], // Exportamos ambos por compatibilidad
})
export class EmailModule {}
