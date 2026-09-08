import { NextRequest, NextResponse } from 'next/server';
import { completeOnboarding } from '@/lib/db/repo';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      firebaseUid,
      email,
      country,
      countryCode,
      role,
      businessName,
      city,
      phone,
    } = body;

    if (!firebaseUid || !country || !role || !businessName || !city) {
      return NextResponse.json(
        { success: false, error: 'All fields (country, role, businessName, city) are required' },
        { status: 400 }
      );
    }

    const result = await completeOnboarding({
      firebaseUid,
      email: email || 'user@logisync.com',
      country,
      countryCode: countryCode || 'IN',
      role,
      businessName,
      city,
      phone,
    });

    return NextResponse.json({
      success: true,
      user: result.user,
      node: result.node,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Onboarding failed' },
      { status: 500 }
    );
  }
}
