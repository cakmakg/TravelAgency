/**
 * Edge-compatible Logger Utility
 * 
 * Simplified logger for Edge Runtime (middleware) where
 * file system access (fs) is not available.
 * Defaults to console output.
 */

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

class EdgeLogger {
    private shouldLog(level: LogLevel): boolean {
        const levels: LogLevel[] = ['debug', 'info', 'warn', 'error', 'fatal'];
        const currentLevel = process.env.NODE_ENV === 'production' ? 'info' : 'debug';
        return levels.indexOf(level) >= levels.indexOf(currentLevel);
    }

    private log(level: LogLevel, message: string, metadata?: Partial<LogEntry>): void {
        if (!this.shouldLog(level)) return;

        // In production edge/serverless, console.log is usually captured by the platform's logging system
        const entry = {
            timestamp: new Date().toISOString(),
            level,
            message,
            ...metadata,
        };

        console.log(JSON.stringify(entry));
    }

    public debug(message: string, metadata?: Partial<LogEntry>): void {
        this.log('debug', message, metadata);
    }

    public info(message: string, metadata?: Partial<LogEntry>): void {
        this.log('info', message, metadata);
    }

    public warn(message: string, metadata?: Partial<LogEntry>): void {
        this.log('warn', message, metadata);
    }

    public error(message: string, error?: Error | string, metadata?: Partial<LogEntry>): void {
        this.log('error', message, {
            ...metadata,
            error: error instanceof Error ? { message: error.message, stack: error.stack } : { message: String(error) }
        });
    }

    public logRequest(method: string, url: string, ip: string, metadata?: { userAgent?: string; userId?: string }): void {
        this.info('Incoming request', {
            context: 'HTTP',
            request: { method, url, ip, userAgent: metadata?.userAgent, userId: metadata?.userId }
        });
    }

    public logResponse(method: string, url: string, statusCode: number, duration: number, metadata?: { ip?: string }): void {
        this.info('Request completed', {
            context: 'HTTP',
            request: { method, url, ip: metadata?.ip || 'unknown' },
            response: { statusCode, duration }
        });
    }
}

const logger = new EdgeLogger();
export default logger;
