import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ApiLoggerService } from '../services/api-logger.service';

@ApiTags('Monitoring')
@Controller('api/metrics')
export class MetricsController {
  constructor(private readonly apiLoggerService: ApiLoggerService) {}

  @Get()
  @ApiOperation({ summary: 'Get API metrics and statistics' })
  @ApiResponse({
    status: 200,
    description: 'Returns API usage metrics and statistics',
    schema: {
      type: 'object',
      properties: {
        totalRequests: { type: 'number' },
        successfulRequests: { type: 'number' },
        failedRequests: { type: 'number' },
        successRate: { type: 'number' },
        averageResponseTime: { type: 'number' },
        topEndpoints: { type: 'array' },
        problematicEndpoints: { type: 'array' },
      },
    },
  })
  getMetrics() {
    const metrics = this.apiLoggerService.getMetrics();
    const successRate = metrics.totalRequests > 0 
      ? (metrics.successfulRequests / metrics.totalRequests) * 100 
      : 0;

    // Get top 10 endpoints
    const topEndpoints = Array.from(metrics.endpointStats.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 10)
      .map(([endpoint, stats]) => ({
        endpoint,
        calls: stats.count,
        successRate: ((stats.successCount / stats.count) * 100).toFixed(2),
        averageResponseTime: (stats.totalResponseTime / stats.count).toFixed(2),
      }));

    // Get problematic endpoints (failure rate > 10%)
    const problematicEndpoints = Array.from(metrics.endpointStats.entries())
      .filter(([, stats]) => stats.failureCount > 0 && (stats.failureCount / stats.count) > 0.1)
      .sort((a, b) => (b[1].failureCount / b[1].count) - (a[1].failureCount / a[1].count))
      .map(([endpoint, stats]) => ({
        endpoint,
        calls: stats.count,
        failures: stats.failureCount,
        failureRate: ((stats.failureCount / stats.count) * 100).toFixed(2),
      }));

    return {
      totalRequests: metrics.totalRequests,
      successfulRequests: metrics.successfulRequests,
      failedRequests: metrics.failedRequests,
      successRate: successRate.toFixed(2),
      averageResponseTime: metrics.averageResponseTime.toFixed(2),
      topEndpoints,
      problematicEndpoints,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('reset')
  @ApiOperation({ summary: 'Reset API metrics' })
  @ApiResponse({
    status: 200,
    description: 'Metrics have been reset successfully',
  })
  resetMetrics() {
    this.apiLoggerService.resetMetrics();
    return {
      message: 'API metrics have been reset successfully',
      timestamp: new Date().toISOString(),
    };
  }

  @Post('log-summary')
  @ApiOperation({ summary: 'Trigger manual logging of metrics summary' })
  @ApiResponse({
    status: 200,
    description: 'Metrics summary has been logged',
  })
  logMetricsSummary() {
    this.apiLoggerService.logMetrics();
    return {
      message: 'Metrics summary has been logged to console',
      timestamp: new Date().toISOString(),
    };
  }
}