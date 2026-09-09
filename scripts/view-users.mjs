import { Pool } from '@neondatabase/serverless';

async function inspectData() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    const users = await pool.query('SELECT * FROM users');
    console.log('--- USERS IN NEON (' + users.rows.length + ') ---');
    console.log(users.rows);

    const businesses = await pool.query('SELECT * FROM businesses');
    console.log('--- BUSINESSES IN NEON (' + businesses.rows.length + ') ---');
    console.log(businesses.rows);

    const nodes = await pool.query('SELECT * FROM nodes');
    console.log('--- NODES IN NEON (' + nodes.rows.length + ') ---');
    console.log(nodes.rows);
  } catch (e) {
    console.error(e);
  } finally {
    await pool.end();
  }
}

inspectData();
