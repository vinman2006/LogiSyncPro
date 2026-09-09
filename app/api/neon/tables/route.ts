import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, isNeonConfigured } from '@/lib/db/neon';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const table = searchParams.get('table') || 'users';

    // Allowed tables for safe demo exploration
    const ALLOWED_TABLES = [
      'users',
      'user_profiles',
      'businesses',
      'nodes',
      'shipments',
      'shipment_events',
      'payments',
      'audit_logs',
      'notifications',
    ];

    if (!ALLOWED_TABLES.includes(table)) {
      return NextResponse.json(
        { success: false, error: 'Invalid table requested' },
        { status: 400 }
      );
    }

    if (!isNeonConfigured) {
      return NextResponse.json({
        success: true,
        isNeon: false,
        table,
        rows: [],
        counts: {},
        message: 'Neon database is not configured in this environment.',
      });
    }

    // Query rows for the requested table (up to 50 most recent rows)
    const rows = await executeQuery(
      `SELECT * FROM "${table}" ORDER BY created_at DESC LIMIT 50`
    );

    // Get table counts for summary cards
    const counts: Record<string, number> = {};
    for (const t of ['users', 'businesses', 'nodes', 'shipments', 'payments']) {
      const res = await executeQuery<{ count: string }>(`SELECT count(*) FROM "${t}"`);
      counts[t] = Number(res[0]?.count || 0);
    }

    return NextResponse.json({
      success: true,
      isNeon: true,
      table,
      rows,
      counts,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to query Neon tables' },
      { status: 500 }
    );
  }
}
