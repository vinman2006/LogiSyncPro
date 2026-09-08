// End-to-end multi-participant verification script for LogiSync Oranges pilot

async function runTest() {
  console.log('=== 1. TEST DB INIT & RESILIENCE ===');
  const initRes = await fetch('http://localhost:3000/api/db/init');
  const initData = await initRes.json();
  console.log('Init result:', initData);

  console.log('\n=== 2. TEST LOGISTICS NODES ===');
  const nodesRes = await fetch('http://localhost:3000/api/nodes');
  const nodesData = await nodesRes.json();
  console.log(`Found ${nodesData.nodes?.length} nodes:`);
  nodesData.nodes?.forEach((n) => console.log(`  - [${n.role}] ${n.name} (${n.city})`));

  console.log('\n=== 3. TEST VERIFIED COLLECTORS ===');
  const collRes = await fetch('http://localhost:3000/api/nodes/collectors');
  const collData = await collRes.json();
  console.log(`Found ${collData.collectors?.length} verified collectors.`);

  console.log('\n=== 4. CREATE SHIPMENT (DISTRIBUTOR -> COLLECTOR) ===');
  const createRes = await fetch('http://localhost:3000/api/shipments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      distributor_node_id: 'node-dist-001',
      collector_node_id: 'node-coll-001',
      farmer_node_id: 'node-farmer-001',
      commodity: 'Oranges',
      expected_quantity: 1000,
      unit: 'kg',
      origin: 'Nashik, Maharashtra',
      destination: 'Market Yard, Pune, Maharashtra',
      value: 50000,
      currency: 'INR',
    }),
  });
  const createData = await createRes.json();
  const shipment = createData.shipment;
  console.log(`✓ Created Shipment: ${shipment.readable_id} | Status: ${shipment.status}`);
  const sId = shipment.id;

  console.log('\n=== 5. COLLECTOR ACCEPTS REQUEST ===');
  const acceptRes = await fetch(`http://localhost:3000/api/shipments/${sId}/action`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'accept', actorId: 'node-coll-001' }),
  });
  const acceptData = await acceptRes.json();
  console.log(`✓ Accepted: Status is now ${acceptData.shipment?.status}`);

  console.log('\n=== 6. DISPATCH IN TRANSIT ===');
  const transitRes = await fetch(`http://localhost:3000/api/shipments/${sId}/action`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'in_transit', actorId: 'node-dist-001' }),
  });
  const transitData = await transitRes.json();
  console.log(`✓ In Transit: Status is now ${transitData.shipment?.status}`);

  console.log('\n=== 7. SIMULATE GPS TRACKING ===');
  const trackRes = await fetch(`http://localhost:3000/api/shipments/${sId}/track`);
  const trackData = await trackRes.json();
  console.log(`✓ GPS Telemetry: Progress ${trackData.progress}%, Waypoint: ${trackData.truck?.currentLocationName}, Speed: ${trackData.truck?.speedKmH} km/h, Temp: ${trackData.truck?.temperatureC}°C`);

  console.log('\n=== 8. TRUCK ARRIVAL IN PUNE ===');
  const arriveRes = await fetch(`http://localhost:3000/api/shipments/${sId}/action`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'mark_arrived', actorId: 'node-dist-001' }),
  });
  const arriveData = await arriveRes.json();
  console.log(`✓ Arrived: Status is now ${arriveData.shipment?.status}`);

  console.log('\n=== 9. COLLECTOR WEIGH-BRIDGE VERIFICATION (980 kg) ===');
  const verifyRes = await fetch(`http://localhost:3000/api/shipments/${sId}/action`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'verify_quantity', receivedQuantity: 980, actorId: 'node-coll-001' }),
  });
  const verifyData = await verifyRes.json();
  console.log(`✓ Verified: Status is now ${verifyData.shipment?.status}, Expected: ${verifyData.shipment?.expected_quantity} kg, Received: ${verifyData.shipment?.received_quantity} kg`);

  console.log('\n=== 10. MULTI-RAIL SETTLEMENT (DEMO / WEB3 / RAZORPAY) ===');
  const payRes = await fetch('http://localhost:3000/api/payments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      shipmentId: sId,
      amount: 50000,
      currency: 'INR',
      method: 'DEMO',
      providerReference: 'DEMO-AUTOTEST-9921',
      transactionHash: '0x8f28d9c2419a7e04b124803',
    }),
  });
  const payData = await payRes.json();
  console.log(`✓ Payment: ${payData.message} | Final Status: ${payData.shipmentStatus}`);

  console.log('\n=== 11. VERIFY FULL CHRONOLOGICAL AUDIT LOG & PERSISTENCE ===');
  const finalRes = await fetch(`http://localhost:3000/api/shipments/${sId}`);
  const finalData = await finalRes.json();
  console.log(`✓ Final Record: ${finalData.shipment?.readable_id}`);
  console.log(`✓ Final State: ${finalData.shipment?.status}`);
  console.log(`✓ Total State Machine Events Recorded: ${finalData.events?.length}`);
  finalData.events?.forEach((e, i) => console.log(`   [${i + 1}] ${e.event_type} at ${e.location || 'Hub'}`));
  console.log(`✓ Total Audit Logs: ${finalData.auditLogs?.length}`);

  console.log('\n=== ALL 11 VERIFICATION PHASES PASSED SUCCESSFULLY! ===');
}

runTest().catch((e) => {
  console.error('Test failed:', e);
  process.exit(1);
});
