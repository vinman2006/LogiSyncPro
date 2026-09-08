import { NextRequest, NextResponse } from 'next/server';
import { getShipmentById, getShipmentEvents, getAuditLogs } from '@/lib/db/repo';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const shipment = await getShipmentById(params.id);
    if (!shipment) {
      return NextResponse.json(
        { success: false, error: 'Shipment not found' },
        { status: 404 }
      );
    }

    const events = await getShipmentEvents(shipment.id);
    const auditLogs = await getAuditLogs(shipment.readable_id);

    return NextResponse.json({
      success: true,
      shipment,
      events,
      auditLogs,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
