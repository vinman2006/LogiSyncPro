import { NextResponse } from 'next/server';
import { initializeNeonDatabase } from '@/lib/db/neon';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const result = await initializeNeonDatabase();
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to initialize database' },
      { status: 500 }
    );
  }
}
