import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { getSensorData } from "./services/sensorDataService";

dotenv.config();

const app = express();
const PORT = process.env.RETRIEVER_PORT || 3001;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Serve static files from the React app
app.use(express.static(path.join(__dirname, "../../frontend/build")));

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
    let since: Date | undefined;
    if (req.query.since) {
      since = new Date(req.query.since as string);
    } else {
      since = new Date();
      since.setDate(since.getDate() - 1);
    }
    const data = await getSensorData(since);
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

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get("*", (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "../../frontend/build/index.html"));
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
