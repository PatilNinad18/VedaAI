import type {
  ApiResponse,
  AssignmentDocument,
  CreateAssignmentPayload,
  ResultDocument,
} from "../types";

const rawApiUrl =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:4000/api";

const normalizedApiUrl = rawApiUrl.replace(/\/+$/g, "");
const BASE_URL = normalizedApiUrl.endsWith("/api")
  ? normalizedApiUrl
  : `${normalizedApiUrl}/api`;

const API_BASE = BASE_URL;

// ─── Generic fetch wrapper ─────────────────────────────────────────────────────

async function apiFetch<T>(
  path: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  const json: ApiResponse<T> = await res.json();

  if (!res.ok) {
    throw new Error(json.error || `HTTP ${res.status}`);
  }

  return json;
}

// ─── Assignment API ────────────────────────────────────────────────────────────

export async function createAssignment(
  payload: CreateAssignmentPayload
): Promise<{ assignment: AssignmentDocument; jobId: string }> {
  const res = await apiFetch<{ assignment: AssignmentDocument; jobId: string }>(
    "/assignments",
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );

  if (!res.data) throw new Error("No data returned from createAssignment");
  return res.data;
}

export async function fetchAssignments(
  page = 1,
  limit = 20
): Promise<{
  assignments: AssignmentDocument[];
  pagination: { page: number; limit: number; total: number; pages: number };
}> {
  const res = await apiFetch<{
    assignments: AssignmentDocument[];
    pagination: { page: number; limit: number; total: number; pages: number };
  }>(`/assignments?page=${page}&limit=${limit}`);

  if (!res.data) return { assignments: [], pagination: { page: 1, limit, total: 0, pages: 0 } };
  return res.data;
}

export async function fetchAssignmentById(
  id: string
): Promise<AssignmentDocument> {
  const res = await apiFetch<{ assignment: AssignmentDocument }>(
    `/assignments/${id}`
  );
  if (!res.data) throw new Error("Assignment not found");
  return res.data.assignment;
}

export async function deleteAssignment(id: string): Promise<void> {
  await apiFetch(`/assignments/${id}`, { method: "DELETE" });
}

// ─── Result API ────────────────────────────────────────────────────────────────

export async function fetchResultById(id: string): Promise<ResultDocument> {
  const res = await apiFetch<{ result: ResultDocument }>(`/result/${id}`);
  if (!res.data) throw new Error("Result not found");
  return res.data.result;
}

export async function fetchResultByAssignment(
  assignmentId: string
): Promise<ResultDocument> {
  const res = await apiFetch<{ result: ResultDocument }>(
    `/assignments/${assignmentId}/result`
  );
  if (!res.data) throw new Error("Result not found");
  return res.data.result;
}
