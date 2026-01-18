/**
 * Centralized Logger Utility
 * 
 * Multi-level logging system with:
 * - Console output (development)
 * - File output (production)
 * - Log rotation and cleanup
 * - Structured logging (JSON format)
 * - Performance tracking
 * - Error tracking with stack traces
 */

import fs from 'fs';
import path from 'path';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: string;
  metadata?: Record<string, unknown>;
  error?: {
    message: string;
    stack?: string;
    code?: string;
  };
  performance?: {
    duration: number; // milliseconds
    memory?: number; // MB
    query?: string;
  };
  request?: {
    method: string;
    url: string;
    ip: string;
    userId?: string;
    userAgent?: string;
  };
  response?: {
    statusCode: number;
    duration: number;
  };
}

export interface LoggerConfig {
  level: LogLevel;
  directory: string;
  maxFileSize: number; // bytes
  maxBackupFiles: number;
  enableConsole: boolean;
  enableFile: boolean;
  prettyPrint: boolean; // Pretty print JSON
}

const DEFAULT_CONFIG: LoggerConfig = {
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  directory: path.join(process.cwd(), 'logs'),
  maxFileSize: 10 * 1024 * 1024, // 10MB
  maxBackupFiles: 30,
  enableConsole: true,
  enableFile: process.env.NODE_ENV === 'production',
  prettyPrint: process.env.NODE_ENV !== 'production',
};

class Logger {
  private config: LoggerConfig;
  private logFiles: Map<LogLevel, string> = new Map();
  private currentDate: string = this.formatDate(new Date());
  private levelOrder: LogLevel[] = ['debug', 'info', 'warn', 'error', 'fatal'];

  constructor(config?: Partial<LoggerConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.initializeLogDirectory();
    this.initializeLogFiles();

    // Clean logs daily
    this.scheduleCleanup();
  }

  /**
   * Format date as YYYY-MM-DD
   */
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Format timestamp as YYYY-MM-DD HH:mm:ss.SSS
   */
  private formatTimestamp(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const ms = String(date.getMilliseconds()).padStart(3, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${ms}`;
  }

  /**
   * Initialize logs directory
   */
  private initializeLogDirectory(): void {
    if (!fs.existsSync(this.config.directory)) {
      fs.mkdirSync(this.config.directory, { recursive: true });
    }
  }

  /**
   * Initialize log file paths for each level
   */
  private initializeLogFiles(): void {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error', 'fatal'];

    levels.forEach((level) => {
      const fileName = `${level}-${this.currentDate}.log`;
      const filePath = path.join(this.config.directory, fileName);
      this.logFiles.set(level, filePath);
    });

    // Common log file (all levels combined)
    const allLogPath = path.join(this.config.directory, `all-${this.currentDate}.log`);
    this.logFiles.set('info', allLogPath);
  }

  /**
   * Check if message should be logged based on level
   */
  private shouldLog(level: LogLevel): boolean {
    return this.levelOrder.indexOf(level) >= this.levelOrder.indexOf(this.config.level);
  }

  /**
   * Format log entry as JSON or string
   */
  private formatLogEntry(entry: LogEntry): string {
    if (this.config.prettyPrint) {
      return JSON.stringify(entry, null, 2);
    }
    return JSON.stringify(entry);
  }

  /**
   * Write to console with colors
   */
  private writeToConsole(entry: LogEntry): void {
    if (!this.config.enableConsole) return;

    const colors = {
      debug: '\x1b[36m', // cyan
      info: '\x1b[32m', // green
      warn: '\x1b[33m', // yellow
      error: '\x1b[31m', // red
      fatal: '\x1b[35m', // magenta
      reset: '\x1b[0m',
    };

    const color = colors[entry.level];
    const prefix = `${color}[${entry.timestamp}] ${entry.level.toUpperCase()}${colors.reset}`;

    let message = `${prefix} ${entry.message}`;

    if (entry.context) {
      message += ` [${entry.context}]`;
    }

    if (entry.metadata && Object.keys(entry.metadata).length > 0) {
      message += ` ${JSON.stringify(entry.metadata)}`;
    }

    if (entry.error) {
      message += `\n  Error: ${entry.error.message}`;
      if (entry.error.code) {
        message += ` (${entry.error.code})`;
      }
      if (entry.error.stack && process.env.NODE_ENV !== 'production') {
        message += `\n  Stack: ${entry.error.stack}`;
      }
    }

    if (entry.request) {
      message += `\n  Request: ${entry.request.method} ${entry.request.url} (IP: ${entry.request.ip})`;
    }

    if (entry.response) {
      message += `\n  Response: ${entry.response.statusCode} (${entry.response.duration}ms)`;
    }

    if (entry.performance) {
      message += `\n  Performance: ${entry.performance.duration}ms`;
      if (entry.performance.memory) {
        message += ` | Memory: ${entry.performance.memory}MB`;
      }
    }

    console.log(message);
  }

  /**
   * Write to file
   */
  private writeToFile(entry: LogEntry, level: LogLevel): void {
    if (!this.config.enableFile) return;

    try {
      const filePath = this.logFiles.get(level);
      const allLogsPath = this.logFiles.get('info');

      if (!filePath) return;

      // Check file size and rotate if needed
      this.checkAndRotateFile(filePath);

      // Write to level-specific file
      const logLine = this.formatLogEntry(entry) + '\n';
      fs.appendFileSync(filePath, logLine, 'utf8');

      // Write to all-logs file (if different)
      if (allLogsPath && allLogsPath !== filePath) {
        fs.appendFileSync(allLogsPath, logLine, 'utf8');
      }
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }

  /**
   * Check file size and rotate if necessary
   */
  private checkAndRotateFile(filePath: string): void {
    try {
      if (!fs.existsSync(filePath)) return;

      const stats = fs.statSync(filePath);

      if (stats.size > this.config.maxFileSize) {
        const ext = path.extname(filePath);
        const base = path.basename(filePath, ext);
        const dir = path.dirname(filePath);
        
        // Format timestamp for rotated file: yyyy-MM-dd-HHmmss
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        const timestamp = `${year}-${month}-${day}-${hours}${minutes}${seconds}`;
        
        const rotatedPath = path.join(dir, `${base}-${timestamp}${ext}`);

        fs.renameSync(filePath, rotatedPath);
      }
    } catch (error) {
      console.error('Failed to rotate log file:', error);
    }
  }

  /**
   * Schedule daily cleanup of old logs
   */
  private scheduleCleanup(): void {
    // Run cleanup at 1 AM
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(1, 0, 0, 0);

    const timeUntilCleanup = tomorrow.getTime() - now.getTime();

    setTimeout(() => {
      this.cleanupOldLogs();
      // Run cleanup daily after first execution
      setInterval(() => this.cleanupOldLogs(), 24 * 60 * 60 * 1000);
    }, timeUntilCleanup);
  }

  /**
   * Clean up old log files based on retention policy
   */
  private cleanupOldLogs(): void {
    try {
      const files = fs.readdirSync(this.config.directory);
      const now = Date.now();

      for (const file of files) {
        const filePath = path.join(this.config.directory, file);
        const stat = fs.statSync(filePath);

        // Delete files older than max backup days
        const ageInDays = (now - stat.mtime.getTime()) / (1000 * 60 * 60 * 24);

        if (ageInDays > this.config.maxBackupFiles) {
          fs.unlinkSync(filePath);
        }
      }

      // Update log file paths for new day
      const newDate = this.formatDate(new Date());
      if (newDate !== this.currentDate) {
        this.currentDate = newDate;
        this.initializeLogFiles();
      }
    } catch (error) {
      console.error('Failed to cleanup logs:', error);
    }
  }

  /**
   * Create log entry and output
   */
  private log(level: LogLevel, message: string, metadata?: Partial<LogEntry>): void {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      timestamp: this.formatTimestamp(new Date()),
      level,
      message,
      ...metadata,
    };

    this.writeToConsole(entry);
    this.writeToFile(entry, level);
  }

  /**
   * Log level: DEBUG (detailed information for debugging)
   */
  public debug(message: string, metadata?: Partial<LogEntry>): void {
    this.log('debug', message, metadata);
  }

  /**
   * Log level: INFO (general informational messages)
   */
  public info(message: string, metadata?: Partial<LogEntry>): void {
    this.log('info', message, metadata);
  }

  /**
   * Log level: WARN (warning messages for potentially harmful situations)
   */
  public warn(message: string, metadata?: Partial<LogEntry>): void {
    this.log('warn', message, metadata);
  }

  /**
   * Log level: ERROR (error messages for error events)
   */
  public error(message: string, error?: Error | string, metadata?: Partial<LogEntry>): void {
    let errorData: LogEntry['error'] | undefined;

    if (error) {
      if (error instanceof Error) {
        errorData = {
          message: error.message,
          stack: error.stack,
          code: (error as any).code,
        };
      } else {
        errorData = { message: error.toString() };
      }
    }

    this.log('error', message, { ...metadata, error: errorData });
  }

  /**
   * Log level: FATAL (critical error messages)
   */
  public fatal(message: string, error?: Error | string, metadata?: Partial<LogEntry>): void {
    let errorData: LogEntry['error'] | undefined;

    if (error) {
      if (error instanceof Error) {
        errorData = {
          message: error.message,
          stack: error.stack,
          code: (error as any).code,
        };
      } else {
        errorData = { message: error.toString() };
      }
    }

    this.log('fatal', message, { ...metadata, error: errorData });
  }

  /**
   * Log HTTP request
   */
  public logRequest(
    method: string,
    url: string,
    ip: string,
    metadata?: {
      userId?: string;
      userAgent?: string;
      queryParams?: Record<string, unknown>;
    }
  ): void {
    this.info('Incoming request', {
      context: 'HTTP',
      request: {
        method,
        url,
        ip,
        userId: metadata?.userId,
        userAgent: metadata?.userAgent,
      },
      metadata: metadata?.queryParams ? { params: metadata.queryParams } : undefined,
    });
  }

  /**
   * Log HTTP response
   */
  public logResponse(
    method: string,
    url: string,
    statusCode: number,
    duration: number,
    metadata?: {
      size?: number;
      ip?: string;
    }
  ): void {
    const level = statusCode >= 400 ? 'warn' : 'info';

    this.log(level, 'Request completed', {
      context: 'HTTP',
      request: {
        method,
        url,
        ip: metadata?.ip || 'unknown',
      },
      response: {
        statusCode,
        duration,
      },
      metadata: metadata?.size ? { responseSize: metadata.size } : undefined,
    });
  }

  /**
   * Log database operation
   */
  public logDatabase(
    operation: string,
    collection: string,
    duration: number,
    metadata?: {
      query?: string;
      documentCount?: number;
      error?: Error;
    }
  ): void {
    const level = metadata?.error ? 'error' : 'debug';

    this.log(level, `Database ${operation} on ${collection}`, {
      context: 'DATABASE',
      performance: {
        duration,
        query: metadata?.query,
      },
      metadata: metadata?.documentCount ? { docs: metadata.documentCount } : undefined,
      error: metadata?.error ? {
        message: metadata.error.message,
        stack: metadata.error.stack,
      } : undefined,
    });
  }

  /**
   * Log admin action
   */
  public logAdminAction(
    action: string,
    resource: string,
    userId: string,
    metadata?: {
      before?: Record<string, unknown>;
      after?: Record<string, unknown>;
      changes?: Record<string, unknown>;
      result?: 'success' | 'failure';
    }
  ): void {
    this.info(`Admin action: ${action} on ${resource}`, {
      context: 'ADMIN',
      request: {
        method: 'ADMIN',
        url: resource,
        ip: 'internal',
        userId,
      },
      metadata: {
        action,
        ...metadata,
      },
    });
  }

  /**
   * Log security event
   */
  public logSecurityEvent(
    event: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    metadata?: {
      ip?: string;
      userId?: string;
      reason?: string;
      blocked?: boolean;
    }
  ): void {
    const level = severity === 'critical' ? 'fatal' : severity === 'high' ? 'error' : 'warn';

    this.log(level, `Security event: ${event}`, {
      context: 'SECURITY',
      metadata: {
        severity,
        ...metadata,
      },
    });
  }

  /**
   * Log performance metric
   */
  public logPerformance(
    operation: string,
    duration: number,
    metadata?: {
      memory?: number;
      threshold?: number;
      slow?: boolean;
    }
  ): void {
    const isSlow = metadata?.threshold && duration > metadata.threshold;
    const level = isSlow ? 'warn' : 'debug';

    this.log(level, `Performance: ${operation}`, {
      context: 'PERFORMANCE',
      performance: {
        duration,
        memory: metadata?.memory,
      },
      metadata: {
        slow: isSlow,
        threshold: metadata?.threshold,
      },
    });
  }

  /**
   * Get logs from file
   */
  public getLogs(level: LogLevel, lines: number = 100): string[] {
    try {
      const filePath = this.logFiles.get(level);
      if (!filePath || !fs.existsSync(filePath)) {
        return [];
      }

      const content = fs.readFileSync(filePath, 'utf8');
      return content.split('\n').filter(Boolean).slice(-lines);
    } catch (error) {
      console.error('Failed to read logs:', error);
      return [];
    }
  }

  /**
   * Get log summary (statistics)
   */
  public getLogSummary(): Record<string, any> {
    try {
      // Format date as yyyy-MM-dd
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      const summary = {
        directory: this.config.directory,
        date: dateStr,
        levels: {} as Record<LogLevel, { count: number; size: number }>,
      };

      const levels: LogLevel[] = ['debug', 'info', 'warn', 'error', 'fatal'];

      levels.forEach((level) => {
        const filePath = this.logFiles.get(level);
        if (filePath && fs.existsSync(filePath)) {
          const stat = fs.statSync(filePath);
          const content = fs.readFileSync(filePath, 'utf8');
          const lineCount = content.split('\n').filter(Boolean).length;

          summary.levels[level] = {
            count: lineCount,
            size: stat.size,
          };
        }
      });

      return summary;
    } catch (error) {
      console.error('Failed to get log summary:', error);
      return { error: 'Failed to read logs' };
    }
  }
}

// Create singleton instance
const logger = new Logger();

export default logger;
export { Logger };
