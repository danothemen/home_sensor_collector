import { pool } from "../config/database";

export async function runMigrations() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Create sensor_data table
    await client.query(`
      CREATE TABLE IF NOT EXISTS sensor_data (
        id SERIAL PRIMARY KEY,
        reported_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        water_temperature REAL NOT NULL,
        coop_temperature REAL NOT NULL,
        outside_air_temperature REAL NOT NULL,
        override_active BOOLEAN NOT NULL,
        relay_on BOOLEAN NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    // Create index on reported_timestamp for faster queries
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_sensor_data_reported_timestamp 
      ON sensor_data(reported_timestamp DESC)
    `);

    // Create index on created_at for faster queries
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_sensor_data_created_at 
      ON sensor_data(created_at DESC)
    `);

    await client.query("COMMIT");

    console.log("Migrations completed successfully");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Migration failed:", error);
    throw error;
  } finally {
    client.release();
  }
}
