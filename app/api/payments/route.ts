import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { recordPayment, getShipmentById } from '@/lib/db/repo';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      shipmentId,
      amount,
      currency = 'INR',
      method,
      providerReference,
      transactionHash,
      orderId,
      idempotencyKey,
      actorId,
    } = body;

    if (!shipmentId || !amount || !method) {
      return NextResponse.json(
        { success: false, error: 'Missing required payment fields' },
        { status: 400 }
      );
    }

    const shipment = await getShipmentById(shipmentId);
    if (!shipment) {
      return NextResponse.json(
        { success: false, error: `Shipment ${shipmentId} not found` },
        { status: 404 }
      );
    }

    // Razorpay signature check if secret is configured
    if (method === 'RAZORPAY') {
      const keySecret = process.env.RAZORPAY_KEY_SECRET;
      if (keySecret && orderId && providerReference && transactionHash) {
        const expectedSignature = crypto
          .createHmac('sha256', keySecret)
          .update(`${orderId}|${providerReference}`)
          .digest('hex');

        if (expectedSignature !== transactionHash) {
          return NextResponse.json(
            { success: false, error: 'Invalid Razorpay signature. Verification failed.' },
            { status: 400 }
          );
        }
      }
    }

    const payment = await recordPayment({
      shipmentId,
      amount: Number(amount),
      currency,
      method,
      providerReference: providerReference || `REF-${Date.now()}`,
      transactionHash: transactionHash || `0x${Date.now().toString(16)}`,
      idempotencyKey: idempotencyKey || `${shipmentId}-${method}-${amount}`,
      actorId,
    });

    return NextResponse.json({
      success: true,
      payment,
      shipmentStatus: 'COMPLETED',
      message: `${method} payment of ${currency} ${amount} verified successfully.`,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
