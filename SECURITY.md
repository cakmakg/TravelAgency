# 🔒 Security Guide - TravelAgency

## Overview

This document outlines the security implementations and best practices for the TravelAgency backend.

## Authentication & Authorization

### Session Management

- **JWT-based Sessions**: Uses `jose` library for secure JWT token generation and verification
- **Session Duration**: 2 hours (configurable via `SESSION_EXPIRATION_HOURS` in `lib/auth.ts`)
- **Cookie Flags**:
  - `httpOnly: true` - Prevents XSS attacks by blocking JavaScript access
  - `secure: true` (production only) - Cookies only sent over HTTPS
  - `sameSite: 'lax'` - Protects against CSRF attacks

### Password Security

- **Bcrypt Hashing**: Uses `bcryptjs` for secure password hashing (10 salt rounds)
- **Timing Attack Prevention**: Implements deliberate delays for failed login attempts
- **Environment Variables**: All credentials stored in environment variables, never hardcoded

### Protected Routes

- **Admin Pages** (`/admin/*`): Protected by middleware, requires valid session token
- **Admin APIs** (`/api/admin/*`): Protected by middleware, validates JWT token
- **Public APIs** (`/api/packages`, `/api/fairs`, `/api/gallery`): GET requests are public, POST/PUT/DELETE require authentication

## Environment Variables

### Required Variables

```env
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
ADMIN_EMAIL=admin@russoluxtours.de
ADMIN_PASSWORD=your-bcrypt-hashed-password
MONGODB_URI=mongodb://user:pass@host/database
```

### Generating Secure Credentials

#### JWT_SECRET
```bash
# Generate a random 32+ character string
openssl rand -base64 32
```

#### ADMIN_PASSWORD
```bash
# Generate bcrypt hash
npm run generate-password-hash "your-secure-password"

# Copy the output hash to your .env file
```

## API Security

### Authentication Flow

```
1. POST /api/auth/login
   ├── Validate email format (Zod)
   ├── Verify credentials (bcrypt.compare)
   ├── Create JWT token
   └── Set secure httpOnly cookie

2. Admin requests with valid cookie
   ├── Middleware validates token
   ├── Verifies expiration
   └── Attaches session to request headers

3. POST /api/auth/logout
   └── Clears session cookie
```

### Rate Limiting

Currently implements:
- 1-second delay on failed login attempts
- Client IP tracking for future rate limiting

**TODO**: Implement Redis-based rate limiting for production

## Best Practices

### ✅ Implemented

- [x] Environment variable validation at runtime
- [x] Bcrypt password hashing
- [x] Secure JWT with expiration
- [x] httpOnly + secure cookies
- [x] CSRF protection (sameSite)
- [x] Input validation (Zod)
- [x] Session timeout (2 hours)
- [x] Failed attempt logging

### ⚠️ To Implement

- [ ] Rate limiting (Redis)
- [ ] CORS configuration
- [ ] Security headers (CSP, X-Frame-Options)
- [ ] Request logging & monitoring
- [ ] Audit trails for admin changes
- [ ] Database encryption
- [ ] Email service verification
- [ ] Two-factor authentication (optional)

## Deployment Checklist

Before deploying to production:

- [ ] Set all required environment variables in production
- [ ] Generate strong JWT_SECRET and ADMIN_PASSWORD
- [ ] Enable HTTPS/SSL certificates
- [ ] Configure MongoDB with authentication
- [ ] Set NODE_ENV=production
- [ ] Enable security headers in middleware
- [ ] Configure CORS for your domain
- [ ] Set up monitoring and logging
- [ ] Review sensitive data in logs

## Vulnerability Scanning

### Known Issues

None currently documented.

### Security Scanning

To check for vulnerabilities in dependencies:

```bash
npm audit
npm audit fix  # Auto-fix vulnerabilities
```

## Reporting Security Issues

If you discover a security vulnerability, please email: security@russoluxtours.de

⚠️ **Do not** open a public issue for security vulnerabilities.

## References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Next.js Security](https://nextjs.org/docs/advanced-features/security-headers)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
