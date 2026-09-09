// Verification test for LogiSync Onboarding & Demo Initialization Flow
const BASE_URL = 'http://localhost:3000';

async function runTests() {
  console.log('🚀 Starting LogiSync Onboarding & Demo Test Suite...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, name) {
    if (condition) {
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${name}`);
      failed++;
    }
  }

  try {
    // -------------------------------------------------------------
    // TEST 1: User Sync with email prefix fallback (e.g. vineet@example.com)
    // -------------------------------------------------------------
    console.log('--- Test 1: User Sync with Email Fallback ---');
    const syncRes1 = await fetch(`${BASE_URL}/api/user/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firebaseUid: 'test-fb-vineet-001',
        email: 'vineet@example.com',
        displayName: '', // empty to test fallback
      }),
    });
    const syncData1 = await syncRes1.json();
    assert(syncData1.success === true, 'Sync API returned success');
    assert(syncData1.user.name === 'Vineet', `Expected name "Vineet", got "${syncData1.user.name}"`);
    assert(syncData1.needsOnboarding === true, 'New user needs onboarding');

    // -------------------------------------------------------------
    // TEST 2: User Sync with multi-word email (e.g. vineet.kumar@example.com)
    // -------------------------------------------------------------
    console.log('\n--- Test 2: Multi-word Email Fallback ---');
    const syncRes2 = await fetch(`${BASE_URL}/api/user/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firebaseUid: 'test-fb-vk-002',
        email: 'vineet.kumar@example.com',
      }),
    });
    const syncData2 = await syncRes2.json();
    assert(syncData2.user.name === 'Vineet Kumar', `Expected name "Vineet Kumar", got "${syncData2.user.name}"`);

    // -------------------------------------------------------------
    // TEST 3: Onboarding Submission for Distributor
    // -------------------------------------------------------------
    console.log('\n--- Test 3: Onboarding Submission (Distributor) ---');
    const onboardRes = await fetch(`${BASE_URL}/api/onboarding`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firebaseUid: 'test-fb-vineet-001',
        country: 'India',
        countryCode: 'IN',
        region: 'Maharashtra',
        regionCode: 'MH',
        role: 'DISTRIBUTOR',
        businessName: 'Vineet Fresh Logistics',
      }),
    });
    const onboardData = await onboardRes.json();
    assert(onboardData.success === true, 'Onboarding saved successfully');
    assert(onboardData.node && onboardData.node.name === 'Vineet Fresh Logistics', 'Node created with business name');
    assert(onboardData.node.role === 'DISTRIBUTOR', 'Node role is DISTRIBUTOR');

    // Check user sync now indicates onboarding is complete
    const checkSync = await fetch(`${BASE_URL}/api/user/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firebaseUid: 'test-fb-vineet-001',
        email: 'vineet@example.com',
      }),
    });
    const checkSyncData = await checkSync.json();
    assert(checkSyncData.needsOnboarding === false, 'User no longer needs onboarding');

    // -------------------------------------------------------------
    // TEST 4: Orange Demo Initialization (Idempotent)
    // -------------------------------------------------------------
    console.log('\n--- Test 4: Initialize Orange Demo ---');
    const demoInitRes1 = await fetch(`${BASE_URL}/api/demo/init`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firebaseUid: 'test-fb-vineet-001',
        userName: 'Vineet',
        role: 'DISTRIBUTOR',
        businessName: 'Vineet Fresh Logistics',
      }),
    });
    const demoInitData1 = await demoInitRes1.json();
    assert(demoInitData1.success === true, 'Demo initialized successfully');
    assert(demoInitData1.shipment.commodity === 'Oranges', 'Commodity is Oranges');
    assert(demoInitData1.shipment.expected_quantity === 1000, 'Expected quantity is 1000 kg');
    assert(demoInitData1.shipment.is_demo === true, 'Shipment has is_demo === true');
    assert(demoInitData1.shipment.distributor_node_id === onboardData.node.id, 'Distributor node is the user node');

    // Second call should be idempotent
    const demoInitRes2 = await fetch(`${BASE_URL}/api/demo/init`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firebaseUid: 'test-fb-vineet-001',
        userName: 'Vineet',
        role: 'DISTRIBUTOR',
        businessName: 'Vineet Fresh Logistics',
      }),
    });
    const demoInitData2 = await demoInitRes2.json();
    assert(demoInitData2.alreadyInitialized === true, 'Idempotency: alreadyInitialized is true');
    assert(demoInitData2.shipment.id === demoInitData1.shipment.id, 'Returns the exact same shipment');

    // -------------------------------------------------------------
    // TEST 5: Real Shipment Creation (is_demo = false)
    // -------------------------------------------------------------
    console.log('\n--- Test 5: Real Shipment Creation (is_demo === false) ---');
    const createRes = await fetch(`${BASE_URL}/api/shipments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        distributor_node_id: onboardData.node.id,
        collector_node_id: 'node-coll-001',
        commodity: 'Mangoes',
        expected_quantity: 500,
        unit: 'kg',
        origin: 'Ratnagiri, Maharashtra',
        destination: 'Market Yard, Pune',
        value: 30000,
      }),
    });
    const createData = await createRes.json();
    assert(createData.success === true, 'Created real shipment');
    assert(createData.shipment.is_demo === false, 'Real shipment has is_demo === false');

    // -------------------------------------------------------------
    // TEST 6: Collector Flow & Quick Action Acceptance
    // -------------------------------------------------------------
    console.log('\n--- Test 6: Collector Flow & Acceptance ---');
    // Onboard a collector user
    const collectorOnboard = await fetch(`${BASE_URL}/api/onboarding`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firebaseUid: 'test-fb-collector-003',
        country: 'India',
        countryCode: 'IN',
        region: 'Maharashtra',
        regionCode: 'MH',
        role: 'COLLECTOR',
        businessName: 'Pune Fresh Market Terminal',
      }),
    });
    const collectorData = await collectorOnboard.json();
    assert(collectorData.node.role === 'COLLECTOR', 'Collector node registered');

    // Init demo for collector
    const collDemoRes = await fetch(`${BASE_URL}/api/demo/init`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firebaseUid: 'test-fb-collector-003',
        userName: 'Collector User',
        role: 'COLLECTOR',
        businessName: 'Pune Fresh Market Terminal',
      }),
    });
    const collDemoData = await collDemoRes.json();
    assert(collDemoData.shipment.status === 'REQUESTED', 'Collector incoming demo shipment starts as REQUESTED');
    assert(collDemoData.shipment.collector_node_id === collectorData.node.id, 'Collector node matches user node');

    // Collector accepts the shipment
    const actionRes = await fetch(`${BASE_URL}/api/shipments/${collDemoData.shipment.id}/action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'accept',
        actorId: collectorData.node.id,
      }),
    });
    const actionData = await actionRes.json();
    assert(actionData.success === true, 'Accept action succeeded');
    assert(actionData.shipment.status === 'ACCEPTED', 'Shipment status updated to ACCEPTED');

    // -------------------------------------------------------------
    // TEST 7: Skip Demo Path
    // -------------------------------------------------------------
    console.log('\n--- Test 7: Skip Demo Path ---');
    const skipUserOnboard = await fetch(`${BASE_URL}/api/onboarding`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firebaseUid: 'test-fb-skip-004',
        country: 'India',
        countryCode: 'IN',
        region: 'Maharashtra',
        regionCode: 'MH',
        role: 'DISTRIBUTOR',
        businessName: 'Skipped Demo Logistics',
      }),
    });
    const skipOnboardData = await skipUserOnboard.json();
    assert(skipOnboardData.success === true, 'User saved profile without initializing demo');

    const skipUserSync = await fetch(`${BASE_URL}/api/user/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firebaseUid: 'test-fb-skip-004',
        email: 'skip@example.com',
      }),
    });
    const skipUserSyncData = await skipUserSync.json();
    assert(skipUserSyncData.needsOnboarding === false, 'Skipping demo leaves onboarding as complete, no re-prompting');

    console.log(`\n========================================`);
    console.log(`Test Results: ${passed} passed, ${failed} failed.`);
    console.log(`========================================\n`);

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Unexpected test failure:', err);
    process.exit(1);
  }
}

runTests();
