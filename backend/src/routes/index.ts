import { Router } from "express";
import multer from "multer";
import {
  createAssignment,
  getAssignments,
  getAssignmentById,
  deleteAssignment,
  getResult,
  getResultByAssignment,
  downloadAssignmentPdf,
} from "../controllers/assignment.controller";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

// ─── Assignment Routes ─────────────────────────────────────────────────────────

// POST /api/assignments — create new assignment + queue paper generation
// Accept JSON or multipart/form-data with optional `pdf` file upload
router.post("/assignments", upload.single("pdf"), createAssignment);

// GET /api/assignments — list all assignments (paginated)
router.get("/assignments", getAssignments);

// GET /api/assignments/:id — get single assignment
router.get("/assignments/:id", getAssignmentById);

// GET /api/assignments/:id/pdf — download assignment PDF (if uploaded)
router.get("/assignments/:id/pdf", downloadAssignmentPdf);

// DELETE /api/assignments/:id — delete assignment + result
router.delete("/assignments/:id", deleteAssignment);

// ─── Result Routes ─────────────────────────────────────────────────────────────

// GET /api/result/:id — fetch result by result ID
router.get("/result/:id", getResult);

// GET /api/assignments/:assignmentId/result — fetch result by assignment ID
router.get("/assignments/:assignmentId/result", getResultByAssignment);

export default router;
