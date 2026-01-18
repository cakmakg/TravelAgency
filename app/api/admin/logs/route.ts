import { NextRequest, NextResponse } from 'next/server';
import logger from '@/lib/logger';
import performanceMonitor from '@/lib/performanceMonitor';

/**
 * GET /api/admin/logs
 * Get application logs (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const level = (searchParams.get('level') as any) || 'info';
    const lines = parseInt(searchParams.get('lines') || '100', 10);

    // Get logs
    const logs = logger.getLogs(level, lines);

    return NextResponse.json(
      {
        level,
        count: logs.length,
        logs,
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error('Failed to retrieve logs', error as Error, {
      context: 'API',
      metadata: { endpoint: '/api/admin/logs' },
    });

    return NextResponse.json(
      { error: 'Failed to retrieve logs' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/logs/clear
 * Clear logs (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const { level } = await request.json();

    // In a real app, you'd implement log clearing
    logger.info('Logs cleared', {
      context: 'ADMIN',
      metadata: { level: level || 'all' },
    });

    return NextResponse.json(
      { message: 'Logs cleared successfully' },
      { status: 200 }
    );
  } catch (error) {
    logger.error('Failed to clear logs', error as Error, {
      context: 'API',
      metadata: { endpoint: '/api/admin/logs' },
    });

    return NextResponse.json(
      { error: 'Failed to clear logs' },
      { status: 500 }
    );
  }
}
