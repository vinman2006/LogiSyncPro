import { NextRequest, NextResponse } from 'next/server';
import { completeOnboarding } from '@/lib/db/repo';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      firebaseUid,
      email,
      displayName,
      country,
      countryCode,
      region,
      regionCode,
      role,
      businessName,
      city,
      phone,
    } = body;

    if (!firebaseUid || !country || !role || !businessName) {
      return NextResponse.json(
        { success: false, error: 'Country, Role, and Business Name are required' },
        { status: 400 }
      );
    }

    const result = await completeOnboarding({
      firebaseUid,
      email: email || 'user@logisync.com',
      displayName,
      country,
      countryCode: countryCode || 'IN',
      region: region || city || 'Maharashtra',
      regionCode: regionCode || 'MH',
      role,
      businessName,
      city: city || region || 'Pune',
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
