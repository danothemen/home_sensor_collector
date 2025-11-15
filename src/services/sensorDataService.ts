import { pool } from "../config/database";

export interface SensorDataInput {
  water_temperature: number;
  coop_temperature: number;
  outside_air_temperature: number;
  override_active: boolean;
  relay_on: boolean;
}

export interface SensorData extends SensorDataInput {
  id: number;
  reported_timestamp: Date;
  created_at: Date;
}

export async function createSensorData(
  data: SensorDataInput
): Promise<SensorData> {
  const query = `
    INSERT INTO sensor_data (
      reported_timestamp,
      water_temperature,
      coop_temperature,
      outside_air_temperature,
      override_active,
      relay_on
    )
    VALUES (NOW(), $1, $2, $3, $4, $5)
    RETURNING *
  `;

  const values = [
    data.water_temperature,
    data.coop_temperature,
    data.outside_air_temperature,
    data.override_active,
    data.relay_on,
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
}

export async function getSensorData(): Promise<SensorData[]> {
  const query = `
    SELECT *
    FROM sensor_data
    ORDER BY reported_timestamp DESC
    LIMIT 100
  `;

  const result = await pool.query(query);
  return result.rows;
}
