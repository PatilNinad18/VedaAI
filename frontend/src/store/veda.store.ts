import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type {
  AssignmentDocument,
  ResultDocument,
  CreateAssignmentPayload,
  AssignmentStatus,
} from "../types";
import {
  createAssignment as apiCreate,
  fetchAssignments as apiFetchAll,
  deleteAssignment as apiDelete,
  fetchResultById,
  fetchResultByAssignment,
} from "../services/api.service";
import {
  waitForAssignmentCompletion,
} from "../services/websocket.service";

// ─── State shape ───────────────────────────────────────────────────────────────

export type AppScreen =
  | "empty"
  | "list"
  | "create"
  | "generating"
  | "output";

interface VedaStore {
  // Navigation
  screen: AppScreen;
  setScreen: (screen: AppScreen) => void;

  // Assignments
  assignments: AssignmentDocument[];
  assignmentsLoaded: boolean;
  loadAssignments: () => Promise<void>;

  // Current in-flight assignment
  pendingAssignmentId: string | null;

  // Submission
  submitAssignment: (payload: CreateAssignmentPayload) => Promise<void>;

  // Result
  currentResult: ResultDocument | null;
  currentAssignment: AssignmentDocument | null;
  loadResult: (assignmentId: string) => Promise<void>;
  viewAssignment: (assignment: AssignmentDocument) => Promise<void>;

  // Delete
  deleteAssignment: (id: string) => Promise<void>;

  // Loading / error
  isLoading: boolean;
  error: string | null;
  setError: (err: string | null) => void;

  // Status update from WebSocket
  updateAssignmentStatus: (
    id: string,
    status: AssignmentStatus,
    resultId?: string
  ) => void;
}

// ─── Store implementation ──────────────────────────────────────────────────────

export const useVedaStore = create<VedaStore>()(
  devtools(
    (set, get) => ({
      screen: "empty",
      setScreen: (screen) => set({ screen }),

      assignments: [],
      assignmentsLoaded: false,

      pendingAssignmentId: null,
      currentResult: null,
      currentAssignment: null,
      isLoading: false,
      error: null,

      setError: (error) => set({ error }),

      // ── Load all assignments from API ──────────────────────────────────────
      loadAssignments: async () => {
        set({ isLoading: true, error: null });
        try {
          const { assignments } = await apiFetchAll();
          set({
            assignments,
            assignmentsLoaded: true,
            screen: assignments.length > 0 ? "list" : "empty",
          });
        } catch (err) {
          set({ error: (err as Error).message });
        } finally {
          set({ isLoading: false });
        }
      },

      // ── Submit new assignment → POST to backend → listen on WebSocket ─────
      submitAssignment: async (payload: CreateAssignmentPayload) => {
        set({ isLoading: true, error: null, screen: "generating" });

        try {
          const { assignment } = await apiCreate(payload);

          set({
            pendingAssignmentId: assignment._id,
            // Optimistically add to list
            assignments: [assignment, ...get().assignments],
            assignmentsLoaded: true,
          });

          // Register WebSocket listener for this assignment
          const cleanup = waitForAssignmentCompletion(
            assignment._id,
            async (completionPayload) => {
              cleanup(); // Remove listener

              if (completionPayload.status === "failed") {
                set({
                  error: completionPayload.error || "Generation failed",
                  screen: "list",
                  isLoading: false,
                });
                return;
              }

              // Fetch the result
              try {
                const result = await fetchResultById(completionPayload.resultId);
                const updated = await apiFetchAll();

                set({
                  currentResult: result,
                  currentAssignment: assignment,
                  assignments: updated.assignments,
                  screen: "output",
                  isLoading: false,
                  pendingAssignmentId: null,
                });
              } catch (fetchErr) {
                set({
                  error: (fetchErr as Error).message,
                  screen: "list",
                  isLoading: false,
                });
              }
            },
            // Status update callback (e.g. "processing")
            (statusPayload) => {
              get().updateAssignmentStatus(
                statusPayload.assignmentId,
                statusPayload.status,
                statusPayload.resultId
              );
            }
          );
        } catch (err) {
          set({
            error: (err as Error).message,
            screen: "create",
            isLoading: false,
          });
        }
      },

      // ── Load result for output screen ──────────────────────────────────────
      loadResult: async (assignmentId: string) => {
        set({ isLoading: true, error: null });
        try {
          const result = await fetchResultByAssignment(assignmentId);
          set({ currentResult: result, isLoading: false });
        } catch (err) {
          set({ error: (err as Error).message, isLoading: false });
        }
      },

      // ── View existing assignment result ────────────────────────────────────
      viewAssignment: async (assignment: AssignmentDocument) => {
        set({ currentAssignment: assignment, isLoading: true, error: null });

        if (assignment.status !== "completed" || !assignment.resultId) {
          set({
            error: "This assignment has no result yet.",
            isLoading: false,
          });
          return;
        }

        try {
          const result = await fetchResultById(assignment.resultId);
          set({ currentResult: result, screen: "output", isLoading: false });
        } catch (err) {
          set({ error: (err as Error).message, isLoading: false });
        }
      },

      // ── Delete assignment ──────────────────────────────────────────────────
      deleteAssignment: async (id: string) => {
        try {
          await apiDelete(id);
          const updated = get().assignments.filter((a) => a._id !== id);
          set({
            assignments: updated,
            screen: updated.length > 0 ? "list" : "empty",
          });
        } catch (err) {
          set({ error: (err as Error).message });
        }
      },

      // ── WebSocket status patch ─────────────────────────────────────────────
      updateAssignmentStatus: (id, status, resultId) => {
        set((state) => ({
          assignments: state.assignments.map((a) =>
            a._id === id
              ? { ...a, status, ...(resultId ? { resultId } : {}) }
              : a
          ),
        }));
      },
    }),
    { name: "VedaAI" }
  )
);
