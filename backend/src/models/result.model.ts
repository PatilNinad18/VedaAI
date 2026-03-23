import mongoose, { Document, Schema } from "mongoose";
import type { Difficulty } from "@veda-ai/shared";

export interface IQuestion {
  text: string;
  difficulty: Difficulty;
  marks: number;
}

export interface ISection {
  title: string;
  questionType: string;
  instruction: string;
  questions: IQuestion[];
  answerKey: string[];
}

export interface IResult extends Document {
  assignmentId: mongoose.Types.ObjectId;
  sections: ISection[];
  createdAt: Date;
  updatedAt: Date;
}

const QuestionSchema = new Schema<IQuestion>(
  {
    text: { type: String, required: true, trim: true },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"] as Difficulty[],
      required: true,
    },
    marks: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const SectionSchema = new Schema<ISection>(
  {
    title: { type: String, required: true, trim: true },
    questionType: { type: String, required: true, trim: true },
    instruction: { type: String, required: true, trim: true },
    questions: {
      type: [QuestionSchema],
      required: true,
      validate: {
        validator: (arr: IQuestion[]) => arr.length > 0,
        message: "Section must have at least one question",
      },
    },
    answerKey: {
      type: [String],
      default: [],
    },
  },
  { _id: false }
);

const ResultSchema = new Schema<IResult>(
  {
    assignmentId: {
      type: Schema.Types.ObjectId,
      ref: "Assignment",
      required: true,
      index: true,
    },
    sections: {
      type: [SectionSchema],
      required: true,
      validate: {
        validator: (arr: ISection[]) => arr.length > 0,
        message: "Result must have at least one section",
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

export const Result = mongoose.model<IResult>("Result", ResultSchema);
