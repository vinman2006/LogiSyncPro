import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, isNeonConfigured, getFallbackStore } from '@/lib/db/neon';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (isNeonConfigured) {
      let query = `SELECT * FROM notifications`;
      const params: any[] = [];
      if (userId) {
        query += ` WHERE user_id::text = $1 OR user_id IS NULL`;
        params.push(userId);
      }
      query += ` ORDER BY created_at DESC LIMIT 20`;
      const rows = await executeQuery(query, params);
      return NextResponse.json({ success: true, notifications: rows });
    }

    const store = getFallbackStore();
    return NextResponse.json({
      success: true,
      notifications: store.notifications.slice(0, 20),
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, readAll } = body;

    if (isNeonConfigured) {
      if (readAll) {
        await executeQuery(`UPDATE notifications SET read = TRUE`);
      } else if (id) {
        await executeQuery(`UPDATE notifications SET read = TRUE WHERE id::text = $1`, [id]);
      }
      return NextResponse.json({ success: true });
    }

    const store = getFallbackStore();
    if (readAll) {
      store.notifications.forEach((n) => (n.read = true));
    } else if (id) {
      const target = store.notifications.find((n) => n.id === id);
      if (target) target.read = true;
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
