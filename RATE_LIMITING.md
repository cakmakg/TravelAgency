# Rate Limiting Implementation Guide

## Overview

This document describes the rate limiting system implemented to protect against brute-force attacks and Denial of Service (DoS) attacks across the TravelAgency API.

## Architecture

### Implementation Type: In-Memory Rate Limiter

**Pros:**
- No external dependency (no Redis needed)
- Fast response times (< 1ms per check)
- Simple deployment in serverless environments
- Automatic cleanup of expired entries

**Cons:**
- Not shared across multiple server instances
- Data loss on server restart
- Memory usage grows with unique IPs

**For Production Multi-Server Deployments:**
Consider implementing Redis-based rate limiting. The current `lib/rateLimit.ts` structure supports easy migration:
```typescript
// Future enhancement: Replace in-memory Map with Redis client
// See TODO comments in lib/rateLimit.ts
```

## Rate Limiting Configuration

### Available Profiles

| Profile | Limit | Window | Use Case |
|---------|-------|--------|----------|
| `login` | 5 requests | 15 minutes | Brute-force protection |
| `admin` | 30 requests | 1 minute | Admin API endpoints |
| `publicAPI` | 60 requests | 1 minute | Public API endpoints |
| `inquiry` | 10 requests | 1 hour | Contact form submissions |
| `development` | Unlimited | - | Development mode (disabled) |

### Using Rate Limiters in Routes

#### Basic Setup

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getClientIP, createRateLimiter, getRateLimitConfig } from '@/lib/rateLimit';

// Create limiter once at module level
const myLimiter = createRateLimiter(
  getRateLimitConfig('publicAPI', process.env.NODE_ENV === 'development')
);

export async function GET(request: NextRequest) {
  // Extract client IP
  const clientIP = getClientIP(request.headers);
  const rateLimitKey = `your-endpoint:${clientIP}`;
  
  // Check rate limit
  const result = myLimiter(rateLimitKey);
  
  if (!result.allowed) {
    return NextResponse.json(
      { error: 'Too many requests', retryAfter: result.retryAfter },
      {
        status: 429,
        headers: {
          'Retry-After': result.retryAfter.toString(),
          'X-RateLimit-Limit': '60',
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': new Date(result.resetTime).toISOString(),
        }
      }
    );
  }
  
  // Process request normally...
  
  // Add rate limit headers to response
  return NextResponse.json(
    { data: 'your data' },
    {
      headers: {
        'X-RateLimit-Limit': '60',
        'X-RateLimit-Remaining': result.remaining.toString(),
        'X-RateLimit-Reset': new Date(result.resetTime).toISOString(),
      }
    }
  );
}
```

## IP Detection

The system extracts client IP from the following headers (in priority order):

1. `x-forwarded-for` - Proxy forwarded IPs (uses first IP)
2. `cf-connecting-ip` - Cloudflare
3. `x-real-ip` - Nginx/Apache reverse proxy
4. `::1` - Fallback IPv6 localhost
5. `127.0.0.1` - Fallback IPv4 localhost

**Important for Proxy Environments:**
If behind a proxy/load balancer, ensure the reverse proxy correctly sets headers. Configure your hosting provider accordingly.

## Current Implementations

### 1. Login Endpoint (`/api/auth/login`)
- **Limit:** 5 attempts per 15 minutes per IP
- **Response Code:** 429 Too Many Requests
- **Headers:**
  - `Retry-After`: Seconds until next attempt
  - `X-RateLimit-Limit`: 5
  - `X-RateLimit-Remaining`: Attempts left

**Use Case:** Brute-force password attack prevention

### 2. Inquiry Endpoint (`/api/inquiry`)
- **Limit:** 10 requests per 1 hour per IP
- **Response Code:** 429 Too Many Requests
- **Headers:** Same as login

**Use Case:** Contact form spam/abuse prevention

### 3. Public API Endpoints (`/api/packages`, `/api/fairs`, `/api/gallery`)
- **Limit:** 60 requests per 1 minute per IP
- **Response Code:** 429 Too Many Requests
- **Headers:** Same as login + `X-RateLimit-Reset` (ISO timestamp)

**Use Case:** General DoS protection for public data endpoints

## HTTP Status Codes & Headers

### 429 Too Many Requests Response

```json
{
  "error": "Too many requests",
  "message": "Rate limit exceeded",
  "retryAfter": 120
}
```

**Response Headers:**
```
HTTP/1.1 429 Too Many Requests
Retry-After: 120
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 2024-01-20T14:35:00Z
```

### 2xx Success Response

**Additional Headers on Success:**
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 2024-01-20T14:35:00Z
```

## Development Mode

Rate limiting is **automatically disabled** in development:

```typescript
// In route files:
const myLimiter = createRateLimiter(
  getRateLimitConfig('publicAPI', process.env.NODE_ENV === 'development')
  // ↑ Pass `true` for development to disable rate limiting
);
```

This allows testing without hitting rate limits during development.

## Testing Rate Limiting

### Using curl

**Test login rate limiting (5 attempts/15min):**
```bash
# Attempt 1-5 should succeed
for i in {1..5}; do
  curl -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrong"}'
  echo "Attempt $i - Check X-RateLimit-Remaining header"
done

# Attempt 6 should return 429
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"wrong"}'
# Response: 429 Too Many Requests
```

**Test public API rate limiting (60 requests/1min):**
```bash
# Sequential requests
for i in {1..61}; do
  echo "Request $i:"
  curl -i http://localhost:3000/api/packages
  # First 60 should return 200, 61st should return 429
done
```

**Test with simulated IP header (for proxy testing):**
```bash
# Simulate requests from different IPs
for i in {1..3}; do
  curl -H "x-forwarded-for: 192.168.1.$i" \
    http://localhost:3000/api/packages
  # Each IP gets its own 60-request quota
done
```

### Monitoring

Monitor the in-memory store size in production:

```typescript
// In lib/rateLimit.ts, add monitoring:
console.log(`Rate limit store size: ${store.store.size} entries`);
// Typical: 50-500 entries depending on unique IPs
```

## Customization

### Creating Custom Profiles

```typescript
// In your route file
import { createRateLimiter } from '@/lib/rateLimit';

// Custom: 20 requests per 5 minutes
const customLimiter = createRateLimiter({
  windowMs: 5 * 60 * 1000,  // 5 minutes in ms
  maxRequests: 20
});

// Then use as normal
const result = customLimiter(rateLimitKey);
```

### Configurable Parameters

```typescript
interface RateLimitConfig {
  windowMs: number;      // Time window in milliseconds
  maxRequests: number;   // Maximum requests in window
}
```

## Security Considerations

### 1. IP Spoofing

**Risk:** Attackers could forge `x-forwarded-for` headers if proxy doesn't validate them.

**Mitigation:**
- Ensure your reverse proxy strips and re-adds these headers
- Configure proxy to only trust your infrastructure IPs
- Cloudflare automatically handles this correctly

### 2. Distributed Attacks

**Risk:** Single-server rate limiter can't coordinate across multiple attacker IPs.

**Mitigation:**
- For multi-server: Use Redis-based rate limiting (enterprise solution)
- Use WAF (Web Application Firewall) on Cloudflare/AWS for IP-based blocking
- Consider temporary IP bans after repeated violations

### 3. Memory Exhaustion

**Risk:** Unlimited unique IPs could exhaust server memory.

**Mitigation:**
- Automatic cleanup runs every 60 seconds
- Expired entries removed immediately
- Monitor store size (see Monitoring section)
- Typical memory: < 100KB for 1000 unique IPs

### 4. Client-Side Retries

**Important:** Clients must respect `Retry-After` header:

```javascript
// Client-side retry logic example
async function apiCall(url) {
  const response = await fetch(url);
  
  if (response.status === 429) {
    const retryAfter = parseInt(response.headers.get('Retry-After'));
    console.log(`Rate limited. Retry after ${retryAfter} seconds`);
    await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
    return apiCall(url); // Retry
  }
  
  return response.json();
}
```

## Production Deployment Checklist

- [ ] Enable rate limiting for all public endpoints
- [ ] Review and adjust limits per endpoint
- [ ] Monitor rate limit store size
- [ ] Test with load testing tools (Apache Bench, wrk)
- [ ] Verify IP headers are correctly forwarded from reverse proxy
- [ ] Set up alerts for high rate limit violations
- [ ] Document custom limits for team
- [ ] Consider Redis migration for multi-server deployments
- [ ] Test `Retry-After` header handling in client code
- [ ] Ensure error messages don't leak system information

## Migration to Redis (Future Enhancement)

When scaling to multiple servers, migrate to Redis:

```typescript
// Future: lib/rateLimit-redis.ts
import redis from 'redis';

const client = redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
});

// Redis stores rate limit data centrally
// All servers share the same limit pool
```

## Troubleshooting

### Issue: "Rate limit hit too quickly"
**Solution:** Check if rate limiting is incorrectly enabled in development. Verify `NODE_ENV === 'development'` is working correctly.

### Issue: "429 responses from different IPs"
**Solution:** If behind proxy, verify proxy is correctly setting IP headers. Test with direct IP access to verify headers.

### Issue: "Limits resetting unexpectedly"
**Solution:** Each unique IP key resets independently. Server restart clears all entries. This is expected behavior.

### Issue: "Memory usage growing"
**Solution:** Monitor automatic cleanup (60-second intervals). If still growing, check for unusual number of unique IPs (indicator of attack).

## References

- [RFC 6585 - 429 Too Many Requests](https://tools.ietf.org/html/rfc6585)
- [Retry-After Header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Retry-After)
- [X-Forwarded-For Header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Forwarded-For)
- [OWASP: Brute Force Attack](https://owasp.org/www-community/attacks/Brute_force_attack)
- [OWASP: Denial of Service](https://owasp.org/www-community/attacks/Denial_of_Service)

## Support

For questions or issues:
1. Check this documentation
2. Review `lib/rateLimit.ts` source code
3. Check endpoint-specific route files for implementation examples
4. Review test examples in "Testing Rate Limiting" section
