import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { shipmentId, amount, currency = 'INR' } = body;

    const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_placeholder';
    const keySecret = process.env.RAZORPAY_KEY_SECRET || '';

    const amountInPaise = Math.round(Number(amount) * 100);
    const receipt = `rcpt_${shipmentId.slice(-6)}_${Date.now().toString().slice(-4)}`;

    // If live/test Razorpay API credentials exist, create order via Razorpay API
    if (keyId !== 'rzp_test_placeholder' && keySecret) {
      const basicAuth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
      const rzpRes = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          Authorization: `Basic ${basicAuth}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amountInPaise,
          currency,
          receipt,
          notes: {
            shipmentId,
            platform: 'LogiSync Pro',
          },
        }),
      });

      const orderData = await rzpRes.json();
      if (!rzpRes.ok) {
        return NextResponse.json(
          { success: false, error: orderData.error?.description || 'Razorpay order creation failed' },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        keyId,
        order: orderData,
      });
    }

    // Resilient simulated test order for demo environments
    const mockOrder = {
      id: `order_test_${Date.now().toString(36)}`,
      entity: 'order',
      amount: amountInPaise,
      amount_paid: 0,
      amount_due: amountInPaise,
      currency,
      receipt,
      status: 'created',
      attempts: 0,
      created_at: Math.floor(Date.now() / 1000),
    };

    return NextResponse.json({
      success: true,
      keyId,
      order: mockOrder,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
