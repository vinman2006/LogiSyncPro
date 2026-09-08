import { NextRequest, NextResponse } from 'next/server';
import { getShipmentById } from '@/lib/db/repo';
import { ORANGES_ROUTE_WAYPOINTS, getSimulatedTruckLocation } from '@/lib/services/location';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const shipment = await getShipmentById(params.id);
    if (!shipment) {
      return NextResponse.json({ success: false, error: 'Shipment not found' }, { status: 404 });
    }

    // Determine progress fraction based on shipment status
    let progress = 0;
    if (shipment.status === 'REQUESTED' || shipment.status === 'ACCEPTED') {
      progress = 0;
    } else if (shipment.status === 'IN_TRANSIT') {
      // Simulate active movement between 0.2 and 0.8 based on time or query parameter
      const { searchParams } = new URL(req.url);
      const stepParam = searchParams.get('step');
      if (stepParam) {
        progress = Math.max(0, Math.min(1, Number(stepParam)));
      } else {
        // Animate smoothly between Sinnar and Ahmednagar
        const elapsedSec = (Date.now() / 1000) % 60;
        progress = 0.2 + (elapsedSec / 60) * 0.6;
      }
    } else if (
      shipment.status === 'ARRIVED' ||
      shipment.status === 'RECEIVED' ||
      shipment.status === 'PAYMENT_PENDING' ||
      shipment.status === 'PAYMENT_VERIFIED' ||
      shipment.status === 'COMPLETED'
    ) {
      progress = 1.0;
    }

    const liveCoords = getSimulatedTruckLocation(progress);

    return NextResponse.json({
      success: true,
      shipmentId: shipment.id,
      readableId: shipment.readable_id,
      status: shipment.status,
      progress: Number((progress * 100).toFixed(1)),
      truck: {
        lat: liveCoords.lat,
        lng: liveCoords.lng,
        currentStage: liveCoords.currentWaypoint.stage,
        currentLocationName: liveCoords.currentWaypoint.name,
        nextLocationName: liveCoords.nextWaypoint?.name || 'Destination Reached',
        carrier: 'LogiSync Express Hauler MH-12-LS-4421',
        speedKmH: shipment.status === 'IN_TRANSIT' ? 58 : 0,
        temperatureC: 4.8, // Cold chain monitor
        lastUpdated: new Date().toISOString(),
      },
      waypoints: ORANGES_ROUTE_WAYPOINTS,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
