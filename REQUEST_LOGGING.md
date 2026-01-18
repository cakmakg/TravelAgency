# Request/Error Logging & Monitoring Guide

## Overview

Complete request logging, error tracking, and performance monitoring system for TravelAgency API with:
- All API requests logged with timestamps, methods, paths, IPs
- Error tracking with stack traces and context
- Performance metrics (response times, memory usage, CPU)
- Admin operation audit trail
- Security event logging
- System health monitoring

**Purpose:** Debug issues, track performance, audit admin actions, detect anomalies.

---

## Architecture

### Logging Layers

```
Request Flow:
┌─────────────────────┐
│  Client Request     │
└──────────────┬──────┘
               ▼
┌─────────────────────────────────┐
│  1. Middleware Request Logger   │ ← Logs: method, path, IP, user-agent
├─────────────────────────────────┤
│  2. Route Handler               │
│     - Auth checks               │
│     - Input validation          │
│     - Business logic            │
├─────────────────────────────────┤
│  3. Performance Monitoring      │ ← Logs: duration, memory, CPU
├─────────────────────────────────┤
│  4. Error Handler               │ ← Logs: errors, stack traces, context
├─────────────────────────────────┤
│  5. Response Logger             │ ← Logs: status code, response time
└─────────────────────────────────┘
```

### Components

| Component | Purpose | Location |
|-----------|---------|----------|
| **Logger** | Core logging utility | `lib/logger.ts` |
| **ErrorHandler** | Centralized error handling | `lib/errorHandler.ts` |
| **PerformanceMonitor** | Performance tracking | `lib/performanceMonitor.ts` |
| **Middleware** | Request/response logging | `middleware.ts` |
| **Admin Logs API** | View/manage logs | `/api/admin/logs` |
| **Admin Metrics API** | Performance data | `/api/admin/metrics` |

---

## Logger Utility (lib/logger.ts)

### Features

- **Multi-level logging:** debug, info, warn, error, fatal
- **Output targets:** Console (dev) + Files (prod)
- **Structured logging:** JSON format for parsing
- **Log rotation:** Automatic file rotation when size exceeded
- **Auto-cleanup:** Old logs deleted after retention period
- **Colored output:** Color-coded console logs for readability
- **Performance tracking:** Built-in performance metrics

### Configuration

```typescript
import logger from '@/lib/logger';

// Default config (automatic from environment)
const config = {
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  directory: path.join(process.cwd(), 'logs'),
  maxFileSize: 10 * 1024 * 1024, // 10MB
  maxBackupFiles: 30,
  enableConsole: true,
  enableFile: process.env.NODE_ENV === 'production',
  prettyPrint: process.env.NODE_ENV !== 'production',
};
```

### Usage Examples

#### Basic Logging

```typescript
// Debug level
logger.debug('Connecting to database', {
  context: 'DATABASE',
  metadata: { host: 'localhost', port: 27017 },
});

// Info level
logger.info('User login successful', {
  context: 'AUTH',
  request: {
    method: 'POST',
    url: '/api/auth/login',
    ip: '192.168.1.1',
    userId: 'admin@example.com',
  },
});

// Warning level
logger.warn('Rate limit warning', {
  context: 'SECURITY',
  metadata: {
    ip: '192.168.1.1',
    attempts: 4,
    threshold: 5,
  },
});

// Error level
logger.error('Database connection failed', error, {
  context: 'DATABASE',
  metadata: { retryCount: 3 },
});

// Fatal level (critical)
logger.fatal('System shutdown required', error, {
  context: 'SYSTEM',
  metadata: { reason: 'out_of_memory' },
});
```

#### HTTP Request/Response Logging

```typescript
// Log incoming request
logger.logRequest('GET', '/api/packages', '192.168.1.1', {
  userId: 'user@example.com',
  userAgent: 'Mozilla/5.0...',
  queryParams: { page: 1, limit: 10 },
});

// Log response after processing
logger.logResponse('GET', '/api/packages', 200, 45, {
  size: 2048,
  ip: '192.168.1.1',
});
```

#### Database Operation Logging

```typescript
logger.logDatabase('find', 'packages', 120, {
  query: 'db.packages.find({})',
  documentCount: 25,
});

// Error in database operation
logger.logDatabase('insert', 'inquiries', 80, {
  query: 'db.inquiries.insertOne(...)',
  documentCount: 1,
  error: new Error('Duplicate key error'),
});
```

#### Admin Action Logging

```typescript
logger.logAdminAction(
  'UPDATE',
  'packages/123',
  'admin@example.com',
  {
    before: { price: 100 },
    after: { price: 120 },
    changes: { price: 100 → 120 },
    result: 'success',
  }
);
```

#### Security Event Logging

```typescript
logger.logSecurityEvent('brute_force_attempt', 'high', {
  ip: '192.168.1.100',
  reason: '10 failed login attempts in 5 minutes',
  blocked: true,
});
```

#### Performance Tracking

```typescript
logger.logPerformance('api_request', 850, {
  threshold: 500,
  memory: 120,
  slow: true,
});
```

### Log Levels & When to Use

| Level | Use Case | Example |
|-------|----------|---------|
| **DEBUG** | Detailed diagnostic info | Variable values, function entry/exit |
| **INFO** | General informational | Successful operations, user actions |
| **WARN** | Potentially harmful situations | Slow operations, rate limits, deprecations |
| **ERROR** | Error events | API errors, failed requests, validation failures |
| **FATAL** | Critical errors | System shutdown, data corruption, security breach |

---

## Error Handler (lib/errorHandler.ts)

### Error Classes

```typescript
// Basic usage
throw new ValidationError('Invalid email format', { field: 'email' });
throw new AuthenticationError('Invalid credentials');
throw new AuthorizationError('Admin access required');
throw new NotFoundError('Package');
throw new ConflictError('Package already exists');
throw new RateLimitError(120);
throw new DatabaseError('Connection timeout');
throw new ExternalServiceError('PaymentAPI', 'Service unavailable');
```

### Error Response Format

**Success Response:**
```json
HTTP/1.1 200 OK
{
  "data": {...}
}
```

**Error Response (Development):**
```json
HTTP/1.1 400 Bad Request
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid email format",
    "statusCode": 400,
    "stack": "Error: Invalid email format\n    at Function.ts:123:...",
    "context": { "field": "email" }
  },
  "timestamp": "2024-01-15T12:00:00.000Z",
  "endpoint": "/api/packages"
}
```

**Error Response (Production):**
```json
HTTP/1.1 400 Bad Request
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid email format",
    "statusCode": 400
  },
  "timestamp": "2024-01-15T12:00:00.000Z",
  "endpoint": "/api/packages"
}
```

### Using Error Handler in Routes

```typescript
import { handleError, ValidationError } from '@/lib/errorHandler';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate
    if (!body.email) {
      throw new ValidationError('Email is required', { field: 'email' });
    }

    // Process request
    const result = await someAsyncOperation();

    return NextResponse.json({ data: result });
  } catch (error) {
    return handleError(error, {
      endpoint: '/api/packages',
      method: 'POST',
      userId: session?.email,
      ip: getClientIP(request.headers),
    });
  }
}
```

---

## Performance Monitor (lib/performanceMonitor.ts)

### Monitoring Capabilities

- **Response time tracking:** API, database, critical operations
- **Memory usage:** Heap, external, RSS tracking
- **CPU usage:** Load average, CPU count, model
- **Slow operation detection:** Automatic threshold alerts
- **System health score:** 0-100 based on metrics
- **Statistics:** Min, max, average, p50, p95, p99

### Usage Examples

#### Measure Async Operations

```typescript
import performanceMonitor from '@/lib/performanceMonitor';

// Measure database query
const data = await performanceMonitor.measureAsync(
  'db_query_packages',
  async () => {
    return await Package.find({});
  },
  'database' // type: 'api' | 'database' | 'critical'
);

// Measure external API call
const result = await performanceMonitor.measureAsync(
  'external_payment_api',
  async () => {
    return await fetch('https://api.payment.com/charge');
  },
  'critical'
);
```

#### Measure Sync Operations

```typescript
const processed = performanceMonitor.measureSync(
  'data_processing',
  () => {
    return largeArray.map(item => processItem(item));
  },
  'api'
);
```

#### Get Performance Statistics

```typescript
// Get stats for specific operation
const stats = performanceMonitor.getStats('db_query_packages');
// Returns: { count, avg, min, max, p50, p95, p99, slowCount, memory }

// Get stats for all operations
const allStats = performanceMonitor.getStats();

// Get recent metrics
const metrics = performanceMonitor.getMetrics(50); // Last 50

// Get system health
const health = performanceMonitor.getSystemHealth();
// Returns: { healthy, score, memory, cpu, operations }
```

### Default Thresholds

```typescript
const thresholds = {
  api: 500,        // API responses: < 500ms
  database: 200,   // Database queries: < 200ms
  critical: 1000,  // Critical operations: < 1000ms
};
```

### Performance Response Example

```json
{
  "timestamp": "2024-01-15T12:00:00.000Z",
  "health": {
    "healthy": true,
    "score": 85,
    "memory": {
      "heapUsed": 150,
      "heapTotal": 256,
      "heapUsagePercent": 59,
      "available": 106
    },
    "cpu": {
      "count": 8,
      "model": "Intel(R) Core(TM) i7...",
      "speed": 2400,
      "loadAverage": [2.5, 2.1, 1.8]
    },
    "operations": {
      "total": 100,
      "slow": 5,
      "slowPercent": 5
    }
  },
  "stats": {
    "operation": "all",
    "count": 100,
    "avg": 125,
    "min": 10,
    "max": 850,
    "p50": 85,
    "p95": 450,
    "p99": 720,
    "slowCount": 5,
    "slowPercentage": "5.0"
  }
}
```

---

## Middleware Logging

### What Gets Logged

The middleware automatically logs:

1. **All incoming requests:**
   - HTTP method (GET, POST, etc.)
   - Request path and query params
   - Client IP address
   - User-Agent
   - Timestamp

2. **Authentication events:**
   - Successful admin login
   - Failed login attempts (reason)
   - Admin access granted/denied
   - Session expiration

3. **Response information:**
   - Status code
   - Response time (ms)
   - Client IP

### Example Middleware Logs

```
[2024-01-15 12:00:00.123] INFO [HTTP] Incoming request [GET] /api/packages?page=1 (IP: 192.168.1.1)
[2024-01-15 12:00:00.145] DEBUG [AUTH] Admin access granted (GET) /admin/dashboard (IP: 192.168.1.1)
[2024-01-15 12:00:00.200] INFO [HTTP] Request completed [200] /api/packages (45ms)
[2024-01-15 12:00:05.345] WARN [AUTH] Admin access denied: Invalid or expired session (POST) /api/admin/packages (IP: 192.168.1.2)
```

---

## Admin Logging APIs

### GET /api/admin/logs

Get application logs (all or specific level)

**Query Parameters:**
```
?level=info         # Log level: debug, info, warn, error, fatal
?lines=100          # Number of lines to return (default: 100)
```

**Example Request:**
```bash
curl http://localhost:3000/api/admin/logs?level=error&lines=50
```

**Example Response:**
```json
{
  "level": "error",
  "count": 12,
  "logs": [
    "{\"timestamp\":\"2024-01-15 12:00:00.123\",\"level\":\"error\",\"message\":\"Database connection failed\",\"error\":{\"message\":\"ECONNREFUSED\",\"code\":\"ECONNREFUSED\"}}",
    ...
  ]
}
```

### POST /api/admin/logs/clear

Clear logs (implementation: create rotation in production)

**Example Request:**
```bash
curl -X POST http://localhost:3000/api/admin/logs/clear \
  -H "Content-Type: application/json" \
  -d '{"level":"debug"}'
```

### GET /api/admin/metrics

Get performance metrics and system health

**Query Parameters:**
```
?operation=db_query       # Filter by operation name
?format=json              # json (default) or csv
```

**Example Request:**
```bash
# JSON format
curl http://localhost:3000/api/admin/metrics

# CSV format
curl http://localhost:3000/api/admin/metrics?format=csv > metrics.csv

# Specific operation
curl http://localhost:3000/api/admin/metrics?operation=packages
```

**Example Response:**
```json
{
  "timestamp": "2024-01-15T12:00:00.000Z",
  "health": {
    "healthy": true,
    "score": 87,
    "memory": { ... },
    "cpu": { ... }
  },
  "stats": {
    "operation": "all",
    "count": 1250,
    "avg": 145,
    "p95": 520,
    "slowCount": 63,
    "slowPercentage": "5.0%"
  },
  "recentMetrics": [ ... ]
}
```

---

## Log Files & Storage

### File Structure

```
logs/
├── debug-2024-01-15.log      # Debug level messages
├── info-2024-01-15.log       # Info level messages
├── warn-2024-01-15.log       # Warning messages
├── error-2024-01-15.log      # Error messages
├── fatal-2024-01-15.log      # Fatal errors
├── all-2024-01-15.log        # All levels combined
├── error-2024-01-15-120000.log        # Rotated file (when > 10MB)
└── ...
```

### Log Rotation

**Automatic triggers:**
- Daily: New date = new log files
- Size-based: File > 10MB → rotation
- Cleanup: Old files > retention days deleted

**Manual trigger:**
```bash
# Get current log status
npm run logs:status

# Cleanup old logs
npm run logs:cleanup

# Export logs for analysis
npm run logs:export --format csv > logs-backup.csv
```

### Log Retention

```
Default: 30 days

Configuration in .env:
LOG_MAX_BACKUP_FILES=30        # Keep logs from last 30 days
LOG_MAX_FILE_SIZE=10485760     # Rotate at 10MB
```

---

## Audit Trail

### What Gets Audited

**Admin Operations:**
- Create package/fair/gallery/setting
- Update package/fair/gallery/setting
- Delete package/fair/gallery/setting
- Login/logout
- Configuration changes

**Security Events:**
- Failed login attempts
- Rate limit violations
- Unauthorized access attempts
- Permission denials
- Token expirations

**System Events:**
- Database errors
- External service failures
- Performance anomalies
- Application errors

### Audit Log Entry

```json
{
  "timestamp": "2024-01-15T12:00:00.000Z",
  "level": "info",
  "message": "Admin action: UPDATE on packages/123",
  "context": "ADMIN",
  "request": {
    "method": "ADMIN",
    "url": "packages/123",
    "ip": "internal",
    "userId": "admin@example.com"
  },
  "metadata": {
    "action": "UPDATE",
    "before": { "price": 100 },
    "after": { "price": 120 },
    "changes": { "price": "100 → 120" },
    "result": "success"
  }
}
```

---

## Security Logging

### Security Events Tracked

| Event | Severity | Action |
|-------|----------|--------|
| Failed login (1-3 attempts) | LOW | Log attempt |
| Failed login (4-5 attempts) | MEDIUM | Log, warn |
| Failed login (>5 attempts) | HIGH | Log, block IP |
| Rate limit exceeded | MEDIUM | Log, throttle |
| Unauthorized access attempt | HIGH | Log, alert |
| Validation error (malicious input) | MEDIUM | Log suspicious pattern |
| Permission denied | MEDIUM | Log event |
| Token expiration | LOW | Log for audit |

### Example Security Events

```typescript
// Brute force protection
logger.logSecurityEvent('brute_force_attempt', 'critical', {
  ip: '192.168.1.100',
  userId: 'attacker@example.com',
  reason: '15 failed login attempts in 10 minutes',
  blocked: true,
});

// Rate limit exceeded
logger.logSecurityEvent('rate_limit_exceeded', 'medium', {
  ip: '192.168.1.101',
  reason: '100 requests in 1 minute (limit: 60)',
  blocked: true,
});

// Unauthorized access
logger.logSecurityEvent('unauthorized_access', 'high', {
  ip: '192.168.1.102',
  userId: 'user@example.com',
  reason: 'Attempted access to admin endpoint without admin role',
  blocked: true,
});
```

---

## Monitoring & Alerting

### Setting Up Alerts

**In production, trigger alerts when:**

1. **Error rate > 1%:**
   ```bash
   # Check error logs in last hour
   tail -f logs/error-*.log | wc -l
   ```

2. **Response time > 1000ms (p95):**
   ```bash
   curl http://localhost:3000/api/admin/metrics | jq '.stats.p95'
   ```

3. **Memory usage > 80%:**
   ```bash
   curl http://localhost:3000/api/admin/metrics | jq '.health.memory.heapUsagePercent'
   ```

4. **Slow operations > 10%:**
   ```bash
   curl http://localhost:3000/api/admin/metrics | jq '.health.operations.slowPercent'
   ```

5. **Security events (all):**
   ```bash
   tail -f logs/error-*.log | grep SECURITY
   ```

### Recommended Monitoring Tools

- **Development:** Use `tail -f logs/*.log`
- **Staging:** ELK Stack (Elasticsearch, Logstash, Kibana)
- **Production:** Datadog, New Relic, CloudWatch, Sentry

---

## Troubleshooting

### Issue: No logs being written

**Causes:**
- LOG_FILE disabled in production
- Log directory doesn't exist
- Permission denied on log directory

**Solutions:**
```bash
# Check env variables
echo $LOG_FILE              # Should be 'true' in production
echo $LOGS_DIR              # Should be valid path

# Create logs directory
mkdir -p logs
chmod 755 logs

# Check permissions
ls -la logs/
```

### Issue: Log files growing too large

**Causes:**
- LOG_MAX_FILE_SIZE too high
- LOG_LEVEL too verbose (debug)
- Log cleanup not running

**Solutions:**
```bash
# Reduce log level
LOG_LEVEL=info npm start

# Enable rotation
LOG_MAX_FILE_SIZE=5242880    # 5MB

# Manually cleanup old logs
npm run logs:cleanup

# Check current usage
du -sh logs/
```

### Issue: Performance metrics show high latency

**Causes:**
- Slow database queries
- External API timeouts
- Memory pressure
- CPU saturation

**Solutions:**
```bash
# Check slow operations
curl http://localhost:3000/api/admin/metrics | jq '.health.operations'

# Check memory
curl http://localhost:3000/api/admin/metrics | jq '.health.memory'

# Optimize queries or scale resources
```

---

## Production Deployment

### Checklist

- [ ] Set LOG_LEVEL=info (not debug)
- [ ] Set LOG_CONSOLE=false (disable noisy console)
- [ ] Set LOG_FILE=true (enable file logging)
- [ ] Set LOGS_DIR to absolute path (/var/logs/travelagency)
- [ ] Ensure log directory permissions (755)
- [ ] Set LOG_MAX_BACKUP_FILES=30 or higher
- [ ] Configure log rotation in system (logrotate on Linux)
- [ ] Set up centralized logging (ELK, Datadog, etc.)
- [ ] Configure alerting on error/security events
- [ ] Regular log backup/archival
- [ ] Test log recovery procedures
- [ ] Document alerting runbooks

### Production Environment Variables

```bash
NODE_ENV=production
LOG_LEVEL=info
LOG_CONSOLE=false
LOG_FILE=true
LOG_PRETTY_PRINT=false
LOGS_DIR=/var/logs/travelagency
LOG_MAX_FILE_SIZE=10485760
LOG_MAX_BACKUP_FILES=90       # 90 days retention
```

---

## References

- [RFC 5424 - Syslog Protocol](https://tools.ietf.org/html/rfc5424)
- [JSON Logging Standard](https://www.kartar.net/2015/12/structured-logging/)
- [Performance Monitoring Best Practices](https://devops.com/monitoring-logging-best-practices/)
- [Error Handling Patterns](https://nodejs.org/en/docs/guides/nodejs-error-handling/)
- [Security Event Logging](https://owasp.org/www-project-proactive-controls/v3/en/c9-logging-monitoring)
