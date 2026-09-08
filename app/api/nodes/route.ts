import { NextRequest, NextResponse } from 'next/server';
import { listAllNodes, getUserNode } from '@/lib/db/repo';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const firebaseUid = searchParams.get('firebaseUid');

    if (firebaseUid) {
      const node = await getUserNode(firebaseUid);
      return NextResponse.json({ success: true, node });
    }

    const nodes = await listAllNodes();
    return NextResponse.json({ success: true, nodes });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
