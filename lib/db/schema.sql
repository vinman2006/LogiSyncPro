-- LogiSync PostgreSQL Schema

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firebase_uid VARCHAR(128) UNIQUE NOT NULL,
  email VARCHAR(255) NOT NULL,
  display_name VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  country VARCHAR(100) NOT NULL,
  country_code VARCHAR(10) NOT NULL,
  city VARCHAR(100),
  phone VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  business_type VARCHAR(50) NOT NULL, -- 'FARMER', 'DISTRIBUTOR', 'COLLECTOR'
  country VARCHAR(100) NOT NULL,
  city VARCHAR(100) NOT NULL,
  status VARCHAR(50) DEFAULT 'VERIFIED',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
  node_code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL, -- 'FARMER', 'DISTRIBUTOR', 'COLLECTOR'
  country VARCHAR(100) NOT NULL,
  city VARCHAR(100) NOT NULL,
  status VARCHAR(50) DEFAULT 'ACTIVE', -- 'ACTIVE', 'INACTIVE', 'PENDING', 'VERIFIED'
  commodities_handled TEXT[] DEFAULT ARRAY['Oranges'],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS shipment_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id UUID REFERENCES shipments(id) ON DELETE CASCADE,
  event_type VARCHAR(100) NOT NULL,
  actor_id UUID REFERENCES users(id),
  location VARCHAR(255),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS shipment_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id UUID REFERENCES shipments(id) ON DELETE CASCADE,
  latitude NUMERIC(10, 6) NOT NULL,
  longitude NUMERIC(10, 6) NOT NULL,
  location_name VARCHAR(255),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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

CREATE TABLE IF NOT EXISTS wallet_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  wallet_type VARCHAR(50) NOT NULL,
  wallet_address VARCHAR(255) NOT NULL,
  network VARCHAR(100) NOT NULL,
  connected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type VARCHAR(100) NOT NULL,
  entity_id VARCHAR(255) NOT NULL,
  action VARCHAR(100) NOT NULL,
  actor_id UUID REFERENCES users(id),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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

-- Indexes for rapid lookup
CREATE INDEX IF NOT EXISTS idx_users_firebase_uid ON users(firebase_uid);
CREATE INDEX IF NOT EXISTS idx_nodes_role ON nodes(role);
CREATE INDEX IF NOT EXISTS idx_shipments_distributor ON shipments(distributor_node_id);
CREATE INDEX IF NOT EXISTS idx_shipments_collector ON shipments(collector_node_id);
CREATE INDEX IF NOT EXISTS idx_shipments_status ON shipments(status);
CREATE INDEX IF NOT EXISTS idx_shipment_events_shipment_id ON shipment_events(shipment_id);
CREATE INDEX IF NOT EXISTS idx_payments_shipment_id ON payments(shipment_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
