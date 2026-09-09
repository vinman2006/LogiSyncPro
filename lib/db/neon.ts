import { neon, Pool } from '@neondatabase/serverless';

// Neon database connection string (Server-side ONLY)
const DATABASE_URL = process.env.DATABASE_URL || '';

export const isNeonConfigured = Boolean(
  DATABASE_URL &&
  !DATABASE_URL.includes('placeholder') &&
  DATABASE_URL.startsWith('postgres')
);

// Fallback in-memory data store when DATABASE_URL is not supplied
export interface MockStore {
  users: Array<{ id: string; firebase_uid: string; email: string; name: string; display_name: string; created_at: string }>;
  user_profiles: Array<{ id: string; user_id: string; country: string; country_code: string; region?: string; region_code?: string; city: string; phone?: string; created_at: string }>;
  businesses: Array<{ id: string; user_id?: string; owner_id?: string; business_name: string; name: string; business_type: string; role: string; country: string; country_code: string; region: string; region_code: string; city: string; status: string; created_at: string }>;
  nodes: Array<{ id: string; business_id: string; owner_id?: string; node_code: string; name: string; node_type?: string; role: string; country: string; city: string; region?: string; status: string; commodities_handled: string[]; created_at: string }>;
  shipments: Array<{
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
    status: string;
    is_demo?: boolean;
    demo_user_id?: string;
    created_at: string;
    updated_at: string;
  }>;
  shipment_events: Array<{ id: string; shipment_id: string; event_type: string; actor_id?: string; location?: string; metadata?: any; created_at: string }>;
  shipment_locations: Array<{ id: string; shipment_id: string; latitude: number; longitude: number; location_name: string; timestamp: string }>;
  payments: Array<{
    id: string;
    shipment_id: string;
    payer_id?: string;
    payee_id?: string;
    amount: number;
    currency: string;
    method: string;
    status: string;
    provider_reference?: string;
    transaction_hash?: string;
    idempotency_key?: string;
    metadata?: any;
    created_at: string;
    verified_at?: string;
  }>;
  wallet_connections: Array<{ id: string; user_id: string; wallet_type: string; wallet_address: string; network: string; connected_at: string }>;
  audit_logs: Array<{ id: string; entity_type: string; entity_id: string; action: string; actor_id?: string; metadata?: any; created_at: string }>;
  notifications: Array<{ id: string; user_id?: string; type: string; title: string; message: string; entity_type?: string; entity_id?: string; read: boolean; created_at: string }>;
}

// Global reference for fallback store across HMR
declare global {
  // eslint-disable-next-line no-var
  var __logisync_db__: MockStore | undefined;
}

function createInitialStore(): MockStore {
  const farmerBizId = 'biz-farmer-001';
  const distributorBizId = 'biz-dist-001';
  const collectorBizId = 'biz-coll-001';

  const farmerNodeId = 'node-farmer-001';
  const distributorNodeId = 'node-dist-001';
  const collectorNodeId = 'node-coll-001';

  return {
    users: [
      { id: 'usr-farmer-01', firebase_uid: 'demo-farmer-uid', email: 'farmer@logisync.com', name: 'Rajesh Patil', display_name: 'Rajesh Patil (Farmer)', created_at: new Date().toISOString() },
      { id: 'usr-dist-01', firebase_uid: 'demo-distributor-uid', email: 'distributor@logisync.com', name: 'Pune Logistics Admin', display_name: 'Pune Fresh Logistics Admin', created_at: new Date().toISOString() },
      { id: 'usr-coll-01', firebase_uid: 'demo-collector-uid', email: 'collector@logisync.com', name: 'Pune Collector Desk', display_name: 'Pune Produce Collector Desk', created_at: new Date().toISOString() },
    ],
    user_profiles: [
      { id: 'prof-1', user_id: 'usr-farmer-01', country: 'India', country_code: 'IN', region: 'Maharashtra', region_code: 'MH', city: 'Nashik', created_at: new Date().toISOString() },
      { id: 'prof-2', user_id: 'usr-dist-01', country: 'India', country_code: 'IN', region: 'Maharashtra', region_code: 'MH', city: 'Pune', created_at: new Date().toISOString() },
      { id: 'prof-3', user_id: 'usr-coll-01', country: 'India', country_code: 'IN', region: 'Maharashtra', region_code: 'MH', city: 'Pune', created_at: new Date().toISOString() },
    ],
    businesses: [
      { id: farmerBizId, user_id: 'usr-farmer-01', owner_id: 'usr-farmer-01', business_name: 'Maharashtra Orange Farm', name: 'Maharashtra Orange Farm', business_type: 'FARMER', role: 'FARMER', country: 'India', country_code: 'IN', region: 'Maharashtra', region_code: 'MH', city: 'Nashik', status: 'VERIFIED', created_at: new Date().toISOString() },
      { id: distributorBizId, user_id: 'usr-dist-01', owner_id: 'usr-dist-01', business_name: 'Pune Fresh Logistics', name: 'Pune Fresh Logistics', business_type: 'DISTRIBUTOR', role: 'DISTRIBUTOR', country: 'India', country_code: 'IN', region: 'Maharashtra', region_code: 'MH', city: 'Pune', status: 'VERIFIED', created_at: new Date().toISOString() },
      { id: collectorBizId, user_id: 'usr-coll-01', owner_id: 'usr-coll-01', business_name: 'Pune City Produce Collector', name: 'Pune City Produce Collector', business_type: 'COLLECTOR', role: 'COLLECTOR', country: 'India', country_code: 'IN', region: 'Maharashtra', region_code: 'MH', city: 'Pune', status: 'VERIFIED', created_at: new Date().toISOString() },
    ],
    nodes: [
      {
        id: farmerNodeId,
        business_id: farmerBizId,
        owner_id: 'usr-farmer-01',
        node_code: 'NODE-FARM-NSK',
        name: 'Maharashtra Orange Farm (Nashik)',
        node_type: 'FARMER',
        role: 'FARMER',
        country: 'India',
        city: 'Nashik',
        region: 'Maharashtra',
        status: 'VERIFIED',
        commodities_handled: ['Oranges', 'Grapes', 'Pomegranates'],
        created_at: new Date().toISOString(),
      },
      {
        id: distributorNodeId,
        business_id: distributorBizId,
        owner_id: 'usr-dist-01',
        node_code: 'NODE-DIST-PUN',
        name: 'Pune Fresh Logistics Hub',
        node_type: 'DISTRIBUTOR',
        role: 'DISTRIBUTOR',
        country: 'India',
        city: 'Pune',
        region: 'Maharashtra',
        status: 'VERIFIED',
        commodities_handled: ['Oranges', 'Vegetables', 'Fruits', 'Agri-Produce'],
        created_at: new Date().toISOString(),
      },
      {
        id: collectorNodeId,
        business_id: collectorBizId,
        owner_id: 'usr-coll-01',
        node_code: 'NODE-COLL-PUN',
        name: 'Pune City Produce Collector (Market Yard)',
        node_type: 'COLLECTOR',
        role: 'COLLECTOR',
        country: 'India',
        city: 'Pune',
        region: 'Maharashtra',
        status: 'VERIFIED',
        commodities_handled: ['Oranges', 'Citrus', 'Fruits', 'Perishables'],
        created_at: new Date().toISOString(),
      },
    ],
    shipments: [
      {
        id: 'shp-seed-001',
        readable_id: 'LS-2026-000001',
        distributor_node_id: distributorNodeId,
        collector_node_id: collectorNodeId,
        farmer_node_id: farmerNodeId,
        commodity: 'Oranges',
        expected_quantity: 1000,
        received_quantity: 980,
        unit: 'kg',
        origin: 'Maharashtra',
        destination: 'Pune',
        value: 50000,
        currency: 'INR',
        status: 'ACCEPTED',
        is_demo: true,
        created_at: new Date(Date.now() - 3600000).toISOString(),
        updated_at: new Date().toISOString(),
      },
    ],
    shipment_events: [
      {
        id: 'evt-001',
        shipment_id: 'shp-seed-001',
        event_type: 'SHIPMENT_CREATED',
        location: 'Nashik',
        metadata: { commodity: 'Oranges', quantity: 1000, unit: 'kg' },
        created_at: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: 'evt-002',
        shipment_id: 'shp-seed-001',
        event_type: 'COLLECTOR_REQUESTED',
        location: 'Pune',
        metadata: { collector: 'Pune City Produce Collector' },
        created_at: new Date(Date.now() - 3500000).toISOString(),
      },
      {
        id: 'evt-003',
        shipment_id: 'shp-seed-001',
        event_type: 'COLLECTOR_ACCEPTED',
        location: 'Pune',
        metadata: { message: 'Shipment accepted by collector' },
        created_at: new Date(Date.now() - 3400000).toISOString(),
      },
    ],
    shipment_locations: [
      { id: 'loc-1', shipment_id: 'shp-seed-001', latitude: 20.011, longitude: 73.7903, location_name: 'Nashik Farm Hub', timestamp: new Date(Date.now() - 3600000).toISOString() },
    ],
    payments: [],
    wallet_connections: [],
    audit_logs: [
      { id: 'aud-001', entity_type: 'SHIPMENT', entity_id: 'LS-2026-000001', action: 'CREATED', metadata: { created_by: 'Pune Fresh Logistics' }, created_at: new Date(Date.now() - 3600000).toISOString() },
      { id: 'aud-002', entity_type: 'SHIPMENT', entity_id: 'LS-2026-000001', action: 'COLLECTOR_ACCEPTED', metadata: { accepted_by: 'Pune City Produce Collector' }, created_at: new Date(Date.now() - 3400000).toISOString() },
    ],
    notifications: [
      {
        id: 'notif-001',
        type: 'SHIPMENT_ACCEPTED',
        title: 'Shipment Accepted',
        message: 'Pune City Produce Collector accepted shipment LS-2026-000001 (1,000 kg Oranges).',
        entity_type: 'SHIPMENT',
        entity_id: 'LS-2026-000001',
        read: false,
        created_at: new Date(Date.now() - 3400000).toISOString(),
      },
    ],
  };
}

export function getFallbackStore(): MockStore {
  if (!global.__logisync_db__) {
    global.__logisync_db__ = createInitialStore();
  }
  return global.__logisync_db__;
}

// SQL query runner against Neon Postgres with graceful fallback
export async function executeQuery<T = any>(sqlQuery: string, params: any[] = []): Promise<T[]> {
  if (isNeonConfigured) {
    try {
      const pool = new Pool({ connectionString: DATABASE_URL });
      const res = await pool.query(sqlQuery, params);
      await pool.end();
      return res.rows as T[];
    } catch (err) {
      console.warn('[Neon Database] Query error, falling back to local store:', err);
    }
  }

  // Neon not configured or failed - return empty for raw SQL, or route to fallback operations
  return [];
}

// Helper to auto-initialize tables on Neon if configured
export async function initializeNeonDatabase(): Promise<{ success: boolean; message: string }> {
  if (!isNeonConfigured) {
    return {
      success: true,
      message: 'Running in resilient development mode with pre-seeded Oranges supply chain.',
    };
  }

  try {
    const sql = neon(DATABASE_URL);

    // Create tables
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        firebase_uid VARCHAR(128) UNIQUE NOT NULL,
        email VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        display_name VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS user_profiles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        country VARCHAR(100) NOT NULL,
        country_code VARCHAR(10) NOT NULL,
        region VARCHAR(100),
        region_code VARCHAR(10),
        city VARCHAR(100),
        phone VARCHAR(50),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS businesses (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
        business_name VARCHAR(255),
        name VARCHAR(255) NOT NULL,
        business_type VARCHAR(50) NOT NULL,
        role VARCHAR(50),
        country VARCHAR(100) NOT NULL,
        country_code VARCHAR(10),
        region VARCHAR(100),
        region_code VARCHAR(10),
        city VARCHAR(100) NOT NULL,
        status VARCHAR(50) DEFAULT 'VERIFIED',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS nodes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
        owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
        node_code VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        node_type VARCHAR(50),
        role VARCHAR(50) NOT NULL,
        country VARCHAR(100) NOT NULL,
        region VARCHAR(100),
        city VARCHAR(100) NOT NULL,
        status VARCHAR(50) DEFAULT 'ACTIVE',
        commodities_handled TEXT[] DEFAULT ARRAY['Oranges'],
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS shipments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        readable_id VARCHAR(50) UNIQUE NOT NULL,
        distributor_node_id UUID REFERENCES nodes(id),
        collector_node_id UUID REFERENCES nodes(id),
        farmer_node_id UUID REFERENCES nodes(id),
        commodity VARCHAR(100) NOT NULL DEFAULT 'Oranges',
        expected_quantity NUMERIC(12, 2) NOT NULL,
        received_quantity NUMERIC(12, 2),
        unit VARCHAR(20) NOT NULL DEFAULT 'kg',
        origin VARCHAR(255) NOT NULL,
        destination VARCHAR(255) NOT NULL,
        value NUMERIC(12, 2) NOT NULL,
        currency VARCHAR(10) NOT NULL DEFAULT 'INR',
        status VARCHAR(50) NOT NULL DEFAULT 'REQUESTED',
        is_demo BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    // Resilient column migrations for existing databases
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS name VARCHAR(255);`;
    await sql`ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS region VARCHAR(100);`;
    await sql`ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS region_code VARCHAR(10);`;
    await sql`ALTER TABLE businesses ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE;`;
    await sql`ALTER TABLE businesses ADD COLUMN IF NOT EXISTS business_name VARCHAR(255);`;
    await sql`ALTER TABLE businesses ADD COLUMN IF NOT EXISTS role VARCHAR(50);`;
    await sql`ALTER TABLE businesses ADD COLUMN IF NOT EXISTS country_code VARCHAR(10);`;
    await sql`ALTER TABLE businesses ADD COLUMN IF NOT EXISTS region VARCHAR(100);`;
    await sql`ALTER TABLE businesses ADD COLUMN IF NOT EXISTS region_code VARCHAR(10);`;
    await sql`ALTER TABLE nodes ADD COLUMN IF NOT EXISTS node_type VARCHAR(50);`;
    await sql`ALTER TABLE nodes ADD COLUMN IF NOT EXISTS region VARCHAR(100);`;
    await sql`ALTER TABLE shipments ADD COLUMN IF NOT EXISTS is_demo BOOLEAN DEFAULT FALSE;`;

    await sql`
      CREATE TABLE IF NOT EXISTS shipment_events (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        shipment_id UUID REFERENCES shipments(id) ON DELETE CASCADE,
        event_type VARCHAR(100) NOT NULL,
        actor_id UUID REFERENCES users(id),
        location VARCHAR(255),
        metadata JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS shipment_locations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        shipment_id UUID REFERENCES shipments(id) ON DELETE CASCADE,
        latitude NUMERIC(10, 6) NOT NULL,
        longitude NUMERIC(10, 6) NOT NULL,
        location_name VARCHAR(255),
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS payments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        shipment_id UUID REFERENCES shipments(id) ON DELETE CASCADE,
        payer_id UUID REFERENCES users(id),
        payee_id UUID REFERENCES users(id),
        amount NUMERIC(12, 2) NOT NULL,
        currency VARCHAR(10) NOT NULL DEFAULT 'INR',
        method VARCHAR(50) NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
        provider_reference VARCHAR(255),
        transaction_hash VARCHAR(255),
        idempotency_key VARCHAR(255) UNIQUE,
        metadata JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        verified_at TIMESTAMP WITH TIME ZONE
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS wallet_connections (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        wallet_type VARCHAR(50) NOT NULL,
        wallet_address VARCHAR(255) NOT NULL,
        network VARCHAR(100) NOT NULL,
        connected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        entity_type VARCHAR(100) NOT NULL,
        entity_id VARCHAR(255) NOT NULL,
        action VARCHAR(100) NOT NULL,
        actor_id UUID REFERENCES users(id),
        metadata JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS notifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(100) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        entity_type VARCHAR(100),
        entity_id VARCHAR(255),
        read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    // Seed default nodes if empty
    const existingNodes = await sql`SELECT count(*) as count FROM nodes`;
    if (Number(existingNodes[0]?.count) === 0) {
      // Seed default business and nodes
      const bizFarmer = await sql`
        INSERT INTO businesses (name, business_type, country, city, status)
        VALUES ('Maharashtra Orange Farm', 'FARMER', 'India', 'Nashik', 'VERIFIED')
        RETURNING id
      `;
      const bizDist = await sql`
        INSERT INTO businesses (name, business_type, country, city, status)
        VALUES ('Pune Fresh Logistics', 'DISTRIBUTOR', 'India', 'Pune', 'VERIFIED')
        RETURNING id
      `;
      const bizColl = await sql`
        INSERT INTO businesses (name, business_type, country, city, status)
        VALUES ('Pune City Produce Collector', 'COLLECTOR', 'India', 'Pune', 'VERIFIED')
        RETURNING id
      `;

      await sql`
        INSERT INTO nodes (business_id, node_code, name, role, country, city, status, commodities_handled)
        VALUES 
          (${bizFarmer[0].id}, 'NODE-FARM-NSK', 'Maharashtra Orange Farm (Nashik)', 'FARMER', 'India', 'Nashik', 'VERIFIED', ARRAY['Oranges', 'Grapes']),
          (${bizDist[0].id}, 'NODE-DIST-PUN', 'Pune Fresh Logistics Hub', 'DISTRIBUTOR', 'India', 'Pune', 'VERIFIED', ARRAY['Oranges', 'Perishables']),
          (${bizColl[0].id}, 'NODE-COLL-PUN', 'Pune City Produce Collector (Market Yard)', 'COLLECTOR', 'India', 'Pune', 'VERIFIED', ARRAY['Oranges', 'Citrus', 'Fruits'])
      `;
    }

    return {
      success: true,
      message: 'Neon PostgreSQL tables and default Oranges supply chain initialized successfully.',
    };
  } catch (err: any) {
    console.error('[Neon Init Error]:', err);
    return {
      success: false,
      message: `Neon initialization failed: ${err.message}`,
    };
  }
}
