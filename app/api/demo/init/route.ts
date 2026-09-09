import { NextRequest, NextResponse } from 'next/server';
import { initializeOrangeDemo } from '@/lib/db/repo';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { firebaseUid } = body;

    if (!firebaseUid) {
      return NextResponse.json(
        { success: false, error: 'Missing firebaseUid' },
        { status: 400 }
      );
    }

    const result = await initializeOrangeDemo({ firebaseUid });
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to initialize demo' },
      { status: 500 }
    );
  }
}
