/**
 * Performance Monitoring Utility
 * 
 * Track and analyze:
 * - API response times
 * - Database query performance
 * - Memory usage
 * - Slow operations
 * - Performance anomalies
 */

import logger from './logger';
import os from 'os';

export interface PerformanceMetric {
  operation: string;
  duration: number;
  memory?: {
    heapUsed: number;
    heapTotal: number;
    external: number;
    rss: number;
    delta?: number; // Memory delta in MB
  };
  timestamp: Date;
  slow?: boolean;
  threshold?: number;
}

export interface PerformanceThresholds {
  api: number; // ms
  database: number; // ms
  critical: number; // ms
}

const DEFAULT_THRESHOLDS: PerformanceThresholds = {
  api: 500, // API responses should complete in < 500ms
  database: 200, // Database queries should complete in < 200ms
  critical: 1000, // Critical threshold for warnings
};

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private thresholds: PerformanceThresholds;
  private maxMetrics: number = 1000;

  constructor(thresholds?: Partial<PerformanceThresholds>) {
    this.thresholds = { ...DEFAULT_THRESHOLDS, ...thresholds };
  }

  /**
   * Get current memory usage
   */
  private getMemoryUsage() {
    const memUsage = process.memoryUsage();
    return {
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
      external: Math.round(memUsage.external / 1024 / 1024),
      rss: Math.round(memUsage.rss / 1024 / 1024),
    };
  }

  /**
   * Get CPU usage
   */
  public getCPUUsage() {
    const cpus = os.cpus();
    const avgLoad = os.loadavg();

    return {
      count: cpus.length,
      model: cpus[0]?.model || 'unknown',
      speed: cpus[0]?.speed || 0,
      loadAverage: {
        oneMin: avgLoad[0],
        fiveMin: avgLoad[1],
        fifteenMin: avgLoad[2],
      },
    };
  }

  /**
   * Measure operation performance
   */
  public measureAsync<T>(
    operation: string,
    fn: () => Promise<T>,
    type: 'api' | 'database' | 'critical' = 'api'
  ): Promise<T> {
    const startTime = Date.now();
    const startMemory = process.memoryUsage().heapUsed;

    return fn()
      .then((result) => {
        const duration = Date.now() - startTime;
        const memoryDelta = process.memoryUsage().heapUsed - startMemory;

        this.recordMetric(operation, duration, type, memoryDelta);
        return result;
      })
      .catch((error) => {
        const duration = Date.now() - startTime;
        logger.error(`Performance: ${operation} failed`, error, {
          context: 'PERFORMANCE',
          metadata: { duration },
        });
        throw error;
      });
  }

  /**
   * Measure synchronous operation
   */
  public measureSync<T>(
    operation: string,
    fn: () => T,
    type: 'api' | 'database' | 'critical' = 'api'
  ): T {
    const startTime = Date.now();
    const startMemory = process.memoryUsage().heapUsed;

    try {
      const result = fn();
      const duration = Date.now() - startTime;
      const memoryDelta = process.memoryUsage().heapUsed - startMemory;

      this.recordMetric(operation, duration, type, memoryDelta);
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error(`Performance: ${operation} failed`, error as Error, {
        context: 'PERFORMANCE',
        metadata: { duration },
      });
      throw error;
    }
  }

  /**
   * Record performance metric
   */
  private recordMetric(
    operation: string,
    duration: number,
    type: 'api' | 'database' | 'critical',
    memoryDelta?: number
  ): void {
    const threshold = this.thresholds[type];
    const isSlow = duration > threshold;
    const isCritical = duration > this.thresholds.critical;

    const metric: PerformanceMetric = {
      operation,
      duration,
      memory: {
        ...this.getMemoryUsage(),
        delta: Math.round((memoryDelta || 0) / 1024 / 1024), // MB
      },
      timestamp: new Date(),
      slow: isSlow,
      threshold,
    };

    this.metrics.push(metric);

    // Keep memory usage under control
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }

    // Log slow operations
    if (isCritical) {
      logger.error(`Critical performance issue: ${operation}`, undefined, {
        context: 'PERFORMANCE',
        metadata: {
          duration,
          threshold,
          memory: metric.memory,
        },
      });
    } else if (isSlow) {
      logger.warn(`Slow operation: ${operation}`, {
        context: 'PERFORMANCE',
        metadata: {
          duration,
          threshold,
          memory: metric.memory,
        },
      });
    } else {
      logger.debug(`Performance: ${operation}`, {
        context: 'PERFORMANCE',
        metadata: {
          duration,
          threshold,
          memory: metric.memory,
        },
      });
    }
  }

  /**
   * Get performance statistics
   */
  public getStats(operation?: string) {
    let relevantMetrics = this.metrics;

    if (operation) {
      relevantMetrics = this.metrics.filter((m) => m.operation.includes(operation));
    }

    if (relevantMetrics.length === 0) {
      return null;
    }

    const durations = relevantMetrics.map((m) => m.duration);
    const sorted = [...durations].sort((a, b) => a - b);

    const stats = {
      operation: operation || 'all',
      count: relevantMetrics.length,
      avg: Math.round(durations.reduce((a, b) => a + b) / durations.length),
      min: Math.min(...durations),
      max: Math.max(...durations),
      p50: sorted[Math.floor(sorted.length * 0.5)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      p99: sorted[Math.floor(sorted.length * 0.99)],
      slowCount: relevantMetrics.filter((m) => m.slow).length,
      slowPercentage: (
        (relevantMetrics.filter((m) => m.slow).length / relevantMetrics.length) *
        100
      ).toFixed(1),
      memory: {
        avgHeapUsed: Math.round(
          relevantMetrics.reduce((a, m) => a + (m.memory?.heapUsed || 0), 0) /
            relevantMetrics.length
        ),
        maxHeapUsed: Math.max(...relevantMetrics.map((m) => m.memory?.heapUsed || 0)),
        avgDelta: Math.round(
          relevantMetrics.reduce((a, m) => a + (m.memory?.delta || 0), 0) /
            relevantMetrics.length
        ),
      },
    };

    return stats;
  }

  /**
   * Get all metrics
   */
  public getMetrics(limit: number = 100) {
    return this.metrics.slice(-limit);
  }

  /**
   * Get system health status
   */
  public getSystemHealth() {
    const memory = this.getMemoryUsage();
    const cpu = this.getCPUUsage();
    const recentMetrics = this.metrics.slice(-100);

    // Calculate health score (0-100)
    const heapUsagePercent = (memory.heapUsed / memory.heapTotal) * 100;
    const slowOpsPercent =
      recentMetrics.length > 0
        ? (recentMetrics.filter((m) => m.slow).length / recentMetrics.length) * 100
        : 0;

    const healthScore = Math.max(
      0,
      100 - Math.max(heapUsagePercent * 0.5, slowOpsPercent * 0.5)
    );

    return {
      healthy: healthScore > 70,
      score: Math.round(healthScore),
      memory: {
        ...memory,
        heapUsagePercent: Math.round(heapUsagePercent),
        available: memory.heapTotal - memory.heapUsed,
      },
      cpu,
      operations: {
        total: recentMetrics.length,
        slow: recentMetrics.filter((m) => m.slow).length,
        slowPercent: Math.round(slowOpsPercent),
      },
    };
  }

  /**
   * Clear old metrics
   */
  public clear(): void {
    this.metrics = [];
  }

  /**
   * Export metrics for analysis
   */
  public exportMetrics(format: 'json' | 'csv' = 'json') {
    if (format === 'csv') {
      const headers = [
        'timestamp',
        'operation',
        'duration_ms',
        'slow',
        'heap_used_mb',
        'heap_total_mb',
        'external_mb',
        'rss_mb',
      ].join(',');

      const rows = this.metrics
        .map(
          (m) =>
            [
              m.timestamp.toISOString(),
              m.operation,
              m.duration,
              m.slow ? 'yes' : 'no',
              m.memory?.heapUsed || 0,
              m.memory?.heapTotal || 0,
              m.memory?.external || 0,
              m.memory?.rss || 0,
            ].join(',')
        )
        .join('\n');

      return headers + '\n' + rows;
    }

    return JSON.stringify(this.metrics, null, 2);
  }
}

// Create singleton instance
const performanceMonitor = new PerformanceMonitor();

export default performanceMonitor;
export { PerformanceMonitor };
