import mongoose, { Document, Schema } from "mongoose";
import type { AssignmentStatus, QuestionType } from "@veda-ai/shared";

export interface IAssignment extends Document {
  title: string;
  dueDate: string;
  questionTypes: QuestionType[];
  instructions: string;
  subject: string;
  className: string;
  status: AssignmentStatus;
  resultId?: mongoose.Types.ObjectId;
  pdf?: {
    filename: string;
    mimetype: string;
    size: number;
    data: Buffer;
  };
  createdAt: Date;
  updatedAt: Date;
}

const QuestionTypeSchema = new Schema<QuestionType>(
  {
    type: { type: String, required: true, trim: true },
    count: { type: Number, required: true, min: 1, max: 100 },
    marks: { type: Number, required: true, min: 1, max: 50 },
  },
  { _id: false }
);

const AssignmentSchema = new Schema<IAssignment>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    dueDate: {
      type: String,
      required: true,
    },
    questionTypes: {
      type: [QuestionTypeSchema],
      required: true,
      validate: {
        validator: (arr: QuestionType[]) => arr.length > 0 && arr.length <= 10,
        message: "Must have between 1 and 10 question types",
      },
    },
    instructions: {
      type: String,
      default: "",
      maxlength: 2000,
    },
    subject: {
      type: String,
      default: "General",
      trim: true,
    },
    className: {
      type: String,
      default: "Grade 8",
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"] as AssignmentStatus[],
      default: "pending",
      index: true,
    },
    resultId: {
      type: Schema.Types.ObjectId,
      ref: "Result",
      default: null,
    },
    pdf: {
      filename: { type: String, trim: true },
      mimetype: { type: String, trim: true },
      size: { type: Number },
      data: { type: Buffer },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for common queries
AssignmentSchema.index({ createdAt: -1 });
AssignmentSchema.index({ status: 1, createdAt: -1 });

export const Assignment = mongoose.model<IAssignment>(
  "Assignment",
  AssignmentSchema
);
