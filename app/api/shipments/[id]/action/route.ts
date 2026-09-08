import { NextRequest, NextResponse } from 'next/server';
import {
  getShipmentById,
  transitionShipmentStatus,
  verifyShipmentQuantity,
} from '@/lib/db/repo';

export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { action, actorId, receivedQuantity, location, metadata } = body;

    const shipment = await getShipmentById(params.id);
    if (!shipment) {
      return NextResponse.json(
        { success: false, error: `Shipment ${params.id} not found` },
        { status: 404 }
      );
    }

    let updatedShipment;

    switch (action) {
      case 'accept':
        if (shipment.status !== 'REQUESTED') {
          return NextResponse.json(
            { success: false, error: `Cannot accept shipment with status ${shipment.status}` },
            { status: 400 }
          );
        }
        updatedShipment = await transitionShipmentStatus({
          shipmentId: shipment.id,
          nextStatus: 'ACCEPTED',
          eventType: 'COLLECTOR_ACCEPTED',
          actorId,
          location: shipment.destination,
          metadata: { ...metadata, note: 'Shipment accepted by collector node' },
        });
        break;

      case 'reject':
        updatedShipment = await transitionShipmentStatus({
          shipmentId: shipment.id,
          nextStatus: 'REJECTED',
          eventType: 'COLLECTOR_REJECTED',
          actorId,
          location: shipment.destination,
          metadata,
        });
        break;

      case 'in_transit':
        if (shipment.status !== 'ACCEPTED') {
          return NextResponse.json(
            { success: false, error: `Cannot dispatch shipment with status ${shipment.status}` },
            { status: 400 }
          );
        }
        updatedShipment = await transitionShipmentStatus({
          shipmentId: shipment.id,
          nextStatus: 'IN_TRANSIT',
          eventType: 'SHIPMENT_IN_TRANSIT',
          actorId,
          location: shipment.origin,
          metadata: { ...metadata, carrier: 'Pune Fresh Logistics Express Fleet #MH-12-LS-4421' },
        });
        break;

      case 'mark_arrived':
        if (shipment.status !== 'IN_TRANSIT') {
          return NextResponse.json(
            { success: false, error: `Cannot mark arrived for shipment with status ${shipment.status}` },
            { status: 400 }
          );
        }
        updatedShipment = await transitionShipmentStatus({
          shipmentId: shipment.id,
          nextStatus: 'ARRIVED',
          eventType: 'SHIPMENT_ARRIVED',
          actorId,
          location: shipment.destination,
          metadata: { ...metadata, note: 'Truck reached Market Yard destination' },
        });
        break;

      case 'verify_quantity':
        if (shipment.status !== 'ARRIVED') {
          return NextResponse.json(
            { success: false, error: `Cannot verify quantity when shipment is in status ${shipment.status}` },
            { status: 400 }
          );
        }
        const qty = Number(receivedQuantity);
        if (isNaN(qty) || qty <= 0) {
          return NextResponse.json(
            { success: false, error: 'Invalid received quantity' },
            { status: 400 }
          );
        }
        updatedShipment = await verifyShipmentQuantity({
          shipmentId: shipment.id,
          receivedQuantity: qty,
          actorId,
        });
        break;

      case 'complete':
        updatedShipment = await transitionShipmentStatus({
          shipmentId: shipment.id,
          nextStatus: 'COMPLETED',
          eventType: 'SHIPMENT_COMPLETED',
          actorId,
          location: shipment.destination,
          metadata,
        });
        break;

      default:
        return NextResponse.json(
          { success: false, error: `Unrecognized action: ${action}` },
          { status: 400 }
        );
    }

    return NextResponse.json({ success: true, shipment: updatedShipment });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
