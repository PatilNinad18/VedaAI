/**
 * generatePaper.worker.ts
 *
 * BullMQ Worker — runs as a SEPARATE process from the Express server.
 * Start with: `npm run worker` (or `node dist/workers/generatePaper.worker.js`)
 *
 * Responsibilities:
 * 1. Pick up jobs from the "generate-paper" queue
 * 2. Fetch the assignment from MongoDB
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

// ─── Bootstrap ────────────────────────────────────────────────────────────────

async function bootstrap(): Promise<void> {
  await connectMongoDB();

  // Worker process does not host WebSocket server; it publishes events through Redis.
  startWorker();
}

// ─── Job processor ────────────────────────────────────────────────────────────

async function processJob(job: Job<GeneratePaperJobData>): Promise<void> {
  const { assignmentId } = job.data;

  console.log(
    `[Worker] 🚀 Job started: ${job.id} | Assignment: ${assignmentId}`
  );

  try {
    // ── Step 1: Fetch assignment ──────────────────────────────────────────────
    console.log(`[Worker] ⏳ Fetching assignment from MongoDB...`);
    const assignment = await Assignment.findById(assignmentId);

    if (!assignment) {
      throw new Error(`Assignment not found: ${assignmentId}`);
    }

    if (assignment.status === "completed") {
      console.log(
        `[Worker] ℹ️  Assignment ${assignmentId} already completed. Skipping.`
      );
      return;
    }

    // ── Step 2: Mark as processing ────────────────────────────────────────────
    console.log(`[Worker] 🔄 Marking assignment as "processing"...`);
    assignment.status = "processing";
    await assignment.save();

    emitAssignmentProcessing(assignmentId);
    await job.updateProgress(10);
    console.log(`[Worker] ✓ Status updated to "processing"`);

    // ── Step 3: Generate question paper via AI ────────────────────────────────
    console.log(`[Worker] 🤖 Calling AI service...`);
    console.log(`[Worker]   Subject: ${assignment.subject}`);
    console.log(`[Worker]   Class: ${assignment.className}`);
    console.log(
      `[Worker]   Question types: ${assignment.questionTypes
        .map((qt) => `${qt.count} ${qt.type}`)
        .join(", ")}`
    );

    const aiResult = await generateQuestionPaper({
      questionTypes: assignment.questionTypes,
      instructions: assignment.instructions,
      subject: assignment.subject,
      className: assignment.className,
    });

    console.log(
      `[Worker] ✓ AI response received: ${aiResult.sections.length} sections`
    );
    await job.updateProgress(70);

    // Log section details
    aiResult.sections.forEach((section, i) => {
      console.log(
        `[Worker]   Section ${i + 1}: ${section.title} (${section.questions.length} questions)`
      );
    });

    // ── Step 4: Save Result to MongoDB ────────────────────────────────────────
    console.log(`[Worker] 💾 Saving result to MongoDB...`);
    const result = new Result({
      assignmentId: new mongoose.Types.ObjectId(assignmentId),
      sections: aiResult.sections,
    });

    await result.save();
    console.log(`[Worker] ✓ Result saved: ${result._id}`);
    await job.updateProgress(85);

    // ── Step 5: Update Assignment status + link result ────────────────────────
    console.log(`[Worker] 📝 Updating assignment record...`);
    assignment.status = "completed";
    assignment.resultId = result._id as mongoose.Types.ObjectId;
    await assignment.save();

    await job.updateProgress(95);
    console.log(`[Worker] ✓ Assignment marked as "completed"`);

    // ── Step 6: Emit WebSocket event ──────────────────────────────────────────
    console.log(
      `[Worker] 📡 Emitting WebSocket event to notify frontend...`
    );
    emitAssignmentCompleted({
      assignmentId,
      resultId: result._id.toString(),
      status: "completed",
    });

    await job.updateProgress(100);
    console.log(
      `[Worker] ✅ Job completed successfully! Result ID: ${result._id}`
    );
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error(
      `[Worker] ❌ Job failed: ${job.id} | Error: ${errMsg}`
    );

    try {
      // Update assignment status to failed
      await Assignment.findByIdAndUpdate(assignmentId, {
        status: "failed",
      });
      console.log(`[Worker] 📝 Updated assignment status to "failed"`);

      // Emit failure event
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

function startWorker(): Worker<GeneratePaperJobData> {
  const worker = new Worker<GeneratePaperJobData>(
    QUEUE_NAME,
    processJob,
    {
      connection: getRedisConnection() as any,
      concurrency: 3, // Process up to 3 jobs simultaneously
      limiter: {
        max: 10,
        duration: 60000, // Max 10 jobs per minute (respect AI rate limits)
      },
    }
  );

  worker.on("active", (job) => {
    console.log(`[Worker] ▶️  Job ${job.id} is active`);
  });

  worker.on("completed", (job) => {
    console.log(`[Worker] ✅ Job ${job.id} completed successfully`);
  });

  worker.on("failed", async (job, err) => {
    console.error(
      `[Worker] ❌ Job ${job?.id} failed: ${err?.message}`
    );

    if (job?.data.assignmentId) {
      try {
        await Assignment.findByIdAndUpdate(job.data.assignmentId, {
          status: "failed",
        });

        emitAssignmentCompleted({
          assignmentId: job.data.assignmentId,
          resultId: "",
          status: "failed",
          error: err?.message || "Unknown error",
        });

        console.log(
          `[Worker] 📡 Emitted failure notification for ${job.data.assignmentId}`
        );
      } catch (updateErr) {
        console.error("[Worker] Failed to handle failure:", updateErr);
      }
    }
  });

  worker.on("error", (err) => {
    console.error("[Worker] ⚠️  Worker error:", err.message);
  });

  console.log(`[Worker] 🎯 Worker listening on queue: "${QUEUE_NAME}"`);
  return worker;
}

// ─── Graceful shutdown ────────────────────────────────────────────────────────

process.on("SIGTERM", async () => {
  console.log("[Worker] SIGTERM received. Graceful shutdown...");
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("[Worker] SIGINT received. Graceful shutdown...");
  process.exit(0);
});

// ─── Start ────────────────────────────────────────────────────────────────────

bootstrap().catch((err) => {
  console.error("[Worker] Bootstrap failed:", err);
  process.exit(1);
});
