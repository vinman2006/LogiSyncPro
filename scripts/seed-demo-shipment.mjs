import { Pool } from '@neondatabase/serverless';

async function seedShipment() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    const nodes = await pool.query('SELECT * FROM nodes');
    console.log('Nodes in Neon:', nodes.rows.map(n => ({ id: n.id, role: n.role, name: n.name })));

    const dist = nodes.rows.find(n => n.role === 'DISTRIBUTOR') || nodes.rows[0];
    const coll = nodes.rows.find(n => n.role === 'COLLECTOR') || nodes.rows[1];
    const farm = nodes.rows.find(n => n.role === 'FARMER') || nodes.rows[2];

    const existing = await pool.query('SELECT count(*) FROM shipments');
    if (Number(existing.rows[0].count) === 0) {
      const inserted = await pool.query(`
        INSERT INTO shipments (
          readable_id, distributor_node_id, collector_node_id, farmer_node_id,
          commodity, expected_quantity, unit, origin, destination, value, currency, status, is_demo
        ) VALUES (
          'LS-2026-000001', $1, $2, $3, 'Oranges', 1000, 'kg', 'Nashik, Maharashtra', 'Market Yard, Pune', 50000, 'INR', 'ACCEPTED', TRUE
        ) RETURNING *
      `, [dist.id, coll.id, farm.id]);
      console.log('Seed shipment created in Neon:', inserted.rows[0]);

      // Seed event
      await pool.query(`
        INSERT INTO shipment_events (shipment_id, event_type, location, metadata)
        VALUES ($1, 'SHIPMENT_CREATED', 'Nashik, Maharashtra', $2)
      `, [inserted.rows[0].id, JSON.stringify({ commodity: 'Oranges', quantity: 1000 })]);

      console.log('Seed event recorded');
    } else {
      console.log('Shipments already exist:', existing.rows[0].count);
    }
  } catch (err) {
    console.error('Error seeding shipment:', err);
  } finally {
    await pool.end();
  }
}

seedShipment();
