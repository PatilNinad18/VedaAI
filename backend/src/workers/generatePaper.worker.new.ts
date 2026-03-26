/**
 * generatePaper.worker.ts
 *
 * BullMQ Worker — runs as a SEPARATE process from the Express server.
 * Start with: `npm run worker`
 *
 * Responsibilities:
 * 1. Pick up jobs from "generate-paper" queue
 * 2. Fetch assignment from MongoDB
 * 3. Call the AI service to generate questions
 * 4. Save the Result document
 * 5. Update assignment status to "completed"
 * 6. Emit WebSocket event to notify frontend
 */

import "dotenv/config";
import { Worker, Job } from "bullmq";
import mongoose from "mongoose";
import { connectMongoDB } from "../config/database";
import { getRedisConnection } from "../config/redis";
import { Assignment } from "../models/assignment.model";
import { Result } from "../models/result.model";
import { generateQuestionPaper } from "../services/ai.service";
import { emitAssignmentCompleted, emitAssignmentProcessing } from "../services/socket.service";
import type { GeneratePaperJobData } from "@veda-ai/shared";
import { QUEUE_NAME } from "../queues/generatePaper.queue";
import { generatePaperQueue as mockQueue, MockJob } from "../queues/generatePaper.queue-mock";

// ─── Bootstrap ────────────────────────────────────────────────────────────────

async function bootstrap(): Promise<void> {
  await connectMongoDB();

  // Try to start BullMQ worker, fallback to mock if Redis unavailable
  try {
    startWorker();
  } catch (err) {
    console.error("[Worker] Failed to start BullMQ worker, using mock:", err);
    startMockWorker();
  }
}

// ─── Mock Worker for Development ─────────────────────────────────────────────────

async function startMockWorker(): Promise<void> {
  console.log("[Worker] 🎯 Using mock worker (development mode)");
  
  mockQueue.process(async (job: MockJob) => {
    await processMockJob(job);
  });
}

async function processMockJob(job: MockJob): Promise<void> {
  const { assignmentId } = job.data;

  console.log(`[Worker] 🚀 Mock job started: ${job.id} | Assignment: ${assignmentId}`);

  try {
    // Mock assignment data
    const assignment = {
      _id: assignmentId,
      subject: "Mathematics",
      className: "Grade 10",
      questionTypes: [
        { type: "Multiple Choice", count: 5, marks: 1 },
        { type: "Short Answer", count: 3, marks: 2 }
      ],
      status: "processing",
      save: async () => {
        console.log(`[Worker] 💾 Mock saved assignment ${assignmentId}`);
      }
    };

    await job.updateProgress(10);
    console.log(`[Worker] ✓ Status updated to "processing"`);

    // Generate AI paper
    console.log(`[Worker] 🤖 Calling AI service...`);
    const aiResult = await generateQuestionPaper({
      subject: assignment.subject,
      className: assignment.className,
      questionTypes: assignment.questionTypes
    });
    console.log(`[Worker] ✓ AI response: ${aiResult.sections?.length || 0} sections`);

    await job.updateProgress(70);

    // Mock result save
    const result = {
      _id: `result_${assignmentId}`,
      assignmentId,
      ...aiResult,
      save: async () => {
        console.log(`[Worker] 💾 Mock saved result ${assignmentId}`);
      }
    };

    await result.save();

    // Update assignment
    assignment.status = "completed";
    await assignment.save();

    // Emit completion
    emitAssignmentCompleted({
      assignmentId,
      resultId: result._id,
      status: "completed",
    });

    console.log(`[Worker] ✅ Mock job completed! Result ID: ${result._id}`);
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error(`[Worker] ❌ Mock job failed: ${job.id} | Error: ${errMsg}`);

    emitAssignmentCompleted({
      assignmentId,
      resultId: "",
      status: "failed",
      error: errMsg,
    });

    throw err;
  }
}

// ─── Job processor ────────────────────────────────────────────────────────────

async function processJob(job: Job<GeneratePaperJobData>): Promise<void> {
  const { assignmentId } = job.data;

  console.log(`[Worker] 🚀 Job started: ${job.id} | Assignment: ${assignmentId}`);

  try {
    // ── Step 1: Fetch assignment ──────────────────────────────────────
    console.log(`[Worker] ⏳ Fetching assignment from MongoDB...`);
    const assignment = await Assignment.findById(assignmentId);

    if (!assignment) {
      throw new Error(`Assignment not found: ${assignmentId}`);
    }

    if (assignment.status === "completed") {
      console.log(`[Worker] ℹ️  Assignment ${assignmentId} already completed. Skipping.`);
      return;
    }

    // ── Step 2: Mark as processing ────────────────────────────────────
    console.log(`[Worker] 🔄 Marking assignment as "processing"...`);
    assignment.status = "processing";
    await assignment.save();

    emitAssignmentProcessing(assignmentId);
    await job.updateProgress(10);
    console.log(`[Worker] ✓ Status updated to "processing"`);

    // ── Step 3: Generate question paper via AI ────────────────────────
    console.log(`[Worker] 🤖 Calling AI service...`);
    console.log(`[Worker]   Subject: ${assignment.subject}`);
    console.log(`[Worker]   Class: ${assignment.className}`);
    console.log(`[Worker]   Question types: ${assignment.questionTypes.map((qt) => `${qt.count} ${qt.type}`).join(", ")}`);

    const aiResult = await generateQuestionPaper({
      subject: assignment.subject,
      className: assignment.className,
      questionTypes: assignment.questionTypes,
    });

    console.log(`[Worker] ✓ AI response: ${aiResult.sections?.length || 0} sections`);
    await job.updateProgress(70);

    // ── Step 4: Save result to MongoDB ────────────────────────────────
    console.log(`[Worker] 💾 Saving result to MongoDB...`);
    const result = new Result({
      assignmentId,
      ...aiResult,
    });
    await result.save();

    // ── Step 5: Update assignment status ────────────────────────────────
    console.log(`[Worker] 📝 Updating assignment record...`);
    assignment.status = "completed";
    assignment.resultId = result._id;
    await assignment.save();

    // ── Step 6: Emit WebSocket event ────────────────────────────────
    console.log(`[Worker] 📡 Emitting WebSocket event...`);
    emitAssignmentCompleted({
      assignmentId,
      resultId: result._id,
      status: "completed",
    });

    console.log(`[Worker] ✅ Job completed! Result ID: ${result._id}`);
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error(`[Worker] ❌ Job failed: ${job.id} | Error: ${errMsg}`);

    // ── Error handling: Update assignment status ──────────────────────────
    try {
      await Assignment.findByIdAndUpdate(assignmentId, { status: "failed" });
      emitAssignmentCompleted({
        assignmentId,
        resultId: "",
        status: "failed",
        error: errMsg,
      });
      console.log(`[Worker] 📡 Emitted failure event to frontend`);
    } catch (updateErr) {
      console.error("[Worker] Failed to update assignment status:", updateErr);
    }

    throw err;
  }
}

// ─── Worker setup ─────────────────────────────────────────────────────────────

function startWorker(): void {
  const worker = new Worker<GeneratePaperJobData>(
    QUEUE_NAME,
    processJob,
    {
      connection: getRedisConnection() as any,
      concurrency: 3,
      limiter: {
        max: 10,
        duration: 60000,
      },
    }
  );

  worker.on("active", (job) => {
    console.log(`[Worker] 🎯 Job active: ${job.id}`);
  });

  worker.on("completed", (job) => {
    console.log(`[Worker] ✅ Job completed: ${job.id}`);
  });

  worker.on("failed", (job, err) => {
    console.error(`[Worker] ❌ Job failed: ${job.id}`, err);
  });

  worker.on("error", (err) => {
    console.error("[Worker] ⚠️  Worker error:", err.message);
  });

  console.log(`[Worker] 🎯 BullMQ worker listening on queue: "${QUEUE_NAME}"`);
}

// ─── Bootstrap call ────────────────────────────────────────────────────────────────

bootstrap().catch((err) => {
  console.error("[Worker] Failed to start worker:", err);
  process.exit(1);
});

// ─── Graceful shutdown ────────────────────────────────────────────────────────

process.on("SIGTERM", async () => {
  console.log("[Worker] SIGTERM received. Graceful shutdown...");
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("[Worker] SIGINT received. Graceful shutdown...");
  process.exit(0);
});
