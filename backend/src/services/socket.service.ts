import { Server as SocketIOServer } from "socket.io";
import type { Server as HTTPServer } from "http";
import type {
  AssignmentCompletedPayload,
  StatusUpdatePayload,
} from "@veda-ai/shared";
import { getRedisConnection } from "../config/redis";

let io: SocketIOServer | null = null;
const REDIS_WS_CHANNEL = "vedaai:ws-events";

function handleRedisSocketEvent(message: string): void {
  try {
    const event = JSON.parse(message);

    if (event.type === "assignment:completed") {
      io?.to(`assignment:${event.payload.assignmentId}`)
        .emit("assignment:completed", event.payload);
    }

    if (event.type === "assignment:status_update") {
      io?.emit("assignment:status_update", event.payload);
    }
  } catch (err) {
    console.error("[WebSocket] Failed to parse event:", err);
  }
}

export function initSocketIO(httpServer: HTTPServer): SocketIOServer {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log(`[WebSocket] Client connected: ${socket.id}`);

    socket.on("subscribe:assignment", (assignmentId: string) => {
      socket.join(`assignment:${assignmentId}`);
    });

    socket.on("disconnect", () => {
      console.log(`[WebSocket] Client disconnected: ${socket.id}`);
    });
  });

  // REDIS SUBSCRIBER
  const subscriber = getRedisConnection().duplicate();

  subscriber.subscribe(REDIS_WS_CHANNEL, (err) => {
    if (err) {
      console.error("[WebSocket] Redis subscribe failed:", err.message);
      return;
    }
    console.log(`[WebSocket] Subscribed to ${REDIS_WS_CHANNEL}`);
  });

  subscriber.on("message", (_channel, message) => {
    handleRedisSocketEvent(message);
  });

  console.log("[WebSocket] Socket.io initialized");
  return io;
}

export function getIO(): SocketIOServer {
  if (!io) {
    throw new Error(
      "Socket.io not initialized. Call initSocketIO(server) first."
    );
  }
  return io;
}

export function emitAssignmentCompleted(
  payload: AssignmentCompletedPayload
): void {
  if (io) {
    io.to(`assignment:${payload.assignmentId}`).emit("assignment:completed", payload);
    io.emit("assignment:status_update", {
      assignmentId: payload.assignmentId,
      status: payload.status,
      resultId: payload.resultId,
    });
    console.log(`[WebSocket] Emitted assignment:completed for ${payload.assignmentId}`);
    return;
  }

  const redis = getRedisConnection();
  redis.publish(REDIS_WS_CHANNEL, JSON.stringify({
    type: "assignment:completed",
    payload
  }));
  console.log(`[WebSocket] Published assignment:completed to Redis for ${payload.assignmentId}`);
}

export function emitAssignmentProcessing(assignmentId: string): void {
  if (io) {
    io.emit("assignment:status_update", {
      assignmentId,
      status: "processing",
    });
    console.log(`[WebSocket] Emitted assignment:processing for ${assignmentId}`);
    return;
  }

  const redis = getRedisConnection();
  redis.publish(REDIS_WS_CHANNEL, JSON.stringify({
    type: "assignment:status_update",
    payload: {
      assignmentId,
      status: "processing",
    },
  }));

  console.log(`[WebSocket] Published assignment:processing to Redis for ${assignmentId}`);
}