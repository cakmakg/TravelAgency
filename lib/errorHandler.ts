/**
 * Centralized Error Handler
 * 
 * Unified error handling with:
 * - Consistent error responses
 * - Error logging with context
 * - Stack trace capture
 * - Security (no sensitive data leak)
 * - Monitoring and alerting ready
 */

import logger from './logger';
import { NextResponse } from 'next/server';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;
  public readonly context?: Record<string, unknown>;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR',
    isOperational: boolean = true,
    context?: Record<string, unknown>
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);

    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    this.context = context;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Common error classes
 */
export class ValidationError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 400, 'VALIDATION_ERROR', true, context);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed', context?: Record<string, unknown>) {
    super(message, 401, 'AUTHENTICATION_ERROR', true, context);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Access denied', context?: Record<string, unknown>) {
    super(message, 403, 'AUTHORIZATION_ERROR', true, context);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, context?: Record<string, unknown>) {
    super(`${resource} not found`, 404, 'NOT_FOUND', true, context);
  }
}

export class ConflictError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 409, 'CONFLICT', true, context);
  }
}

export class RateLimitError extends AppError {
  public readonly retryAfter: number;

  constructor(retryAfter: number, context?: Record<string, unknown>) {
    super('Too many requests', 429, 'RATE_LIMIT_EXCEEDED', true, context);
    this.retryAfter = retryAfter;
  }
}

export class DatabaseError extends AppError {
  constructor(message: string = 'Database operation failed', context?: Record<string, unknown>) {
    super(message, 500, 'DATABASE_ERROR', true, context);
  }
}

export class ExternalServiceError extends AppError {
  constructor(
    service: string,
    message: string = `${service} service unavailable`,
    context?: Record<string, unknown>
  ) {
    super(message, 503, 'SERVICE_UNAVAILABLE', true, context);
  }
}

/**
 * Error handler function
 */
export function handleError(
  error: unknown,
  context?: {
    endpoint?: string;
    method?: string;
    userId?: string;
    ip?: string;
    additionalContext?: Record<string, unknown>;
  }
): NextResponse {
  let appError: AppError;

  if (error instanceof AppError) {
    appError = error;
  } else if (error instanceof Error) {
    // Map known errors to AppError
    if (error.name === 'ValidationError') {
      appError = new ValidationError(error.message);
    } else if (error.name === 'CastError') {
      appError = new ValidationError('Invalid data format');
    } else if (error.name === 'MongoServerError' && (error as any).code === 11000) {
      appError = new ConflictError('Resource already exists');
    } else {
      appError = new AppError(error.message, 500, 'INTERNAL_ERROR', false);
    }
  } else if (typeof error === 'string') {
    appError = new AppError(error);
  } else {
    appError = new AppError('An unexpected error occurred', 500, 'UNKNOWN_ERROR', false);
  }

  // Log error with context
  logError(appError, context);

  // Build response
  const response = buildErrorResponse(appError, context?.endpoint);

  return NextResponse.json(response, { status: appError.statusCode });
}

/**
 * Log error with context information
 */
function logError(
  error: AppError,
  context?: {
    endpoint?: string;
    method?: string;
    userId?: string;
    ip?: string;
    additionalContext?: Record<string, unknown>;
  }
): void {
  const metadata = {
    code: error.code,
    statusCode: error.statusCode,
    isOperational: error.isOperational,
    endpoint: context?.endpoint,
    method: context?.method,
    userId: context?.userId,
    ip: context?.ip,
    errorContext: error.context,
    additionalContext: context?.additionalContext,
  };

  if (error.statusCode >= 500) {
    // Critical errors
    logger.error(error.message, error, {
      context: 'ERROR_HANDLER',
      metadata,
    });
  } else if (error.statusCode >= 400) {
    // Client errors
    logger.warn(error.message, {
      context: 'ERROR_HANDLER',
      metadata,
    });
  } else {
    logger.info(`Error: ${error.message}`, {
      context: 'ERROR_HANDLER',
      metadata,
    });
  }
}

/**
 * Build error response (never leak sensitive data)
 */
function buildErrorResponse(
  error: AppError,
  endpoint?: string
): Record<string, any> {
  const isDevelopment = process.env.NODE_ENV === 'development';

  const response: Record<string, any> = {
    error: {
      code: error.code,
      message: error.message,
      statusCode: error.statusCode,
    },
  };

  // Add timestamp for debugging
  response.timestamp = new Date().toISOString();

  // Add request ID if available (for correlation)
  if (endpoint) {
    response.endpoint = endpoint;
  }

  // Add details only in development
  if (isDevelopment) {
    response.error.stack = error.stack;
    response.error.context = error.context;
  }

  // Add retry information for rate limit errors
  if (error instanceof RateLimitError) {
    response.retryAfter = error.retryAfter;
  }

  return response;
}

/**
 * Async error wrapper for route handlers
 * Usage: await catchAsync(async () => { ... })
 */
export function catchAsync(fn: () => Promise<any>) {
  return async (...args: any[]) => {
    try {
      return await fn();
    } catch (error) {
      throw error; // Will be caught by route error boundary
    }
  };
}

/**
 * Type-safe error checking
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

export function isValidationError(error: unknown): error is ValidationError {
  return error instanceof ValidationError;
}

export function isAuthenticationError(error: unknown): error is AuthenticationError {
  return error instanceof AuthenticationError;
}

export function isAuthorizationError(error: unknown): error is AuthorizationError {
  return error instanceof AuthorizationError;
}

export function isNotFoundError(error: unknown): error is NotFoundError {
  return error instanceof NotFoundError;
}

export function isRateLimitError(error: unknown): error is RateLimitError {
  return error instanceof RateLimitError;
}

export function isDatabaseError(error: unknown): error is DatabaseError {
  return error instanceof DatabaseError;
}

export default {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  DatabaseError,
  ExternalServiceError,
  handleError,
  isAppError,
  isValidationError,
  isAuthenticationError,
  isAuthorizationError,
  isNotFoundError,
  isRateLimitError,
  isDatabaseError,
};
