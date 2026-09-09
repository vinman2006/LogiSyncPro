import { Pool } from '@neondatabase/serverless';

async function checkDb() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    const res = await pool.query(`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`);
    console.log('Neon Tables:', res.rows.map(r => r.table_name));

    for (const t of res.rows.map(r => r.table_name)) {
      const count = await pool.query(`SELECT count(*) FROM "${t}"`);
      console.log(`Table ${t}: ${count.rows[0].count} rows`);
    }
  } catch (err) {
    console.error('Query error:', err);
  } finally {
    await pool.end();
  }
}

checkDb();
