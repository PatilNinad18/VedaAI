import { useEffect } from "react";
import { getSocket } from "../services/websocket.service";
import { useVedaStore } from "../store/veda.store";
import type { StatusUpdatePayload } from "../types";

/**
 * useGlobalStatusListener
 *
 * Attaches a global Socket.io listener that updates assignment statuses
 * in the Zustand store whenever the backend emits assignment:status_update.
 * Mount this once at the App root level.
 */
export function useGlobalStatusListener(): void {
  const updateAssignmentStatus = useVedaStore(
    (s) => s.updateAssignmentStatus
  );

  useEffect(() => {
    const sock = getSocket();

    const handler = (payload: StatusUpdatePayload) => {
      updateAssignmentStatus(
        payload.assignmentId,
        payload.status,
        payload.resultId
      );
    };

    sock.on("assignment:status_update", handler);

    return () => {
      sock.off("assignment:status_update", handler);
    };
  }, [updateAssignmentStatus]);
}
