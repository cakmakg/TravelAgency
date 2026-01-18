# 📋 API Endpoints & Validation

## Overview

All API endpoints now include comprehensive input validation using Zod and proper error handling. This document outlines the validation rules and usage for each endpoint.

---

## Authentication Endpoints

### POST /api/auth/login
**Authentication:** Not required (public endpoint)

**Request Body:**
```typescript
{
  email: string (email format required),
  password: string (min 1 character)
}
```

**Validation:**
- Email must be valid format
- Password is required (non-empty)
- Max 1 second delay on failed attempt

**Response:**
```typescript
// Success (201)
{ success: true, message: "Login successful" }

// Validation Error (400)
{
  error: "Validation error",
  details: [
    { field: "email", message: "Invalid email address" }
  ]
}

// Auth Failure (401)
{ error: "Invalid credentials" }
```

---

### POST /api/auth/logout
**Authentication:** Required (middleware)

**Response:**
```typescript
// Success (200)
{ success: true, message: "Logout successful" }
```

---

## Admin Endpoints

All admin endpoints require valid JWT session token in `admin-session` cookie.

### PUT /api/admin/packages
**Authentication:** Required

**Request Body:**
```typescript
{
  packageId: number (required, positive integer),
  title?: string (min 3 characters),
  duration?: string (min 1 character),
  price?: string (min 1 character),
  image?: string (valid URL),
  features?: string[] (array of non-empty strings),
  description?: string,
  inclusions?: string[] (array of non-empty strings),
  itinerary?: Array<{
    day: string (required),
    title: string (required),
    desc: string (required)
  }>
}
```

**Validation Rules:**
- `packageId` must be positive integer (required)
- `title` must be 3+ characters if provided
- `image` must be valid URL if provided
- `features` must be non-empty string array
- Unknown fields are rejected (strict mode)

**Response:**
```typescript
// Success (200)
{ /* updated package object */ }

// Validation Error (400)
{
  error: "Validation error",
  details: [
    { field: "image", message: "Image must be a valid URL" }
  ]
}

// Not Found (404)
{ error: "Package not found" }
```

---

### PUT /api/admin/fairs
**Authentication:** Required

**Request Body:**
```typescript
{
  fairId: number (required, positive integer),
  name?: string (min 2 characters),
  date?: string (required if updating),
  category?: string (required if updating),
  description?: string (min 10 characters),
  fullDescription?: string,
  venue?: string,
  highlights?: string[] (array of non-empty strings)
}
```

**Validation Rules:**
- `fairId` must be positive integer (required)
- `description` must be 10+ characters if provided
- `name` must be 2+ characters if provided
- Unknown fields are rejected

---

### PUT /api/admin/gallery
**Authentication:** Required

**Request Body:**
```typescript
Array<{
  imageId?: number (1-1000),
  id?: number (alternative to imageId),
  src: string (required, valid URL),
  alt: string (required, 1-200 characters)
}>
```

**Validation Rules:**
- Array must contain at least 1 image
- `src` must be valid URL
- `alt` text is required and max 200 characters
- Image ID must be between 1-1000
- **Warning:** DELETE all existing images and replace (implement backup first!)

**Response:**
```typescript
// Success (200)
[/* array of updated images */]

// Validation Error (400)
{
  error: "Validation error",
  details: [
    { path: "[0].src", message: "Image URL must be a valid URL" }
  ]
}
```

---

### PUT /api/admin/settings
**Authentication:** Required

**Request Body:**
```typescript
{
  companyName?: string (min 2 characters),
  tagline?: string (min 5 characters),
  email?: string (valid email format),
  phone?: string (min 6 characters, regex pattern),
  address?: string (min 5 characters),
  city?: string (min 2 characters),
  country?: string (min 2 characters),
  facebook?: string (valid URL or empty),
  instagram?: string (valid URL or empty),
  linkedin?: string (valid URL or empty),
  heroTitle?: string (min 3 characters),
  heroSubtitle?: string (min 3 characters),
  heroDescription?: string (min 10 characters)
}
```

**Validation Rules:**
- All fields are optional
- Email must be valid format
- Phone must match: `^\+?[\d\s\-()]{6,}$`
- URLs must be valid or empty string
- Unknown fields are rejected

---

## Public Endpoints

These endpoints are read-only and require no authentication.

### GET /api/packages
**Response:** Array of packages with full details

### GET /api/fairs
**Response:** Array of trade fairs

### GET /api/gallery
**Response:** Array of gallery images

---

## Error Handling

### Standard Error Response
```typescript
{
  error: string,           // Error message
  message?: string,        // Optional detailed message
  details?: Array<{        // Optional validation details
    field: string,
    message: string
  }>
}
```

### HTTP Status Codes
| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Validation error |
| 401 | Unauthorized (missing/invalid token) |
| 404 | Resource not found |
| 500 | Server error |

---

## Testing Endpoints

### Using cURL

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@russoluxtours.de","password":"your-password"}' \
  -c cookies.txt

# Update package (with cookie)
curl -X PUT http://localhost:3000/api/admin/packages \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "packageId": 1,
    "title": "Updated Title",
    "price": "ab 5000 €"
  }'

# Logout (with cookie)
curl -X POST http://localhost:3000/api/auth/logout \
  -b cookies.txt
```

### Using Postman

1. Import the collection (see `postman-collection.json`)
2. Set environment variable: `base_url=http://localhost:3000`
3. Use "Login" request to authenticate
4. Use other requests with same environment (cookies auto-managed)

---

## Security Considerations

✅ **Implemented:**
- Input validation on all admin endpoints
- Email & URL format validation
- String length constraints
- Type safety with Zod
- Unknown field rejection
- HTTP status code standardization
- Secure error messages (no stack traces)

⚠️ **To Implement:**
- Rate limiting per IP
- Request size limits
- CORS configuration
- API versioning
- Request logging/audit trail
- Database query optimization

---

## Migration Guide

### From Old to New Validation

**Before (No Validation):**
```typescript
const data = await request.json();
const { packageId, ...updateData } = data;
await Package.findOneAndUpdate({ packageId }, updateData, { upsert: true });
```

**After (With Validation):**
```typescript
const validation = PackageUpdateSchema.safeParse(data);
if (!validation.success) {
  return NextResponse.json({ error: 'Validation error', details: ... }, { status: 400 });
}
const { packageId, ...updateData } = validation.data;
await Package.findOneAndUpdate({ packageId }, updateData, { new: true, runValidators: true });
```

### Breaking Changes

1. **Upsert disabled:** `findOneAndUpdate` no longer creates documents. Must check existence first.
2. **Strict validation:** Unknown fields are rejected (client must only send defined fields)
3. **Gallery bulk update:** Must send at least 1 image in array (can't clear gallery with empty array)
4. **Error format:** Validation errors now include `details` array

---

## API Versioning (Future)

When implementing v2, use path-based versioning:
```
/api/v1/packages
/api/v2/packages
```

Never accept breaking changes in same version.
