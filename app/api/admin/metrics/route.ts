import { NextRequest, NextResponse } from 'next/server';
import logger from '@/lib/logger';
import performanceMonitor from '@/lib/performanceMonitor';

/**
 * GET /api/admin/metrics
 * Get performance metrics (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const operation = searchParams.get('operation') || undefined;
    const format = (searchParams.get('format') as 'json' | 'csv') || 'json';

    if (format === 'csv') {
      const csv = performanceMonitor.exportMetrics('csv');
      return new NextResponse(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="metrics.csv"',
        },
      });
    }

    // Get statistics
    const stats = operation
      ? performanceMonitor.getStats(operation)
      : performanceMonitor.getStats('all');

    // Get recent metrics
    const recentMetrics = performanceMonitor.getMetrics(50);

    // Get system health
    const health = performanceMonitor.getSystemHealth();

    return NextResponse.json(
      {
        timestamp: new Date().toISOString(),
        health,
        stats,
        recentMetrics: recentMetrics.map((m) => ({
          operation: m.operation,
          duration: m.duration,
          slow: m.slow,
          timestamp: m.timestamp,
        })),
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error('Failed to retrieve metrics', error as Error, {
      context: 'API',
      metadata: { endpoint: '/api/admin/metrics' },
    });

    return NextResponse.json(
      { error: 'Failed to retrieve metrics' },
      { status: 500 }
    );
  }
}
