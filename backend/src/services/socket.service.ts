import { Server as SocketIOServer } from "socket.io";
import type { Server as HTTPServer } from "http";
import type {
  AssignmentCompletedPayload,
  StatusUpdatePayload,
} from "@veda-ai/shared";
import { getRedisConnection } from "../config/redis";

let io: SocketIOServer | null = null;
const REDIS_WS_CHANNEL = "vedaai:ws-events";

function broadcastAssignmentCompletedLocal(payload: AssignmentCompletedPayload): void {
  if (!io) return;

  io.to(`assignment:${payload.assignmentId}`).emit("assignment:completed", payload);
  io.emit("assignment:status_update", {
    assignmentId: payload.assignmentId,
    status: payload.status,
    resultId: payload.resultId,
  });

  console.log(`[WebSocket] Emitted assignment:completed for ${payload.assignmentId}`);
}

function broadcastAssignmentProcessingLocal(assignmentId: string): void {
  if (!io) return;

  io.emit("assignment:status_update", {
    assignmentId,
    status: "processing",
  });

  console.log(`[WebSocket] Emitted assignment:processing for ${assignmentId}`);
}

function publishSocketEvent(event: {
  type: "assignment:completed" | "assignment:status_update";
  payload: AssignmentCompletedPayload | StatusUpdatePayload;
}) {
  const redis = getRedisConnection();
  redis.publish(REDIS_WS_CHANNEL, JSON.stringify(event));
}

function handleRedisSocketEvent(message: string): void {
  try {
    const event = JSON.parse(message) as {
      type: "assignment:completed" | "assignment:status_update";
      payload: AssignmentCompletedPayload | StatusUpdatePayload;
    };

    if (!event || !event.type || !event.payload) {
      return;
    }

    if (event.type === "assignment:completed") {
      broadcastAssignmentCompletedLocal(event.payload as AssignmentCompletedPayload);
    }

    if (event.type === "assignment:status_update") {
      const payload = event.payload as StatusUpdatePayload;
      io?.emit("assignment:status_update", payload);
    }
  } catch (err) {
    console.error("[WebSocket] Failed to parse Redis socket event:", err);
  }
}

export function initSocketIO(httpServer: HTTPServer): SocketIOServer {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
    },
    transports: ["websocket", "polling"],
  });

  io.on("connection", (socket) => {
    console.log(`[WebSocket] Client connected: ${socket.id}`);

    socket.on("subscribe:assignment", (assignmentId: string) => {
      socket.join(`assignment:${assignmentId}`);
      console.log(
        `[WebSocket] Client ${socket.id} subscribed to assignment:${assignmentId}`
      );
    });

    socket.on("unsubscribe:assignment", (assignmentId: string) => {
      socket.leave(`assignment:${assignmentId}`);
    });

    socket.on("disconnect", (reason) => {
      console.log(`[WebSocket] Client disconnected: ${socket.id} — ${reason}`);
    });
  });

  const redisSubscriber = getRedisConnection().duplicate();

  redisSubscriber.on("error", (err) => {
    console.error("[WebSocket] Redis subscriber error:", err.message);
  });

  redisSubscriber.subscribe(REDIS_WS_CHANNEL).then(() => {
    console.log(`[WebSocket] Subscribed to Redis channel: ${REDIS_WS_CHANNEL}`);
  });

  redisSubscriber.on("message", (_channel, message) => {
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
    broadcastAssignmentCompletedLocal(payload);
    return;
  }

  publishSocketEvent({ type: "assignment:completed", payload });
  console.log(
    `[WebSocket] Published assignment:completed to Redis for ${payload.assignmentId}`
  );
}

export function emitAssignmentProcessing(assignmentId: string): void {
  if (io) {
    broadcastAssignmentProcessingLocal(assignmentId);
    return;
  }

  publishSocketEvent({
    type: "assignment:status_update",
    payload: {
      assignmentId,
      status: "processing",
    },
  });

  console.log(`[WebSocket] Published assignment:processing to Redis for ${assignmentId}`);
}
