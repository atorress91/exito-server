import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { CustomLoggerService } from './logs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  // Configurar el logger personalizado
  const customLogger = app.get(CustomLoggerService);
  app.useLogger(customLogger);

  // Configurar CORS
  app.enableCors({
    origin: [
      'http://localhost:4200',
      'http://localhost:3000',
      'https://www.exitojuntos.com',
      'https://exitojuntos.com',
      'http://server.exitojuntos.com',
      'https://server.exitojuntos.com',
      'http://167.71.171.55:3000',
      'http://167.71.171.55',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'Cache-Control',
      'Pragma',
      'Expires',
      'X-Requested-With',
    ],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
  });

  // Habilitar validación global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Aplicar interceptor global de respuestas
  app.useGlobalInterceptors(new ResponseInterceptor());

  // Aplicar filtro global de excepciones
  app.useGlobalFilters(new HttpExceptionFilter());

  // Habilitar versionado de rutas
  app.enableVersioning({
    type: VersioningType.URI,
  });

  // Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('Exitojuntos API')
    .setDescription('API para la aplicación Exitojuntos')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Autenticación')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
  console.log(`Swagger documentation: ${await app.getUrl()}/docs`);
}

void bootstrap();
