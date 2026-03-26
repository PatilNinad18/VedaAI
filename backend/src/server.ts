import "dotenv/config";
import express from "express";
import { createServer } from "http";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { connectMongoDB } from "./config/database";
import { getRedisConnection } from "./config/redis";
import { initSocketIO } from "./services/socket.service";
import { getGeneratePaperQueue } from "./queues/generatePaper.queue";
import routes from "./routes/index";
import { notFoundHandler, errorHandler } from "./middleware/errorHandler";

const PORT = parseInt(process.env.PORT || "4000", 10);
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

async function bootstrap(): Promise<void> {
  await connectMongoDB();

  const redis = getRedisConnection();
  try {
    await redis.ping();
    console.log("[Redis] Ping OK");
  } catch (err) {
    console.log("[Redis] Ping failed (using mock):", err.message);
  }

  getGeneratePaperQueue();

  const app = express();

  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(
    cors({
      origin: FRONTEND_URL,
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

  app.get("/health", (_req, res) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      services: { mongodb: "connected", redis: "connected" },
    });
  });

  app.use("/api", routes);
  app.use(notFoundHandler);
  app.use(errorHandler);

  const httpServer = createServer(app);
  initSocketIO(httpServer);

  httpServer.listen(PORT, () => {
    console.log(`\n✅ VedaAI Backend running on http://localhost:${PORT}`);
    console.log(`   WebSocket: ws://localhost:${PORT}`);
    console.log(`   Health:    http://localhost:${PORT}/health`);
    console.log(`   API:       http://localhost:${PORT}/api\n`);
  });

  const shutdown = async (signal: string) => {
    console.log(`\n[Server] ${signal} received. Shutting down gracefully...`);
    httpServer.close(async () => {
      const { default: mongoose } = await import("mongoose");
      await mongoose.connection.close();
      redis.disconnect();
      console.log("[Server] Shutdown complete");
      process.exit(0);
    });
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

bootstrap().catch((err) => {
  console.error("[Server] Failed to start:", err);
  process.exit(1);
});
