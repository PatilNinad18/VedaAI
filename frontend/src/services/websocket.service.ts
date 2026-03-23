import { io, Socket } from "socket.io-client";
import type {
  AssignmentCompletedPayload,
  StatusUpdatePayload,
} from "../types";

const WS_URL =
  (process.env.NEXT_PUBLIC_WS_URL || "http://localhost:4000")
    .replace(/^http/, "ws")
    .replace(/\/+$/g, "");

// ─── Typed event map ───────────────────────────────────────────────────────────

interface ServerToClientEvents {
  "assignment:completed": (payload: AssignmentCompletedPayload) => void;
  "assignment:status_update": (payload: StatusUpdatePayload) => void;
}

interface ClientToServerEvents {
  "subscribe:assignment": (assignmentId: string) => void;
  "unsubscribe:assignment": (assignmentId: string) => void;
}

type VedaSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

// ─── Singleton socket instance ────────────────────────────────────────────────

let socket: VedaSocket | null = null;

export function getSocket(): VedaSocket {
  if (!socket) {
    socket = io(WS_URL, {
      transports: ["websocket", "polling"],
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 3,
    });

    socket.on("connect", () => {
      console.log("[WebSocket] Connected — id:", socket?.id);
    });

    socket.on("disconnect", (reason) => {
      console.warn("[WebSocket] Disconnected:", reason);
    });

    socket.on("connect_error", (err) => {
      console.error("[WebSocket] Connection error:", err.message);
    });
  }

  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

// ─── Helper: subscribe to a specific assignment room ─────────────────────────

export function subscribeToAssignment(assignmentId: string): void {
  getSocket().emit("subscribe:assignment", assignmentId);
}

export function unsubscribeFromAssignment(assignmentId: string): void {
  getSocket().emit("unsubscribe:assignment", assignmentId);
}

// ─── Helper: one-shot listener for a specific assignment completion ───────────

export function waitForAssignmentCompletion(
  assignmentId: string,
  onComplete: (payload: AssignmentCompletedPayload) => void,
  onStatusUpdate?: (payload: StatusUpdatePayload) => void
): () => void {
  const sock = getSocket();

  subscribeToAssignment(assignmentId);

  const handleComplete = (payload: AssignmentCompletedPayload) => {
    if (payload.assignmentId === assignmentId) {
      onComplete(payload);
    }
  };

  const handleStatusUpdate = (payload: StatusUpdatePayload) => {
    if (payload.assignmentId === assignmentId && onStatusUpdate) {
      onStatusUpdate(payload);
    }
  };

  sock.on("assignment:completed", handleComplete);
  sock.on("assignment:status_update", handleStatusUpdate);

  // Return cleanup function
  return () => {
    sock.off("assignment:completed", handleComplete);
    sock.off("assignment:status_update", handleStatusUpdate);
    unsubscribeFromAssignment(assignmentId);
  };
}
