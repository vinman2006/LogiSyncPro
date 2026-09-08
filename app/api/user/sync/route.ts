import { NextRequest, NextResponse } from 'next/server';
import { syncUser, getUserNode } from '@/lib/db/repo';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { firebaseUid, email, displayName } = body;

    if (!firebaseUid || !email) {
      return NextResponse.json(
        { success: false, error: 'Missing firebaseUid or email' },
        { status: 400 }
      );
    }

    const user = await syncUser(firebaseUid, email, displayName);
    const node = await getUserNode(firebaseUid);

    return NextResponse.json({
      success: true,
      user,
      node,
      needsOnboarding: !node,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to sync user' },
      { status: 500 }
    );
  }
}
