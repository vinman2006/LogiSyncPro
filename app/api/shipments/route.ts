import { NextRequest, NextResponse } from 'next/server';
import { createShipment, listShipments } from '@/lib/db/repo';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const nodeId = searchParams.get('nodeId') || undefined;
    const status = searchParams.get('status') || undefined;

    const shipments = await listShipments({ nodeId, status });
    return NextResponse.json({ success: true, shipments });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      distributor_node_id,
      collector_node_id,
      farmer_node_id,
      commodity,
      expected_quantity,
      unit,
      origin,
      destination,
      value,
      currency,
      actor_id,
    } = body;

    if (!distributor_node_id || !collector_node_id || !commodity || !expected_quantity || !origin || !destination || !value) {
      return NextResponse.json(
        { success: false, error: 'Missing required shipment parameters' },
        { status: 400 }
      );
    }

    const shipment = await createShipment({
      distributor_node_id,
      collector_node_id,
      farmer_node_id,
      commodity,
      expected_quantity: Number(expected_quantity),
      unit: unit || 'kg',
      origin,
      destination,
      value: Number(value),
      currency: currency || 'INR',
      actor_id,
    });

    return NextResponse.json({ success: true, shipment }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
