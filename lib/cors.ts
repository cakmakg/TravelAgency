/**
 * CORS Configuration for TravelAgency Backend
 * 
 * This file defines CORS policies and allowed origins
 */

export interface CORSConfig {
  allowedOrigins: string[];
  credentials: boolean;
  methods: string[];
  headers: string[];
  exposedHeaders: string[];
  maxAge: number;
}

/**
 * Get CORS configuration based on environment
 */
export function getCORSConfig(): CORSConfig {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isProduction = process.env.NODE_ENV === 'production';

  // Development: Allow localhost variants
  if (isDevelopment) {
    return {
      allowedOrigins: [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3001',
      ],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
      headers: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'Accept',
      ],
      exposedHeaders: ['X-Total-Count', 'X-Page-Number'],
      maxAge: 86400, // 24 hours
    };
  }

  // Production: Only allow specific domain
  const productionDomain = process.env.NEXT_PUBLIC_APP_URL || 'https://russoluxtours.de';
  const allowedOrigins = [
    productionDomain,
    productionDomain.replace('https://', 'https://www.'),
  ];

  return {
    allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    headers: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
    ],
    exposedHeaders: ['X-Total-Count', 'X-Page-Number'],
    maxAge: 86400, // 24 hours
  };
}

/**
 * Check if origin is allowed
 */
export function isOriginAllowed(origin: string | undefined, config: CORSConfig): boolean {
  if (!origin) return false;
  return config.allowedOrigins.includes(origin);
}

/**
 * Get CORS headers for response
 */
export function getCORSHeaders(
  origin: string | undefined,
  config: CORSConfig
): Record<string, string> {
  const isAllowed = isOriginAllowed(origin, config);

  if (!isAllowed) {
    return {};
  }

  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Credentials': config.credentials ? 'true' : 'false',
    'Access-Control-Allow-Methods': config.methods.join(', '),
    'Access-Control-Allow-Headers': config.headers.join(', '),
    'Access-Control-Expose-Headers': config.exposedHeaders.join(', '),
    'Access-Control-Max-Age': config.maxAge.toString(),
  };
}

/**
 * Handle CORS preflight request (OPTIONS)
 */
export function handleCORSPreflight(
  origin: string | undefined,
  config: CORSConfig
): Record<string, string> {
  return getCORSHeaders(origin, config);
}

export default getCORSConfig;
