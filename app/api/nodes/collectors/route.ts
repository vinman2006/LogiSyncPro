import { NextRequest, NextResponse } from 'next/server';
import { listCollectors } from '@/lib/db/repo';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const city = searchParams.get('city') || undefined;

    const collectors = await listCollectors(city);
    return NextResponse.json({ success: true, collectors });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
