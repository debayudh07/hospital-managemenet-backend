import { Injectable, Logger } from '@nestjs/common';

interface ApiMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  endpointStats: Map<string, {
    count: number;
    successCount: number;
    failureCount: number;
    totalResponseTime: number;
  }>;
}

@Injectable()
export class ApiLoggerService {
  private readonly logger = new Logger('ApiMetrics');
  private metrics: ApiMetrics = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    averageResponseTime: 0,
    endpointStats: new Map(),
  };

  logRequest(method: string, url: string, statusCode: number, responseTime: number) {
    const endpoint = `${method} ${url}`;
    
    // Update overall metrics
    this.metrics.totalRequests++;
    if (statusCode < 400) {
      this.metrics.successfulRequests++;
    } else {
      this.metrics.failedRequests++;
    }

    // Update average response time
    this.metrics.averageResponseTime = 
      (this.metrics.averageResponseTime * (this.metrics.totalRequests - 1) + responseTime) / 
      this.metrics.totalRequests;

    // Update endpoint-specific stats
    const endpointStats = this.metrics.endpointStats.get(endpoint) || {
      count: 0,
      successCount: 0,
      failureCount: 0,
      totalResponseTime: 0,
    };

    endpointStats.count++;
    endpointStats.totalResponseTime += responseTime;
    
    if (statusCode < 400) {
      endpointStats.successCount++;
    } else {
      endpointStats.failureCount++;
    }

    this.metrics.endpointStats.set(endpoint, endpointStats);

    // Log metrics every 100 requests
    if (this.metrics.totalRequests % 100 === 0) {
      this.logMetrics();
    }
  }

  logMetrics() {
    this.logger.log('=== API METRICS SUMMARY ===');
    this.logger.log(`Total Requests: ${this.metrics.totalRequests}`);
    this.logger.log(`Successful Requests: ${this.metrics.successfulRequests}`);
    this.logger.log(`Failed Requests: ${this.metrics.failedRequests}`);
    this.logger.log(`Success Rate: ${((this.metrics.successfulRequests / this.metrics.totalRequests) * 100).toFixed(2)}%`);
    this.logger.log(`Average Response Time: ${this.metrics.averageResponseTime.toFixed(2)}ms`);

    // Log top 10 most called endpoints
    const sortedEndpoints = Array.from(this.metrics.endpointStats.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 10);

    this.logger.log('=== TOP 10 ENDPOINTS ===');
    sortedEndpoints.forEach(([endpoint, stats]) => {
      const successRate = ((stats.successCount / stats.count) * 100).toFixed(2);
      const avgResponseTime = (stats.totalResponseTime / stats.count).toFixed(2);
      this.logger.log(`${endpoint}: ${stats.count} calls, ${successRate}% success, ${avgResponseTime}ms avg`);
    });

    // Log endpoints with high failure rates
    const problematicEndpoints = Array.from(this.metrics.endpointStats.entries())
      .filter(([, stats]) => stats.failureCount > 0 && (stats.failureCount / stats.count) > 0.1)
      .sort((a, b) => (b[1].failureCount / b[1].count) - (a[1].failureCount / a[1].count));

    if (problematicEndpoints.length > 0) {
      this.logger.warn('=== ENDPOINTS WITH HIGH FAILURE RATES ===');
      problematicEndpoints.forEach(([endpoint, stats]) => {
        const failureRate = ((stats.failureCount / stats.count) * 100).toFixed(2);
        this.logger.warn(`${endpoint}: ${failureRate}% failure rate (${stats.failureCount}/${stats.count})`);
      });
    }
  }

  getMetrics(): ApiMetrics {
    return { ...this.metrics, endpointStats: new Map(this.metrics.endpointStats) };
  }

  resetMetrics() {
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      endpointStats: new Map(),
    };
    this.logger.log('API Metrics have been reset');
  }
}