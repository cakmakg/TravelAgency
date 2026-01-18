/**
 * Rate Limiter Utility
 * 
 * In-memory rate limiting implementation for protecting against:
 * - Brute-force attacks (login)
 * - DoS attacks (API)
 * - Spam (public endpoints)
 * 
 * Note: For production with multiple servers, use Redis
 */

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
  message: string; // Error message
  statusCode: number; // HTTP status code
  keyGenerator?: (identifier: string) => string; // Custom key generator
}

export interface RateLimitEntry {
  count: number;
  firstRequest: number;
  resetTime: number;
}

/**
 * In-memory store for rate limit tracking
 * WARNING: This resets on server restart. Use Redis for persistence.
 */
class RateLimitStore {
  private store: Map<string, RateLimitEntry> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Auto-cleanup expired entries every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60000);
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    this.store.forEach((entry, key) => {
      if (entry.resetTime < now) {
        expiredKeys.push(key);
      }
    });

    expiredKeys.forEach(key => {
      this.store.delete(key);
    });
  }

  /**
   * Get current request count and reset time
   */
  get(key: string): RateLimitEntry | null {
    const entry = this.store.get(key);
    if (!entry) return null;

    const now = Date.now();
    
    // If window expired, reset
    if (entry.resetTime < now) {
      this.store.delete(key);
      return null;
    }

    return entry;
  }

  /**
   * Increment request count
   */
  increment(key: string, windowMs: number): RateLimitEntry {
    const now = Date.now();
    const entry = this.store.get(key);

    if (!entry || entry.resetTime < now) {
      // New entry
      const newEntry: RateLimitEntry = {
        count: 1,
        firstRequest: now,
        resetTime: now + windowMs,
      };
      this.store.set(key, newEntry);
      return newEntry;
    }

    // Increment existing entry
    entry.count++;
    return entry;
  }

  /**
   * Reset rate limit for a key
   */
  reset(key: string): void {
    this.store.delete(key);
  }

  /**
   * Get store size (for monitoring)
   */
  size(): number {
    return this.store.size;
  }

  /**
   * Destroy and clear resources
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.store.clear();
  }
}

// Global store instance
const globalStore = globalThis as any;
if (!globalStore.__rateLimitStore) {
  globalStore.__rateLimitStore = new RateLimitStore();
}
const store = globalStore.__rateLimitStore as RateLimitStore;

/**
 * Create a rate limiter middleware
 */
export function createRateLimiter(config: RateLimitConfig) {
  return (identifier: string): { allowed: boolean; remaining: number; resetTime: number; retryAfter: number } => {
    const key = config.keyGenerator ? config.keyGenerator(identifier) : identifier;
    
    const entry = store.increment(key, config.windowMs);
    const remaining = Math.max(0, config.maxRequests - entry.count);
    const retryAfter = Math.ceil((entry.resetTime - Date.now()) / 1000);

    return {
      allowed: entry.count <= config.maxRequests,
      remaining,
      resetTime: entry.resetTime,
      retryAfter: retryAfter > 0 ? retryAfter : 0,
    };
  };
}

/**
 * Get client IP from request headers
 * Supports multiple proxy types
 */
export function getClientIP(headers: Headers): string {
  // Try x-forwarded-for first (proxy/load balancer)
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) {
    // x-forwarded-for can contain multiple IPs, use the first one
    return forwarded.split(',')[0].trim();
  }

  // Try cf-connecting-ip (Cloudflare)
  const cloudflare = headers.get('cf-connecting-ip');
  if (cloudflare) {
    return cloudflare;
  }

  // Try x-real-ip (nginx)
  const realIP = headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }

  // Fallback
  return 'unknown';
}

/**
 * Predefined rate limit configurations
 */
export const RateLimitConfigs = {
  /**
   * Strict: For login endpoints (5 attempts per 15 minutes)
   */
  login: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
    message: 'Too many login attempts. Please try again later.',
    statusCode: 429,
  } as RateLimitConfig,

  /**
   * Medium: For admin endpoints (30 requests per minute)
   */
  admin: {
    windowMs: 1 * 60 * 1000, // 1 minute
    maxRequests: 30,
    message: 'Too many requests to admin API. Please slow down.',
    statusCode: 429,
  } as RateLimitConfig,

  /**
   * Standard: For public API endpoints (60 requests per minute)
   */
  publicAPI: {
    windowMs: 1 * 60 * 1000, // 1 minute
    maxRequests: 60,
    message: 'Too many requests. Please try again later.',
    statusCode: 429,
  } as RateLimitConfig,

  /**
   * Loose: For inquiry/contact forms (10 requests per hour)
   */
  inquiry: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 10,
    message: 'Too many inquiries. Please try again later.',
    statusCode: 429,
  } as RateLimitConfig,

  /**
   * Development: Disabled rate limiting
   */
  development: {
    windowMs: 60 * 60 * 1000,
    maxRequests: 1000000, // Essentially unlimited
    message: 'Rate limited',
    statusCode: 429,
  } as RateLimitConfig,
};

/**
 * Get rate limit config based on environment
 */
export function getRateLimitConfig(type: keyof typeof RateLimitConfigs, isDevelopment: boolean = false): RateLimitConfig {
  if (isDevelopment) {
    return RateLimitConfigs.development;
  }

  return RateLimitConfigs[type] || RateLimitConfigs.publicAPI;
}

/**
 * Cleanup function (call on server shutdown)
 */
export function cleanupRateLimiter(): void {
  store.destroy();
}

export default createRateLimiter;
