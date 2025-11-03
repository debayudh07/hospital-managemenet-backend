# API Logging and Monitoring System

This document describes the comprehensive API logging and monitoring system implemented in the Hospital Management Backend.

## Features

### 1. Request/Response Logging
- **Automatic logging** of all incoming HTTP requests
- **Response time tracking** for performance monitoring
- **Request details** including method, URL, IP address, User-Agent
- **Response status codes** and error tracking
- **Sanitized logging** of request/response bodies (sensitive data redacted)

### 2. Error Tracking
- **Global exception handling** with detailed error logging
- **Different log levels** based on HTTP status codes:
  - 500+ errors: `ERROR` level with stack traces
  - 400-499 errors: `WARN` level
  - Other responses: `INFO` level
- **Request context** logged with failed requests for debugging

### 3. Performance Metrics
- **Request counting** (total, successful, failed)
- **Average response time** calculation
- **Endpoint-specific statistics** with success rates
- **Automatic metrics logging** every 100 requests
- **Problematic endpoint detection** (high failure rates)

### 4. Metrics API Endpoints

#### GET /api/metrics
Returns comprehensive API usage statistics:
```json
{
  "totalRequests": 1250,
  "successfulRequests": 1180,
  "failedRequests": 70,
  "successRate": "94.40",
  "averageResponseTime": "125.50",
  "topEndpoints": [
    {
      "endpoint": "GET /api/patients",
      "calls": 245,
      "successRate": "98.78",
      "averageResponseTime": "89.32"
    }
  ],
  "problematicEndpoints": [
    {
      "endpoint": "POST /api/appointments",
      "calls": 45,
      "failures": 8,
      "failureRate": "17.78"
    }
  ]
}
```

#### POST /api/metrics/reset
Resets all collected metrics and statistics.

#### POST /api/metrics/log-summary
Manually triggers logging of metrics summary to console.

## Log Output Examples

### Successful Request
```
[API] [abc123def456] GET /api/patients - 127.0.0.1 - Mozilla/5.0...
[API] [abc123def456] GET /api/patients - 200 - 89ms
```

### Failed Request
```
[API] [xyz789ghi012] POST /api/appointments - 127.0.0.1 - Mozilla/5.0...
[API] [xyz789ghi012] POST /api/appointments - 400 - 45ms - ERROR: Validation failed
[Exception] POST /api/appointments - 400 - Validation failed
```

### Metrics Summary (every 100 requests)
```
[ApiMetrics] === API METRICS SUMMARY ===
[ApiMetrics] Total Requests: 1200
[ApiMetrics] Successful Requests: 1134
[ApiMetrics] Failed Requests: 66
[ApiMetrics] Success Rate: 94.50%
[ApiMetrics] Average Response Time: 123.45ms

[ApiMetrics] === TOP 10 ENDPOINTS ===
[ApiMetrics] GET /api/patients: 245 calls, 98.78% success, 89.32ms avg
[ApiMetrics] GET /api/doctors: 189 calls, 99.47% success, 95.12ms avg
[ApiMetrics] POST /api/auth/login: 156 calls, 92.31% success, 234.56ms avg

[ApiMetrics] === ENDPOINTS WITH HIGH FAILURE RATES ===
[ApiMetrics] POST /api/appointments: 17.78% failure rate (8/45)
[ApiMetrics] PUT /api/patients/123: 15.38% failure rate (2/13)
```

## Configuration

### Environment Variables
- `NODE_ENV`: When set to `development`, enables detailed response logging
- `PORT`: Application port (defaults to 5000)

### Sensitive Data Redaction
The following fields are automatically redacted in logs:
- `password`
- `token`
- `secret`
- `key`
- `authorization`

## Implementation Details

### Files Structure
```
src/common/
├── controllers/
│   └── metrics.controller.ts     # Metrics API endpoints
├── filters/
│   └── all-exceptions.filter.ts  # Global exception handling
├── interceptors/
│   └── logging.interceptor.ts    # Request/response logging
├── services/
│   └── api-logger.service.ts     # Metrics collection service
└── common.module.ts              # Module configuration
```

### Key Components

1. **LoggingInterceptor**: Intercepts all requests/responses for logging
2. **AllExceptionsFilter**: Catches and logs all unhandled exceptions
3. **ApiLoggerService**: Collects and manages performance metrics
4. **MetricsController**: Exposes metrics via REST API

## Usage Tips

1. **Monitor the metrics endpoint** regularly to identify performance issues
2. **Check logs** for high failure rate endpoints and investigate root causes
3. **Use request IDs** in logs to trace specific request flows
4. **Reset metrics** periodically to focus on recent performance data
5. **Set up alerts** based on failure rates or response times

## Security Notes

- Sensitive fields are automatically redacted from logs
- No authentication required for metrics endpoint (consider adding in production)
- Log files may contain IP addresses and user agents for debugging
- Consider log rotation and retention policies for production deployment

## Future Enhancements

- Integration with monitoring tools (Prometheus, Grafana)
- Alerting system for high failure rates
- Database persistence for metrics
- User-specific request tracking
- Rate limiting integration