import { executeQuery, isNeonConfigured, getFallbackStore } from './neon';

export interface UserEntity {
  id: string;
  firebase_uid: string;
  email: string;
  name: string;
  display_name: string;
  created_at: string;
}

export interface BusinessEntity {
  id: string;
  user_id: string;
  business_name: string;
  country: string;
  country_code: string;
  region: string;
  region_code: string;
  role: 'FARMER' | 'DISTRIBUTOR' | 'COLLECTOR';
  status: string;
  created_at: string;
}

export interface NodeEntity {
  id: string;
  business_id: string;
  owner_id?: string;
  node_code: string;
  name: string;
  node_type?: string;
  role: 'FARMER' | 'DISTRIBUTOR' | 'COLLECTOR';
  country: string;
  city: string;
  region?: string;
  status: string;
  commodities_handled: string[];
  created_at: string;
}

export interface ShipmentEntity {
  id: string;
  readable_id: string;
  distributor_node_id: string;
  collector_node_id: string;
  farmer_node_id?: string;
  commodity: string;
  expected_quantity: number;
  received_quantity?: number;
  unit: string;
  origin: string;
  destination: string;
  value: number;
  currency: string;
  status:
    | 'DRAFT'
    | 'REQUESTED'
    | 'ACCEPTED'
    | 'IN_TRANSIT'
    | 'ARRIVED'
    | 'RECEIVED'
    | 'PAYMENT_PENDING'
    | 'PAYMENT_VERIFIED'
    | 'COMPLETED'
    | 'REJECTED'
    | 'CANCELLED';
  is_demo?: boolean;
  demo_user_id?: string;
  created_at: string;
  updated_at: string;
  distributor_name?: string;
  collector_name?: string;
  farmer_name?: string;
}

export interface ShipmentEventEntity {
  id: string;
  shipment_id: string;
  event_type: string;
  actor_id?: string;
  location?: string;
  metadata?: any;
  created_at: string;
}

export interface PaymentEntity {
  id: string;
  shipment_id: string;
  payer_id?: string;
  payee_id?: string;
  amount: number;
  currency: string;
  method: 'RAZORPAY' | 'METAMASK' | 'STELLAR' | 'DEMO';
  status: 'CREATED' | 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';
  provider_reference?: string;
  transaction_hash?: string;
  idempotency_key?: string;
  metadata?: any;
  created_at: string;
  verified_at?: string;
}

import { resolveUserName } from '@/lib/utils/userName';
export { resolveUserName };

// ----------------------------------------------------
// USER & ONBOARDING OPERATIONS
// ----------------------------------------------------

export async function syncUser(firebaseUid: string, email: string, displayName?: string) {
  const resolvedName = resolveUserName(displayName, email);

  if (isNeonConfigured) {
    const existing = await executeQuery<UserEntity>(
      'SELECT * FROM users WHERE firebase_uid = $1 LIMIT 1',
      [firebaseUid]
    );
    if (existing.length > 0) {
      // If user exists but name was generic, update it
      if (existing[0].display_name === 'User' || !existing[0].display_name) {
        await executeQuery('UPDATE users SET display_name = $1, name = $1 WHERE id = $2', [
          resolvedName,
          existing[0].id,
        ]);
        existing[0].display_name = resolvedName;
        existing[0].name = resolvedName;
      }
      return existing[0];
    }

    const inserted = await executeQuery<UserEntity>(
      'INSERT INTO users (firebase_uid, email, display_name, name) VALUES ($1, $2, $3, $3) RETURNING *',
      [firebaseUid, email, resolvedName]
    );
    return inserted[0];
  }

  // Fallback store
  const store = getFallbackStore();
  let user = store.users.find((u) => u.firebase_uid === firebaseUid);
  if (!user) {
    user = {
      id: `usr-${Date.now().toString(36)}`,
      firebase_uid: firebaseUid,
      email,
      name: resolvedName,
      display_name: resolvedName,
      created_at: new Date().toISOString(),
    };
    store.users.push(user);
  } else if (!user.display_name || user.display_name === 'User') {
    user.display_name = resolvedName;
    user.name = resolvedName;
  }
  return user;
}

export async function completeOnboarding(params: {
  firebaseUid: string;
  email: string;
  displayName?: string;
  country: string;
  countryCode: string;
  region: string;
  regionCode: string;
  role: 'FARMER' | 'DISTRIBUTOR' | 'COLLECTOR';
  businessName: string;
  city: string;
  phone?: string;
}) {
  const user = await syncUser(params.firebaseUid, params.email, params.displayName);

  if (isNeonConfigured) {
    // 1. Save profile
    await executeQuery(
      `INSERT INTO user_profiles (user_id, country, country_code, city, phone)
       VALUES ($1, $2, $3, $4, $5)`,
      [user.id, params.country, params.countryCode, params.city, params.phone || '']
    );

    // 2. Save business
    const bizRows = await executeQuery<{ id: string }>(
      `INSERT INTO businesses (user_id, owner_id, business_name, name, business_type, role, country, country_code, region, region_code, city, status)
       VALUES ($1, $1, $2, $2, $3, $3, $4, $5, $6, $7, $8, 'VERIFIED') RETURNING id`,
      [
        user.id,
        params.businessName,
        params.role,
        params.country,
        params.countryCode,
        params.region,
        params.regionCode,
        params.city,
      ]
    );
    const businessId = bizRows[0].id;

    // 3. Create active Node
    const nodeCode = `NODE-${params.role.substring(0, 4)}-${(params.city || params.region).substring(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
    const nodeRows = await executeQuery<NodeEntity>(
      `INSERT INTO nodes (business_id, owner_id, node_code, name, node_type, role, country, city, region, status, commodities_handled)
       VALUES ($1, $2, $3, $4, $5, $5, $6, $7, $8, 'ACTIVE', $9) RETURNING *`,
      [
        businessId,
        user.id,
        nodeCode,
        params.businessName,
        params.role,
        params.country,
        params.city,
        params.region,
        ['Oranges', 'Citrus', 'Agri-Produce'],
      ]
    );

    return { user, node: nodeRows[0] };
  }

  // Fallback store
  const store = getFallbackStore();
  const profile = {
    id: `prof-${Date.now().toString(36)}`,
    user_id: user.id,
    country: params.country,
    country_code: params.countryCode,
    region: params.region,
    region_code: params.regionCode,
    city: params.city,
    phone: params.phone,
    created_at: new Date().toISOString(),
  };
  store.user_profiles.push(profile);

  const business = {
    id: `biz-${Date.now().toString(36)}`,
    user_id: user.id,
    owner_id: user.id,
    business_name: params.businessName,
    name: params.businessName,
    business_type: params.role,
    role: params.role,
    country: params.country,
    country_code: params.countryCode,
    region: params.region,
    region_code: params.regionCode,
    city: params.city,
    status: 'VERIFIED',
    created_at: new Date().toISOString(),
  };
  store.businesses.push(business);

  const node: NodeEntity = {
    id: `node-${Date.now().toString(36)}`,
    business_id: business.id,
    owner_id: user.id,
    node_code: `NODE-${params.role.substring(0, 4)}-${(params.city || params.region).substring(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
    name: params.businessName,
    node_type: params.role,
    role: params.role,
    country: params.country,
    city: params.city,
    region: params.region,
    status: 'ACTIVE',
    commodities_handled: ['Oranges', 'Citrus', 'Agri-Produce'],
    created_at: new Date().toISOString(),
  };
  store.nodes.push(node);

  return { user, node };
}

// ----------------------------------------------------
// DEMO INITIALIZATION (IDEMPOTENT ORANGE SUPPLY CHAIN)
// ----------------------------------------------------

export async function initializeOrangeDemo(params: { firebaseUid: string }) {
  const user = await syncUser(params.firebaseUid, 'user@logisync.com');
  const userNode = await getUserNode(params.firebaseUid);

  if (!userNode) {
    throw new Error('Please complete onboarding before initializing demo.');
  }

  // 1. Check idempotency: does this user/node already have an active demo shipment?
  const store = getFallbackStore();
  let existingDemo: ShipmentEntity | undefined;

  if (isNeonConfigured) {
    const existingRows = await executeQuery<ShipmentEntity>(
      `SELECT * FROM shipments 
       WHERE is_demo = TRUE AND (distributor_node_id = $1 OR collector_node_id = $1 OR farmer_node_id = $1)
       ORDER BY created_at DESC LIMIT 1`,
      [userNode.id]
    );
    if (existingRows.length > 0) existingDemo = existingRows[0];
  } else {
    existingDemo = store.shipments.find(
      (s) =>
        s.is_demo === true &&
        (s.distributor_node_id === userNode.id ||
          s.collector_node_id === userNode.id ||
          s.farmer_node_id === userNode.id ||
          s.demo_user_id === user.id)
    ) as ShipmentEntity | undefined;
  }

  if (existingDemo) {
    return {
      success: true,
      alreadyInitialized: true,
      shipment: existingDemo,
      message: 'Demo already initialized.',
    };
  }

  // 2. Ensure supporting supply chain counterpart nodes exist
  const allNodes = await listAllNodes();
  const defaultFarmer =
    allNodes.find((n) => n.role === 'FARMER' && n.id !== userNode.id) || allNodes[0];
  const defaultDistributor =
    allNodes.find((n) => n.role === 'DISTRIBUTOR' && n.id !== userNode.id) || allNodes[0];
  const defaultCollector =
    allNodes.find((n) => n.role === 'COLLECTOR' && n.id !== userNode.id) || allNodes[0];

  let distributorId: string;
  let collectorId: string;
  let farmerId: string;
  let initialStatus: ShipmentEntity['status'];

  if (userNode.role === 'DISTRIBUTOR') {
    distributorId = userNode.id;
    collectorId = defaultCollector.id;
    farmerId = defaultFarmer.id;
    initialStatus = 'ACCEPTED'; // Ready for distributor to dispatch!
  } else if (userNode.role === 'COLLECTOR') {
    distributorId = defaultDistributor.id;
    collectorId = userNode.id;
    farmerId = defaultFarmer.id;
    initialStatus = 'REQUESTED'; // Waiting for collector to accept!
  } else {
    // Farmer
    distributorId = defaultDistributor.id;
    collectorId = defaultCollector.id;
    farmerId = userNode.id;
    initialStatus = 'REQUESTED';
  }

  const readableId = generateReadableShipmentId();

  if (isNeonConfigured) {
    const inserted = await executeQuery<ShipmentEntity>(
      `INSERT INTO shipments (
        readable_id, distributor_node_id, collector_node_id, farmer_node_id,
        commodity, expected_quantity, unit, origin, destination, value, currency, status, is_demo
      ) VALUES ($1, $2, $3, $4, 'Oranges', 1000, 'kg', 'Maharashtra', 'Pune', 50000, 'INR', $5, TRUE)
      RETURNING *`,
      [readableId, distributorId, collectorId, farmerId, initialStatus]
    );

    const shp = inserted[0];

    // Record creation event
    await executeQuery(
      `INSERT INTO shipment_events (shipment_id, event_type, actor_id, location, metadata)
       VALUES ($1, 'SHIPMENT_CREATED', $2, 'Maharashtra', $3)`,
      [shp.id, user.id, JSON.stringify({ commodity: 'Oranges', quantity: 1000, is_demo: true })]
    );

    await executeQuery(
      `INSERT INTO shipment_events (shipment_id, event_type, actor_id, location, metadata)
       VALUES ($1, 'COLLECTOR_REQUESTED', $2, 'Pune', $3)`,
      [shp.id, user.id, JSON.stringify({ requested_node_id: collectorId })]
    );

    if (initialStatus === 'ACCEPTED') {
      await executeQuery(
        `INSERT INTO shipment_events (shipment_id, event_type, actor_id, location, metadata)
         VALUES ($1, 'COLLECTOR_ACCEPTED', $2, 'Pune', $3)`,
        [shp.id, user.id, JSON.stringify({ note: 'Pre-accepted demo shipment' })]
      );
    }

    return {
      success: true,
      alreadyInitialized: false,
      shipment: shp,
      message: 'Your Orange Logistics Demo is Ready',
    };
  }

  // Fallback in-memory store
  const newDemoShipment: ShipmentEntity = {
    id: `shp-demo-${Date.now().toString(36)}`,
    readable_id: readableId,
    distributor_node_id: distributorId,
    collector_node_id: collectorId,
    farmer_node_id: farmerId,
    commodity: 'Oranges',
    expected_quantity: 1000,
    unit: 'kg',
    origin: 'Maharashtra',
    destination: 'Pune',
    value: 50000,
    currency: 'INR',
    status: initialStatus,
    is_demo: true,
    demo_user_id: user.id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  store.shipments.unshift(newDemoShipment);

  store.shipment_events.push({
    id: `evt-demo-1-${Date.now().toString(36)}`,
    shipment_id: newDemoShipment.id,
    event_type: 'SHIPMENT_CREATED',
    actor_id: user.id,
    location: 'Maharashtra',
    metadata: { commodity: 'Oranges', quantity: 1000, is_demo: true },
    created_at: new Date().toISOString(),
  });

  store.shipment_events.push({
    id: `evt-demo-2-${Date.now().toString(36)}`,
    shipment_id: newDemoShipment.id,
    event_type: 'COLLECTOR_REQUESTED',
    actor_id: user.id,
    location: 'Pune',
    metadata: { requested_node_id: collectorId },
    created_at: new Date().toISOString(),
  });

  if (initialStatus === 'ACCEPTED') {
    store.shipment_events.push({
      id: `evt-demo-3-${Date.now().toString(36)}`,
      shipment_id: newDemoShipment.id,
      event_type: 'COLLECTOR_ACCEPTED',
      actor_id: user.id,
      location: 'Pune',
      metadata: { note: 'Pre-accepted demo shipment' },
      created_at: new Date().toISOString(),
    });
  }

  // Add notification
  store.notifications.unshift({
    id: `notif-demo-${Date.now().toString(36)}`,
    type: userNode.role === 'COLLECTOR' ? 'SHIPMENT_REQUESTED' : 'DEMO_READY',
    title: userNode.role === 'COLLECTOR' ? 'Incoming Orange Shipment' : 'Orange Logistics Demo Initialized',
    message:
      userNode.role === 'COLLECTOR'
        ? 'Incoming shipment request from Pune Fresh Logistics: 1,000 kg Oranges (Maharashtra → Pune).'
        : 'Your Orange supply chain demo is initialized and ready on your dashboard.',
    entity_type: 'SHIPMENT',
    entity_id: readableId,
    read: false,
    created_at: new Date().toISOString(),
  });

  return {
    success: true,
    alreadyInitialized: false,
    shipment: newDemoShipment,
    message: 'Your Orange Logistics Demo is Ready',
  };
}

export async function getUserNode(firebaseUid?: string): Promise<NodeEntity | null> {
  if (!firebaseUid) return null;

  if (isNeonConfigured) {
    const rows = await executeQuery<NodeEntity>(
      `SELECT n.* FROM nodes n
       JOIN users u ON u.id = n.owner_id
       WHERE u.firebase_uid = $1
       ORDER BY n.created_at DESC LIMIT 1`,
      [firebaseUid]
    );
    return rows[0] || null;
  }

  const store = getFallbackStore();
  const user = store.users.find((u) => u.firebase_uid === firebaseUid);
  if (!user) return null;
  const node = store.nodes.find((n) => n.owner_id === user.id);
  return (node as unknown as NodeEntity) || null;
}

// ----------------------------------------------------
// NODES & COLLECTOR LOOKUP
// ----------------------------------------------------

export async function listCollectors(searchCity?: string): Promise<NodeEntity[]> {
  if (isNeonConfigured) {
    let query = `SELECT * FROM nodes WHERE role = 'COLLECTOR' AND status = 'VERIFIED'`;
    const params: any[] = [];
    if (searchCity) {
      query += ` AND LOWER(city) LIKE $1`;
      params.push(`%${searchCity.toLowerCase()}%`);
    }
    query += ` ORDER BY name ASC`;
    return executeQuery<NodeEntity>(query, params);
  }

  const store = getFallbackStore();
  return store.nodes.filter(
    (n) =>
      n.role === 'COLLECTOR' &&
      (!searchCity || n.city.toLowerCase().includes(searchCity.toLowerCase()))
  ) as NodeEntity[];
}

export async function listAllNodes(): Promise<NodeEntity[]> {
  if (isNeonConfigured) {
    return executeQuery<NodeEntity>(`SELECT * FROM nodes ORDER BY role ASC, name ASC`);
  }
  return getFallbackStore().nodes as NodeEntity[];
}

export async function getNodeById(id: string): Promise<NodeEntity | null> {
  if (isNeonConfigured) {
    const rows = await executeQuery<NodeEntity>(`SELECT * FROM nodes WHERE id = $1 LIMIT 1`, [id]);
    return rows[0] || null;
  }
  return (getFallbackStore().nodes.find((n) => n.id === id) as NodeEntity) || null;
}

// ----------------------------------------------------
// SHIPMENT OPERATIONS
// ----------------------------------------------------

let readableCounter = 2;

export function generateReadableShipmentId(): string {
  const num = String(readableCounter++).padStart(6, '0');
  return `LS-2026-${num}`;
}

export async function createShipment(data: {
  distributor_node_id: string;
  collector_node_id: string;
  farmer_node_id?: string;
  commodity: string;
  expected_quantity: number;
  unit: string;
  origin: string;
  destination: string;
  value: number;
  currency?: string;
  actor_id?: string;
}): Promise<ShipmentEntity> {
  const readableId = generateReadableShipmentId();
  const currency = data.currency || 'INR';

  if (isNeonConfigured) {
    const rows = await executeQuery<ShipmentEntity>(
      `INSERT INTO shipments (
        readable_id, distributor_node_id, collector_node_id, farmer_node_id,
        commodity, expected_quantity, unit, origin, destination, value, currency, status, is_demo
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'REQUESTED', FALSE)
      RETURNING *`,
      [
        readableId,
        data.distributor_node_id,
        data.collector_node_id,
        data.farmer_node_id || null,
        data.commodity,
        data.expected_quantity,
        data.unit,
        data.origin,
        data.destination,
        data.value,
        currency,
      ]
    );

    const shipment = rows[0];

    // Log events
    await executeQuery(
      `INSERT INTO shipment_events (shipment_id, event_type, actor_id, location, metadata)
       VALUES ($1, 'SHIPMENT_CREATED', $2, $3, $4)`,
      [shipment.id, data.actor_id || null, data.origin, JSON.stringify(data)]
    );

    await executeQuery(
      `INSERT INTO shipment_events (shipment_id, event_type, actor_id, location, metadata)
       VALUES ($1, 'COLLECTOR_REQUESTED', $2, $3, $4)`,
      [shipment.id, data.actor_id || null, data.destination, JSON.stringify({ requested_node_id: data.collector_node_id })]
    );

    // Initial audit log
    await executeQuery(
      `INSERT INTO audit_logs (entity_type, entity_id, action, actor_id, metadata)
       VALUES ('SHIPMENT', $1, 'SHIPMENT_CREATED', $2, $3)`,
      [readableId, data.actor_id || null, JSON.stringify({ value: data.value, commodity: data.commodity })]
    );

    return shipment;
  }

  // Fallback store
  const store = getFallbackStore();
  const newShipment: ShipmentEntity = {
    id: `shp-${Date.now().toString(36)}`,
    readable_id: readableId,
    distributor_node_id: data.distributor_node_id,
    collector_node_id: data.collector_node_id,
    farmer_node_id: data.farmer_node_id,
    commodity: data.commodity,
    expected_quantity: data.expected_quantity,
    unit: data.unit,
    origin: data.origin,
    destination: data.destination,
    value: data.value,
    currency,
    status: 'REQUESTED',
    is_demo: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  store.shipments.unshift(newShipment);

  store.shipment_events.push({
    id: `evt-${Date.now().toString(36)}-1`,
    shipment_id: newShipment.id,
    event_type: 'SHIPMENT_CREATED',
    actor_id: data.actor_id,
    location: data.origin,
    metadata: data,
    created_at: new Date().toISOString(),
  });

  store.shipment_events.push({
    id: `evt-${Date.now().toString(36)}-2`,
    shipment_id: newShipment.id,
    event_type: 'COLLECTOR_REQUESTED',
    actor_id: data.actor_id,
    location: data.destination,
    metadata: { requested_node_id: data.collector_node_id },
    created_at: new Date().toISOString(),
  });

  store.audit_logs.push({
    id: `aud-${Date.now().toString(36)}`,
    entity_type: 'SHIPMENT',
    entity_id: readableId,
    action: 'SHIPMENT_CREATED',
    actor_id: data.actor_id,
    metadata: { value: data.value, commodity: data.commodity },
    created_at: new Date().toISOString(),
  });

  // Notify collector
  store.notifications.unshift({
    id: `notif-${Date.now().toString(36)}`,
    type: 'SHIPMENT_REQUESTED',
    title: 'New Shipment Request',
    message: `Incoming shipment request for ${data.expected_quantity} ${data.unit} of ${data.commodity} (${readableId}).`,
    entity_type: 'SHIPMENT',
    entity_id: readableId,
    read: false,
    created_at: new Date().toISOString(),
  });

  return newShipment;
}

export async function getShipmentById(idOrReadableId: string): Promise<ShipmentEntity | null> {
  if (isNeonConfigured) {
    const rows = await executeQuery<ShipmentEntity>(
      `SELECT s.*, 
        d.name as distributor_name, 
        c.name as collector_name, 
        f.name as farmer_name
       FROM shipments s
       LEFT JOIN nodes d ON d.id = s.distributor_node_id
       LEFT JOIN nodes c ON c.id = s.collector_node_id
       LEFT JOIN nodes f ON f.id = s.farmer_node_id
       WHERE s.id::text = $1 OR s.readable_id = $1
       LIMIT 1`,
      [idOrReadableId]
    );
    return rows[0] || null;
  }

  const store = getFallbackStore();
  const shp = store.shipments.find(
    (s) => s.id === idOrReadableId || s.readable_id === idOrReadableId
  );
  if (!shp) return null;

  const distNode = store.nodes.find((n) => n.id === shp.distributor_node_id);
  const collNode = store.nodes.find((n) => n.id === shp.collector_node_id);
  const farmNode = store.nodes.find((n) => n.id === shp.farmer_node_id);

  return {
    ...shp,
    status: shp.status as ShipmentEntity['status'],
    distributor_name: distNode?.name || 'Distributor',
    collector_name: collNode?.name || 'Collector',
    farmer_name: farmNode?.name || 'Farmer',
  };
}

export async function listShipments(filter?: {
  nodeId?: string;
  role?: string;
  status?: string;
}): Promise<ShipmentEntity[]> {
  if (isNeonConfigured) {
    let query = `
      SELECT s.*, 
        d.name as distributor_name, 
        c.name as collector_name, 
        f.name as farmer_name
       FROM shipments s
       LEFT JOIN nodes d ON d.id = s.distributor_node_id
       LEFT JOIN nodes c ON c.id = s.collector_node_id
       LEFT JOIN nodes f ON f.id = s.farmer_node_id
       WHERE 1=1
    `;
    const params: any[] = [];
    if (filter?.nodeId) {
      params.push(filter.nodeId);
      query += ` AND (s.distributor_node_id = $${params.length} OR s.collector_node_id = $${params.length} OR s.farmer_node_id = $${params.length})`;
    }
    if (filter?.status) {
      params.push(filter.status);
      query += ` AND s.status = $${params.length}`;
    }
    query += ` ORDER BY s.created_at DESC`;
    return executeQuery<ShipmentEntity>(query, params);
  }

  const store = getFallbackStore();
  let list = [...store.shipments];

  if (filter?.nodeId) {
    list = list.filter(
      (s) =>
        s.distributor_node_id === filter.nodeId ||
        s.collector_node_id === filter.nodeId ||
        s.farmer_node_id === filter.nodeId
    );
  }

  if (filter?.status) {
    list = list.filter((s) => s.status === filter.status);
  }

  return list.map((shp) => {
    const distNode = store.nodes.find((n) => n.id === shp.distributor_node_id);
    const collNode = store.nodes.find((n) => n.id === shp.collector_node_id);
    const farmNode = store.nodes.find((n) => n.id === shp.farmer_node_id);
    return {
      ...shp,
      status: shp.status as ShipmentEntity['status'],
      distributor_name: distNode?.name || 'Distributor',
      collector_name: collNode?.name || 'Collector',
      farmer_name: farmNode?.name || 'Farmer',
    };
  });
}

// ----------------------------------------------------
// STATE MACHINE TRANSITIONS
// ----------------------------------------------------

export async function transitionShipmentStatus(params: {
  shipmentId: string;
  nextStatus: ShipmentEntity['status'];
  eventType: string;
  actorId?: string;
  location?: string;
  metadata?: any;
}) {
  const { shipmentId, nextStatus, eventType, actorId, location, metadata } = params;

  if (isNeonConfigured) {
    const updatedRows = await executeQuery<ShipmentEntity>(
      `UPDATE shipments 
       SET status = $1, updated_at = NOW() 
       WHERE id::text = $2 OR readable_id = $2 
       RETURNING *`,
      [nextStatus, shipmentId]
    );

    const shp = updatedRows[0];
    if (!shp) throw new Error(`Shipment ${shipmentId} not found`);

    await executeQuery(
      `INSERT INTO shipment_events (shipment_id, event_type, actor_id, location, metadata)
       VALUES ($1, $2, $3, $4, $5)`,
      [shp.id, eventType, actorId || null, location || '', JSON.stringify(metadata || {})]
    );

    await executeQuery(
      `INSERT INTO audit_logs (entity_type, entity_id, action, actor_id, metadata)
       VALUES ('SHIPMENT', $1, $2, $3, $4)`,
      [shp.readable_id, eventType, actorId || null, JSON.stringify(metadata || {})]
    );

    return shp;
  }

  const store = getFallbackStore();
  const shp = store.shipments.find(
    (s) => s.id === shipmentId || s.readable_id === shipmentId
  );
  if (!shp) throw new Error(`Shipment ${shipmentId} not found`);

  shp.status = nextStatus;
  shp.updated_at = new Date().toISOString();

  store.shipment_events.push({
    id: `evt-${Date.now().toString(36)}`,
    shipment_id: shp.id,
    event_type: eventType,
    actor_id: actorId,
    location,
    metadata,
    created_at: new Date().toISOString(),
  });

  store.audit_logs.push({
    id: `aud-${Date.now().toString(36)}`,
    entity_type: 'SHIPMENT',
    entity_id: shp.readable_id,
    action: eventType,
    actor_id: actorId,
    metadata,
    created_at: new Date().toISOString(),
  });

  return shp;
}

export async function verifyShipmentQuantity(params: {
  shipmentId: string;
  receivedQuantity: number;
  actorId?: string;
}) {
  const { shipmentId, receivedQuantity, actorId } = params;

  if (isNeonConfigured) {
    const updated = await executeQuery<ShipmentEntity>(
      `UPDATE shipments 
       SET received_quantity = $1, status = 'PAYMENT_PENDING', updated_at = NOW() 
       WHERE id::text = $2 OR readable_id = $2 
       RETURNING *`,
      [receivedQuantity, shipmentId]
    );
    const shp = updated[0];

    const diff = Number(receivedQuantity) - Number(shp.expected_quantity);

    await executeQuery(
      `INSERT INTO shipment_events (shipment_id, event_type, actor_id, location, metadata)
       VALUES ($1, 'QUANTITY_VERIFIED', $2, $3, $4)`,
      [
        shp.id,
        actorId || null,
        shp.destination,
        JSON.stringify({ expected: shp.expected_quantity, received: receivedQuantity, difference: diff }),
      ]
    );

    await executeQuery(
      `INSERT INTO audit_logs (entity_type, entity_id, action, actor_id, metadata)
       VALUES ('SHIPMENT', $1, 'QUANTITY_VERIFIED', $2, $3)`,
      [shp.readable_id, actorId || null, JSON.stringify({ receivedQuantity, diff })]
    );

    return shp;
  }

  const store = getFallbackStore();
  const shp = store.shipments.find(
    (s) => s.id === shipmentId || s.readable_id === shipmentId
  );
  if (!shp) throw new Error(`Shipment ${shipmentId} not found`);

  shp.received_quantity = receivedQuantity;
  shp.status = 'PAYMENT_PENDING';
  shp.updated_at = new Date().toISOString();

  const diff = Number(receivedQuantity) - Number(shp.expected_quantity);

  store.shipment_events.push({
    id: `evt-${Date.now().toString(36)}`,
    shipment_id: shp.id,
    event_type: 'QUANTITY_VERIFIED',
    actor_id: actorId,
    location: shp.destination,
    metadata: { expected: shp.expected_quantity, received: receivedQuantity, difference: diff },
    created_at: new Date().toISOString(),
  });

  store.audit_logs.push({
    id: `aud-${Date.now().toString(36)}`,
    entity_type: 'SHIPMENT',
    entity_id: shp.readable_id,
    action: 'QUANTITY_VERIFIED',
    actor_id: actorId,
    metadata: { receivedQuantity, diff },
    created_at: new Date().toISOString(),
  });

  return shp;
}

// ----------------------------------------------------
// PAYMENT & WALLET OPERATIONS
// ----------------------------------------------------

export async function recordPayment(params: {
  shipmentId: string;
  amount: number;
  currency: string;
  method: 'RAZORPAY' | 'METAMASK' | 'STELLAR' | 'DEMO';
  providerReference?: string;
  transactionHash?: string;
  idempotencyKey?: string;
  actorId?: string;
}) {
  const { shipmentId, amount, currency, method, providerReference, transactionHash, idempotencyKey, actorId } = params;

  if (isNeonConfigured) {
    const shpRows = await executeQuery<ShipmentEntity>(
      `SELECT * FROM shipments WHERE id::text = $1 OR readable_id = $1 LIMIT 1`,
      [shipmentId]
    );
    const shp = shpRows[0];
    if (!shp) throw new Error(`Shipment ${shipmentId} not found`);

    const payRows = await executeQuery<PaymentEntity>(
      `INSERT INTO payments (
        shipment_id, amount, currency, method, status, 
        provider_reference, transaction_hash, idempotency_key, verified_at
       ) VALUES ($1, $2, $3, $4, 'SUCCESS', $5, $6, $7, NOW())
       RETURNING *`,
      [shp.id, amount, currency, method, providerReference || null, transactionHash || null, idempotencyKey || null]
    );

    // Update shipment to PAYMENT_VERIFIED and then COMPLETED
    await executeQuery(
      `UPDATE shipments SET status = 'COMPLETED', updated_at = NOW() WHERE id = $1`,
      [shp.id]
    );

    await executeQuery(
      `INSERT INTO shipment_events (shipment_id, event_type, actor_id, metadata)
       VALUES ($1, 'PAYMENT_VERIFIED', $2, $3)`,
      [shp.id, actorId || null, JSON.stringify({ method, amount, currency, transactionHash, providerReference })]
    );

    await executeQuery(
      `INSERT INTO shipment_events (shipment_id, event_type, actor_id, metadata)
       VALUES ($1, 'SHIPMENT_COMPLETED', $2, $3)`,
      [shp.id, actorId || null, JSON.stringify({ status: 'COMPLETED' })]
    );

    await executeQuery(
      `INSERT INTO audit_logs (entity_type, entity_id, action, actor_id, metadata)
       VALUES ('PAYMENT', $1, 'PAYMENT_VERIFIED', $2, $3)`,
      [payRows[0].id, actorId || null, JSON.stringify({ method, amount, transactionHash })]
    );

    return payRows[0];
  }

  const store = getFallbackStore();
  const shp = store.shipments.find((s) => s.id === shipmentId || s.readable_id === shipmentId);
  if (!shp) throw new Error(`Shipment ${shipmentId} not found`);

  const payment: PaymentEntity = {
    id: `pay-${Date.now().toString(36)}`,
    shipment_id: shp.id,
    amount,
    currency,
    method,
    status: 'SUCCESS',
    provider_reference: providerReference,
    transaction_hash: transactionHash,
    idempotency_key: idempotencyKey,
    created_at: new Date().toISOString(),
    verified_at: new Date().toISOString(),
  };

  store.payments.push(payment);

  shp.status = 'COMPLETED';
  shp.updated_at = new Date().toISOString();

  store.shipment_events.push({
    id: `evt-${Date.now().toString(36)}-pay`,
    shipment_id: shp.id,
    event_type: 'PAYMENT_VERIFIED',
    actor_id: actorId,
    metadata: { method, amount, currency, transactionHash, providerReference },
    created_at: new Date().toISOString(),
  });

  store.shipment_events.push({
    id: `evt-${Date.now().toString(36)}-done`,
    shipment_id: shp.id,
    event_type: 'SHIPMENT_COMPLETED',
    actor_id: actorId,
    metadata: { status: 'COMPLETED' },
    created_at: new Date().toISOString(),
  });

  store.audit_logs.push({
    id: `aud-${Date.now().toString(36)}-pay`,
    entity_type: 'PAYMENT',
    entity_id: payment.id,
    action: 'PAYMENT_VERIFIED',
    actor_id: actorId,
    metadata: { method, amount, transactionHash },
    created_at: new Date().toISOString(),
  });

  return payment;
}

export async function getShipmentEvents(shipmentId: string): Promise<ShipmentEventEntity[]> {
  if (isNeonConfigured) {
    return executeQuery<ShipmentEventEntity>(
      `SELECT e.* FROM shipment_events e
       JOIN shipments s ON s.id = e.shipment_id
       WHERE s.id::text = $1 OR s.readable_id = $1
       ORDER BY e.created_at ASC`,
      [shipmentId]
    );
  }

  const store = getFallbackStore();
  const shp = store.shipments.find((s) => s.id === shipmentId || s.readable_id === shipmentId);
  if (!shp) return [];
  return store.shipment_events.filter((e) => e.shipment_id === shp.id);
}

export async function getAuditLogs(entityId?: string): Promise<any[]> {
  if (isNeonConfigured) {
    if (entityId) {
      return executeQuery(`SELECT * FROM audit_logs WHERE entity_id = $1 ORDER BY created_at DESC`, [entityId]);
    }
    return executeQuery(`SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 50`);
  }

  const store = getFallbackStore();
  if (entityId) {
    return store.audit_logs.filter((a) => a.entity_id === entityId);
  }
  return store.audit_logs;
}
