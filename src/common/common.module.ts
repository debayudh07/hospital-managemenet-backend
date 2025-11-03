import { Global, Module } from '@nestjs/common';
import { ApiLoggerService } from './services/api-logger.service';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { AllExceptionsFilter } from './filters/all-exceptions.filter';
import { MetricsController } from './controllers/metrics.controller';

@Global()
@Module({
  controllers: [MetricsController],
  providers: [ApiLoggerService, LoggingInterceptor, AllExceptionsFilter],
  exports: [ApiLoggerService, LoggingInterceptor, AllExceptionsFilter],
})
export class CommonModule {}