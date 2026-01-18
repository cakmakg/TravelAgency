# 🔐 CORS & Security Headers Configuration

## Overview

This document outlines the CORS (Cross-Origin Resource Sharing) and security headers implementation for the TravelAgency backend.

---

## Security Headers

All responses include security headers to protect against common attacks:

### Headers Configuration

**Applied to all routes (`/:path*`):**

#### 1. **X-Content-Type-Options: nosniff**
- Prevents MIME type sniffing attacks
- Ensures browsers respect the `Content-Type` header
- Blocks execution of scripts if they're incorrectly labeled

#### 2. **X-Frame-Options: SAMEORIGIN**
- Prevents clickjacking attacks
- Allows page embedding only within the same domain
- Value: `SAMEORIGIN` (pages can be framed by pages of same origin)

#### 3. **X-XSS-Protection: 1; mode=block**
- Enables browser XSS protection
- Blocks page if XSS attack is detected
- Legacy header (modern browsers use CSP instead)

#### 4. **Referrer-Policy: strict-origin-when-cross-origin**
- Controls how much referrer information is shared
- Hides referrer on cross-origin requests
- Maintains referrer for same-origin requests

#### 5. **Permissions-Policy**
- Disables unnecessary browser APIs
- Current restrictions:
  - `geolocation=()` - Disable geolocation API
  - `microphone=()` - Disable microphone access
  - `camera=()` - Disable camera access

#### 6. **Strict-Transport-Security (Production Only)**
- Enforces HTTPS for all connections
- `max-age=31536000` - Valid for 1 year
- `includeSubDomains` - Applies to subdomains
- `preload` - Allows browser preload list submission

#### 7. **Content-Security-Policy (CSP)**
- Comprehensive protection against XSS and injection attacks
- **Policy Rules:**

```
default-src 'self'
  → Only allows resources from the same origin

script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net
  → Scripts from same origin, inline (for Next.js), and CDN

style-src 'self' 'unsafe-inline' https://fonts.googleapis.com
  → Styles from same origin, inline, and Google Fonts

font-src 'self' https://fonts.gstatic.com
  → Fonts from same origin and Google Fonts

img-src 'self' data: https: blob:
  → Images from same origin, data URLs, HTTPS, and blob URLs

media-src 'self'
  → Media from same origin

connect-src 'self' https:
  → API calls to same origin and HTTPS

frame-ancestors 'self'
  → Page can only be framed by same origin

base-uri 'self'
  → Base URL must be same origin

form-action 'self'
  → Forms can only submit to same origin
```

**API-Specific Headers (`/api/:path*`):**

- `X-Frame-Options: DENY` - API cannot be framed
- `X-Content-Type-Options: nosniff` - Prevents MIME sniffing

---

## CORS Configuration

### Implementation

CORS is configured via `lib/cors.ts` and applied in middleware.

#### Development Environment

**Allowed Origins:**
```
http://localhost:3000
http://localhost:3001
http://127.0.0.1:3000
http://127.0.0.1:3001
```

#### Production Environment

**Allowed Origins:**
```
https://russoluxtours.de
https://www.russoluxtours.de
```

(Derived from `NEXT_PUBLIC_APP_URL` environment variable)

### CORS Headers

The following headers are added to all API responses (if origin is allowed):

```
Access-Control-Allow-Origin: <requesting-origin>
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH
Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept
Access-Control-Expose-Headers: X-Total-Count, X-Page-Number
Access-Control-Max-Age: 86400
```

### Preflight Requests (OPTIONS)

OPTIONS requests are handled automatically:
- Returns `200 OK` with appropriate CORS headers
- No authentication required for preflight
- Cache duration: 24 hours

### Usage Examples

#### JavaScript Fetch

```javascript
// Automatic CORS handling
const response = await fetch('https://api.russoluxtours.de/api/packages', {
  method: 'GET',
  credentials: 'include', // Include cookies
  headers: {
    'Content-Type': 'application/json',
  },
});
```

#### Axios

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.russoluxtours.de',
  withCredentials: true, // Include cookies
});

const packages = await api.get('/api/packages');
```

#### cURL

```bash
# Simple GET
curl -X GET https://api.russoluxtours.de/api/packages

# With credentials
curl -X GET https://api.russoluxtours.de/api/packages \
  -H "Origin: https://russoluxtours.de" \
  -H "Cookie: admin-session=..."
```

---

## Configuration Management

### Environment Variables

```env
# Sets the allowed origin for production
NEXT_PUBLIC_APP_URL=https://russoluxtours.de

# Controls security header strictness
NODE_ENV=production
```

### Modifying CORS Config

Edit `lib/cors.ts` to:
1. Add/remove allowed origins
2. Change HTTP methods
3. Modify headers list
4. Adjust cache duration

```typescript
export function getCORSConfig(): CORSConfig {
  // Development/Production specific configuration
  if (isDevelopment) {
    return {
      allowedOrigins: [/* ... */],
      // ... other config
    };
  }
  
  return { /* production config */ };
}
```

---

## Testing CORS

### Browser DevTools

```javascript
// Test CORS from browser console
fetch('https://api.russoluxtours.de/api/packages', {
  credentials: 'include',
})
  .then(r => r.json())
  .then(data => console.log('Success:', data))
  .catch(e => console.error('Error:', e.message));
```

### Server-side Testing

```bash
# Check CORS headers
curl -I -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -X OPTIONS http://localhost:3000/api/admin/packages

# Check security headers
curl -I http://localhost:3000/

# Verify CSP
curl -I http://localhost:3000/ | grep Content-Security-Policy
```

### Common CORS Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `No 'Access-Control-Allow-Origin' header` | Origin not allowed | Add origin to `corsConfig.allowedOrigins` |
| `Credentials mode is 'include' but Access-Control-Allow-Credentials is missing` | Missing header | Enable credentials in CORS config |
| `Method not allowed` | HTTP method not in Allow-Methods | Add method to `corsConfig.methods` |
| `Header not allowed` | Header not in Allow-Headers | Add header to `corsConfig.headers` |

---

## Security Considerations

### ✅ Implemented

- [x] Strict CSP to prevent XSS
- [x] Frame protection (X-Frame-Options)
- [x] MIME type validation (X-Content-Type-Options)
- [x] HTTPS enforcement (HSTS in production)
- [x] Permission restrictions (Permissions-Policy)
- [x] Origin validation (CORS)
- [x] Preflight handling

### ⚠️ To Implement

- [ ] CSP reporting endpoint (`report-uri`)
- [ ] Rate limiting per origin
- [ ] IP-based CORS restrictions
- [ ] CORS for subdomains
- [ ] Dynamic origin validation from database

---

## Deployment Checklist

### Development
- [ ] Verify CORS works with `http://localhost:3000`
- [ ] Check security headers in DevTools
- [ ] Test OPTIONS preflight requests

### Production
- [ ] Set `NODE_ENV=production`
- [ ] Set `NEXT_PUBLIC_APP_URL=https://your-domain.com`
- [ ] Enable HTTPS/SSL certificate
- [ ] Test CORS from your frontend domain
- [ ] Verify HSTS header is present
- [ ] Run security scanner (e.g., Mozilla Observatory)

---

## Security Headers Scan

Use online tools to verify security:

- **Mozilla Observatory:** https://observatory.mozilla.org/
- **SSL Labs:** https://www.ssllabs.com/ssltest/
- **Security Headers:** https://securityheaders.com/

---

## References

- [MDN: Cross-Origin Resource Sharing](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [MDN: HTTP Headers Security](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers#security)
- [OWASP: Content Security Policy](https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html)
- [Next.js: Security Headers](https://nextjs.org/docs/advanced-features/security-headers)
