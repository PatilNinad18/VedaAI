/**
 * generatePaper.worker.ts
 */

import "dotenv/config";
import { Worker, Job } from "bullmq";
import { connectMongoDB } from "../config/database";
import { getRedisConnection } from "../config/redis";
import { Assignment } from "../models/assignment.model";
import { Result } from "../models/result.model";
import { generateQuestionPaper } from "../services/ai.service";
import {
  emitAssignmentCompleted,
  emitAssignmentProcessing,
} from "../services/socket.service";
import type { GeneratePaperJobData } from "@veda-ai/shared";
import { QUEUE_NAME } from "../queues/generatePaper.queue";
import {
  generatePaperQueue as mockQueue,
  MockJob,
} from "../queues/generatePaper.queue-mock";

// ─────────────────────────────────────────────────────────────
// Bootstrap
// ─────────────────────────────────────────────────────────────

async function bootstrap(): Promise<void> {
  await connectMongoDB();

  try {
    startWorker();
  } catch (err) {
    console.error("[Worker] Failed to start BullMQ worker, using mock:", err);
    startMockWorker();
  }
}

// ─────────────────────────────────────────────────────────────
// Mock Worker (Fallback)
// ─────────────────────────────────────────────────────────────

async function startMockWorker(): Promise<void> {
  console.log("[Worker] 🎯 Using mock worker (development mode)");

  mockQueue.process(async (job: MockJob) => {
    await processMockJob(job);
  });
}

async function processMockJob(job: MockJob): Promise<void> {
  const { assignmentId } = job.data;

  console.log(`[Worker] 🚀 Mock job started: ${job.id}`);

  try {
    const assignment = {
      _id: assignmentId,
      subject: "Mathematics",
      className: "Grade 10",
      questionTypes: [
        { type: "Multiple Choice", count: 5, marks: 1 },
        { type: "Short Answer", count: 3, marks: 2 },
      ],
      status: "processing",
      save: async () => {},
    };

    await job.updateProgress(10);

    const aiResult = await generateQuestionPaper({
      subject: assignment.subject,
      className: assignment.className,
      questionTypes: assignment.questionTypes,
    });

    await job.updateProgress(70);

    const result = {
      _id: `result_${assignmentId}`,
      assignmentId,
      ...aiResult,
      save: async () => {},
    };

    await result.save();

    assignment.status = "completed";
    await assignment.save();

    emitAssignmentCompleted({
      assignmentId,
      resultId: result._id,
      status: "completed",
    });

    console.log(`[Worker] ✅ Mock job completed`);
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);

    emitAssignmentCompleted({
      assignmentId,
      resultId: "",
      status: "failed",
      error: errMsg,
    });

    throw err;
  }
}

// ─────────────────────────────────────────────────────────────
// REAL JOB PROCESSOR
// ─────────────────────────────────────────────────────────────

async function processJob(
  job: Job<GeneratePaperJobData>
): Promise<void> {
  const { assignmentId } = job.data;

  console.log(`[Worker] 🚀 Job started: ${job.id}`);

  try {
    // 1. Fetch assignment
    const assignment = await Assignment.findById(assignmentId);

    if (!assignment) {
      throw new Error(`Assignment not found: ${assignmentId}`);
    }

    if (assignment.status === "completed") {
      console.log(`[Worker] Already completed. Skipping.`);
      return;
    }

    // 2. Mark processing
    assignment.status = "processing";
    await assignment.save();

    emitAssignmentProcessing(assignmentId);
    await job.updateProgress(10);

    // 3. Generate paper
    const aiResult = await generateQuestionPaper({
      subject: assignment.subject,
      className: assignment.className,
      questionTypes: assignment.questionTypes,
    });

    await job.updateProgress(70);

    // 4. Save result
    const result = new Result({
      assignmentId,
      ...aiResult,
    });

    await result.save();

    // 5. Update assignment
    assignment.status = "completed";
    assignment.resultId = result._id;
    await assignment.save();

    // 6. Notify frontend
    emitAssignmentCompleted({
      assignmentId,
      resultId: result._id,
      status: "completed",
    });

    console.log(`[Worker] ✅ Job completed`);
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);

    console.error(`[Worker] ❌ Job failed: ${errMsg}`);

    try {
      await Assignment.findByIdAndUpdate(assignmentId, {
        status: "failed",
      });

      emitAssignmentCompleted({
        assignmentId,
        resultId: "",
        status: "failed",
        error: errMsg,
      });
    } catch (updateErr) {
      console.error("[Worker] Failure handling error:", updateErr);
    }

    throw err;
  }
}

// ─────────────────────────────────────────────────────────────
// Worker Setup
// ─────────────────────────────────────────────────────────────

function startWorker(): void {
  const worker = new Worker<GeneratePaperJobData>(
    QUEUE_NAME,
    processJob,
    {
      connection: getRedisConnection() as any,
      prefix : "veda-ai",
      concurrency: 3,
      limiter: {
        max: 10,
        duration: 60000,
      },
    }
  );

  worker.on("error", (err) => {
    console.error("[Worker] ⚠️ Worker error:", err.message);
  });

  console.log(`[Worker] 🎯 Worker listening on "${QUEUE_NAME}"`);
}

// ─────────────────────────────────────────────────────────────
// Start
// ─────────────────────────────────────────────────────────────

bootstrap().catch((err) => {
  console.error("[Worker] Failed to start:", err);
  process.exit(1);
});

// ─────────────────────────────────────────────────────────────
// Graceful Shutdown
// ─────────────────────────────────────────────────────────────

process.on("SIGTERM", () => {
  console.log("[Worker] SIGTERM received");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("[Worker] SIGINT received");
  process.exit(0);
});