import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Request, Response } from 'express';
import { ApiLoggerService } from '../services/api-logger.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('API');

  constructor(private readonly apiLoggerService: ApiLoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const { method, url, body, query, params } = request;
    const userAgent = request.get('User-Agent') || '';
    const ip = request.ip || request.connection.remoteAddress;
    
    const startTime = Date.now();
    const requestId = this.generateRequestId();

    // Log incoming request
    this.logger.log(
      `[${requestId}] ${method} ${url} - ${ip} - ${userAgent}`,
    );

    // Log request details for non-GET requests
    if (method !== 'GET') {
      const bodyToLog = this.sanitizeRequestBody(body);
      this.logger.debug(
        `[${requestId}] Request Details - Body: ${JSON.stringify(bodyToLog)}, Query: ${JSON.stringify(query)}, Params: ${JSON.stringify(params)}`,
      );
    }

    return next.handle().pipe(
      tap((responseData) => {
        const duration = Date.now() - startTime;
        const statusCode = response.statusCode;
        
        // Log to metrics service
        this.apiLoggerService.logRequest(method, url, statusCode, duration);
        
        this.logger.log(
          `[${requestId}] ${method} ${url} - ${statusCode} - ${duration}ms`,
        );

        // Log response data for debugging (only in development)
        if (process.env.NODE_ENV === 'development') {
          const responseToLog = this.sanitizeResponseData(responseData);
          this.logger.debug(
            `[${requestId}] Response: ${JSON.stringify(responseToLog).substring(0, 500)}${JSON.stringify(responseToLog).length > 500 ? '...' : ''}`,
          );
        }
      }),
      catchError((error) => {
        const duration = Date.now() - startTime;
        const statusCode = error.status || 500;
        
        // Log to metrics service
        this.apiLoggerService.logRequest(method, url, statusCode, duration);
        
        this.logger.error(
          `[${requestId}] ${method} ${url} - ${statusCode} - ${duration}ms - ERROR: ${error.message}`,
        );
        
        throw error;
      }),
    );
  }

  private generateRequestId(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  private sanitizeRequestBody(body: any): any {
    if (!body || typeof body !== 'object') {
      return body;
    }

    const sanitized = { ...body };
    
    // Remove sensitive fields
    const sensitiveFields = ['password', 'token', 'secret', 'key', 'authorization'];
    
    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    }

    return sanitized;
  }

  private sanitizeResponseData(data: any): any {
    if (!data || typeof data !== 'object') {
      return data;
    }

    // If it's an array, limit to first few items
    if (Array.isArray(data)) {
      return data.length > 3 ? [...data.slice(0, 3), `... and ${data.length - 3} more items`] : data;
    }

    const sanitized = { ...data };
    
    // Remove sensitive fields from response
    const sensitiveFields = ['password', 'token', 'secret', 'key'];
    
    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    }

    return sanitized;
  }
}