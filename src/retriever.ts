import express, { Request, Response } from "express";
import dotenv from "dotenv";
import { getSensorData } from "./services/sensorDataService";

dotenv.config();

const app = express();
const PORT = process.env.RETRIEVER_PORT || 3001;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
});

// Sensor data endpoint
app.get("/api/sensor-data", async (req: Request, res: Response) => {
  try {
    const data = await getSensorData();
    res.status(200).json({
      message: "Sensor data retrieved successfully",
      data,
    });
  } catch (error) {
    console.error("Error retrieving sensor data:", error);
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
    // Start server
    app.listen(PORT, () => {
      console.log(`Retriever server is running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
    });
  } catch (error) {
    console.error("Failed to start retriever server:", error);
    process.exit(1);
  }
}

startServer();
