import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global logging interceptor and exception filter
  const loggingInterceptor = app.get(LoggingInterceptor);
  const exceptionsFilter = app.get(AllExceptionsFilter);
  
  app.useGlobalInterceptors(loggingInterceptor);
  app.useGlobalFilters(exceptionsFilter);

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Hospital Management API')
    .setDescription('The Hospital Management System API documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const logger = new Logger('Bootstrap');
  const port = process.env.PORT ?? 5000;
  
  await app.listen(port);
  
  logger.log(`🚀 Application is running on: ${await app.getUrl()}`);
  logger.log(`📚 Swagger documentation available at: ${await app.getUrl()}/api`);
  logger.log(`📊 API logging and metrics are enabled`);
  logger.log(`🔍 Monitor logs for API calls and performance metrics`);
}
bootstrap();
