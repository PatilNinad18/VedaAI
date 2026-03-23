import { Request, Response } from "express";
import mongoose from "mongoose";
import { Assignment } from "../models/assignment.model";
import { Result } from "../models/result.model";
import { addGeneratePaperJob } from "../queues/generatePaper.queue";
import type {
  CreateAssignmentPayload,
  ApiResponse,
  AssignmentDocument,
} from "@veda-ai/shared";
import { z } from "zod";

// ─── Validation schema ─────────────────────────────────────────────────────────

const CreateAssignmentSchema = z.object({
  title: z.string().min(2).max(200),
  dueDate: z.string().min(1),
  questionTypes: z
    .array(
      z.object({
        type: z.string().min(1),
        count: z.number().int().min(1).max(50),
        marks: z.number().int().min(1).max(50),
      })
    )
    .min(1)
    .max(10),
  instructions: z.string().max(2000).default(""),
  subject: z.string().max(100).default("General"),
  className: z.string().max(50).default("Grade 8"),
});

// ─── Controller methods ────────────────────────────────────────────────────────

export async function createAssignment(
  req: Request,
  res: Response
): Promise<void> {
  try {
    // Normalize body for form-data and JSON
    const body = { ...req.body } as any;

    if (typeof body.questionTypes === "string") {
      try {
        body.questionTypes = JSON.parse(body.questionTypes);
      } catch {
        // keep as-is for parsing to catch error
      }
    }

    const validated = CreateAssignmentSchema.parse(body);

    // Additional runtime checks
    if (!validated.title || !validated.title.trim()) {
      res.status(400).json({
        success: false,
        error: "Title is required and cannot be empty",
      });
      return;
    }

    if (!validated.dueDate || !validated.dueDate.trim()) {
      res.status(400).json({
        success: false,
        error: "Due date is required",
      });
      return;
    }

    if (!validated.questionTypes || validated.questionTypes.length === 0) {
      res.status(400).json({
        success: false,
        error: "At least one question type is required",
      });
      return;
    }

    // Validate each question type
    for (const qt of validated.questionTypes) {
      if (typeof qt.count !== "number" || qt.count < 1) {
        res.status(400).json({
          success: false,
          error: `Invalid question count for ${qt.type}: must be at least 1`,
        });
        return;
      }

      if (typeof qt.marks !== "number" || qt.marks < 1) {
        res.status(400).json({
          success: false,
          error: `Invalid marks for ${qt.type}: must be at least 1`,
        });
        return;
      }
    }

    // Save assignment with "pending" status
    const assignmentPayload: any = {
      ...validated,
      status: "pending",
    };

    if (req.file) {
      assignmentPayload.pdf = {
        filename: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        data: req.file.buffer,
      };
    }

    const assignment = new Assignment(assignmentPayload);

    await assignment.save();
    console.log(`[Controller] Assignment created: ${assignment._id}`);

    // Add job to BullMQ queue — do NOT await the result
    const jobId = await addGeneratePaperJob(assignment._id.toString());

    console.log(
      `[Controller] Job queued for assignment ${assignment._id}: ${jobId}`
    );

    const response: ApiResponse<{ assignment: AssignmentDocument; jobId: string }> = {
      success: true,
      data: {
        assignment: assignment.toJSON() as unknown as AssignmentDocument,
        jobId,
      },
      message: "Assignment created. Paper generation queued.",
    };

    res.status(201).json(response);
  } catch (err) {
    if (err instanceof z.ZodError) {
      console.error("[Controller] Validation error:", err.errors);
      res.status(400).json({
        success: false,
        error: "Validation failed",
        details: err.errors.map((e) => ({
          path: e.path.join("."),
          message: e.message,
        })),
      });
      return;
    }

    console.error("[Controller] createAssignment error:", err);
    res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : "Internal server error",
    });
  }
}

export async function getAssignments(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const skip = (page - 1) * limit;

    const [assignments, total] = await Promise.all([
      Assignment.find({})
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Assignment.countDocuments({}),
    ]);

    res.json({
      success: true,
      data: {
        assignments,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (err) {
    console.error("[Controller] getAssignments error:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
}

export async function getAssignmentById(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, error: "Invalid assignment ID" });
      return;
    }

    const assignment = await Assignment.findById(id).lean();

    if (!assignment) {
      res.status(404).json({ success: false, error: "Assignment not found" });
      return;
    }

    res.json({ success: true, data: { assignment } });
  } catch (err) {
    console.error("[Controller] getAssignmentById error:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
}

export async function deleteAssignment(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, error: "Invalid assignment ID" });
      return;
    }

    const assignment = await Assignment.findByIdAndDelete(id);

    if (!assignment) {
      res.status(404).json({ success: false, error: "Assignment not found" });
      return;
    }

    // Clean up associated result
    if (assignment.resultId) {
      await Result.findByIdAndDelete(assignment.resultId);
    }

    res.json({ success: true, message: "Assignment deleted" });
  } catch (err) {
    console.error("[Controller] deleteAssignment error:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
}

export async function getResult(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, error: "Invalid result ID" });
      return;
    }

    const result = await Result.findById(id).lean();

    if (!result) {
      res.status(404).json({ success: false, error: "Result not found" });
      return;
    }

    res.json({ success: true, data: { result } });
  } catch (err) {
    console.error("[Controller] getResult error:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
}

export async function getResultByAssignment(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { assignmentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(assignmentId)) {
      res.status(400).json({ success: false, error: "Invalid assignment ID" });
      return;
    }

    const result = await Result.findOne({
      assignmentId: new mongoose.Types.ObjectId(assignmentId),
    }).lean();

    if (!result) {
      res
        .status(404)
        .json({ success: false, error: "Result not found for this assignment" });
      return;
    }

    res.json({ success: true, data: { result } });
  } catch (err) {
    console.error("[Controller] getResultByAssignment error:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
}

export async function downloadAssignmentPdf(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, error: "Invalid assignment ID" });
      return;
    }

    const assignment = await Assignment.findById(id).lean();
    if (!assignment || !assignment.pdf || !assignment.pdf.data) {
      res.status(404).json({ success: false, error: "PDF not found" });
      return;
    }

    res.setHeader("Content-Type", assignment.pdf.mimetype || "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=\"${assignment.pdf.filename || 'assignment.pdf'}\"`);
    res.send(assignment.pdf.data);
  } catch (err) {
    console.error("[Controller] downloadAssignmentPdf error:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
}
