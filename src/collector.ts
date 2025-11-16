import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { pool } from "./config/database";
import { runMigrations } from "./migrations/runMigrations";
import {
  createSensorData,
  SensorDataInput,
} from "./services/sensorDataService";

dotenv.config();

const app = express();
const PORT = process.env.COLLECTOR_PORT || 3000;

// Middleware
app.use((req, res, next) => {
  // Record the start time of the request
  const start = Date.now();

  // Log incoming request details
  console.log(
    `[${new Date().toISOString()}] -> INBOUND: ${req.method} ${req.originalUrl}`
  );
  console.log(req.body);

  // Set up listener for when the response finishes/closes
  res.on("finish", () => {
    const duration = Date.now() - start;

    // Log response details, including status code and duration
    console.log(
      `[${new Date().toISOString()}] <- OUTBOUND: ${req.method} ${
        req.originalUrl
      } - Status: ${res.statusCode} - Duration: ${duration}ms`
    );
  });

  // Continue to the next middleware or route handler
  next();
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Sensor data endpoint
app.post("/api/sensor-data", async (req: Request, res: Response) => {
  console.log(req);
  try {
    const {
      water_temperature,
      coop_temperature,
      outside_air_temperature,
      override_active,
      relay_on,
    } = req.body;
    console.log(req.body);

    // Validation
    if (
      typeof water_temperature !== "number" ||
      typeof coop_temperature !== "number" ||
      typeof outside_air_temperature !== "number" ||
      typeof override_active !== "boolean" ||
      typeof relay_on !== "boolean"
    ) {
      return res.status(400).json({
        error: "Invalid request body",
        message:
          "All fields are required: water_temperature (number), coop_temperature (number), outside_air_temperature (number), override_active (boolean), relay_on (boolean)",
      });
    }

    // Check for NaN or Infinity
    if (
      !isFinite(water_temperature) ||
      !isFinite(coop_temperature) ||
      !isFinite(outside_air_temperature)
    ) {
      return res.status(400).json({
        error: "Invalid temperature values",
        message: "Temperature values must be valid numbers",
      });
    }

    const sensorData: SensorDataInput = {
      water_temperature,
      coop_temperature,
      outside_air_temperature,
      override_active,
      relay_on,
    };

    const savedData = await createSensorData(sensorData);

    res.status(201).json({
      message: "Sensor data saved successfully",
      data: savedData,
    });
  } catch (error) {
    console.error("Error saving sensor data:", error);
    res.status(500).json({
      error: "Internal server error",
      message:
        error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
});

// Initialize server
async function startServer() {
  try {
    // Run migrations on startup
    await runMigrations();
    console.log("Database migrations completed");

    // Start server
    app.listen(PORT, () => {
      console.log(`Collector server is running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
    });
  } catch (error) {
    console.error("Failed to start collector server:", error);
    process.exit(1);
  }
}

startServer();

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM signal received: closing HTTP server");
  await pool.end();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("SIGINT signal received: closing HTTP server");
  await pool.end();
  process.exit(0);
});
