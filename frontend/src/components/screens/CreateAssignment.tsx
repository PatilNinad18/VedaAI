"use client";

import React, { useState, useRef } from "react";
import TopBar from "../layout/TopBar";
import type { CreateAssignmentPayload, QuestionTypeRow } from "../../types";

const QUESTION_TYPE_OPTIONS = [
  "Multiple Choice Questions",
  "Short Questions",
  "Long Answer Questions",
  "Diagram/Graph-Based Questions",
  "Numerical Problems",
  "True/False Questions",
  "Fill in the Blanks",
  "Match the Following",
];

interface CreateAssignmentProps {
  onBack: () => void;
  onSubmit: (payload: CreateAssignmentPayload) => Promise<void>;
  isLoading: boolean;
}

const counterBtnStyle: React.CSSProperties = {
  width: "28px",
  height: "28px",
  borderRadius: "6px",
  border: "1px solid #e5e5e5",
  background: "#fff",
  cursor: "pointer",
  fontSize: "16px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  lineHeight: 1,
  padding: 0,
  flexShrink: 0,
};

export default function CreateAssignment({
  onBack,
  onSubmit,
  isLoading,
}: CreateAssignmentProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [dueDate, setDueDate] = useState("");
  const [subject, setSubject] = useState("Science");
  const [className, setClassName] = useState("Grade 8");
  const [instructions, setInstructions] = useState("");
  const [questionTypes, setQuestionTypes] = useState<QuestionTypeRow[]>([
    { id: 1, type: "Multiple Choice Questions", count: 4, marks: 1 },
    { id: 2, type: "Short Questions", count: 3, marks: 2 },
    { id: 3, type: "Diagram/Graph-Based Questions", count: 5, marks: 5 },
    { id: 4, type: "Numerical Problems", count: 5, marks: 5 },
  ]);

  const nextId = useRef(10);

  const totalQuestions = questionTypes.reduce((s, q) => s + q.count, 0);
  const totalMarks = questionTypes.reduce((s, q) => s + q.count * q.marks, 0);

  const addRow = () => {
    setQuestionTypes((prev) => [
      ...prev,
      { id: nextId.current++, type: "Multiple Choice Questions", count: 2, marks: 1 },
    ]);
  };

  const removeRow = (id: number) =>
    setQuestionTypes((prev) => prev.filter((q) => q.id !== id));

  const updateRow = (id: number, field: keyof QuestionTypeRow, val: string | number) =>
    setQuestionTypes((prev) =>
      prev.map((q) => (q.id === id ? { ...q, [field]: val } : q))
    );

  const counter = (id: number, field: "count" | "marks", delta: number) =>
    setQuestionTypes((prev) =>
      prev.map((q) =>
        q.id === id ? { ...q, [field]: Math.max(1, q[field] + delta) } : q
      )
    );

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) setUploadedFile(file);
  };

  const handleSubmit = async () => {
    // ─── Validation ────────────────────────────────────────────────────
    
    // Check required fields
    if (!dueDate.trim()) {
      alert("Please select a due date");
      return;
    }

    if (!subject.trim()) {
      alert("Please enter a subject");
      return;
    }

    if (!className.trim()) {
      alert("Please enter a class/grade");
      return;
    }

    if (questionTypes.length === 0) {
      alert("Please add at least one question type");
      return;
    }

    // Validate each question type
    for (const qt of questionTypes) {
      if (!qt.type || !qt.type.trim()) {
        alert("Question type cannot be empty");
        return;
      }
      if (typeof qt.count !== "number" || qt.count < 1) {
        alert("Question count must be at least 1");
        return;
      }
      if (typeof qt.marks !== "number" || qt.marks < 1) {
        alert("Marks must be at least 1");
        return;
      }
    }

    // Validate total questions
    if (totalQuestions === 0) {
      alert("Total questions must be at least 1");
      return;
    }

    // Validate total marks
    if (totalMarks === 0) {
      alert("Total marks must be at least 1");
      return;
    }

    // ─── Build payload ────────────────────────────────────────────────────
    
    const title = `${subject} Assignment - ${new Date().toLocaleDateString("en-GB")}`;
    
    const payload: CreateAssignmentPayload = {
      title: title.trim(),
      dueDate: dueDate.trim(),
      questionTypes: questionTypes.map(({ type, count, marks }) => ({
        type: type.trim(),
        count: Math.max(1, Math.floor(Number(count))), // Ensure number
        marks: Math.max(1, Math.floor(Number(marks))), // Ensure number
      })),
      instructions: instructions.trim(),
      subject: subject.trim(),
      className: className.trim(),
    };

    // ─── Submit ────────────────────────────────────────────────────────
    
    try {
      await onSubmit(payload);
    } catch (err) {
      console.error("Submission error:", err);
      alert(`Error: ${err instanceof Error ? err.message : "Failed to submit"}`);
    }
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <TopBar title="Assignment" onBack={onBack} />

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "24px 28px",
          background: "#f5f5f5",
        }}
      >
        <div style={{ marginBottom: "20px" }}>
          <h1 style={{ fontSize: "20px", fontWeight: 700, color: "#1a1a1a", margin: "0 0 4px" }}>
            Create Assignment
          </h1>
          <p style={{ fontSize: "13px", color: "#888" }}>
            Setup a new assignment for your students.
          </p>
        </div>

        {/* Progress indicator */}
        <div
          style={{
            background: "#e5e5e5",
            borderRadius: "4px",
            height: "4px",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              background: "#1a1a1a",
              width: "50%",
              height: "100%",
              borderRadius: "4px",
              transition: "width 0.3s",
            }}
          />
        </div>

        <div
          style={{
            background: "#fff",
            borderRadius: "14px",
            padding: "28px",
            border: "1px solid #efefef",
          }}
        >
          <h2 style={{ fontSize: "16px", fontWeight: 600, margin: "0 0 4px" }}>
            Assignment Details
          </h2>
          <p style={{ fontSize: "12px", color: "#aaa", margin: "0 0 24px" }}>
            Basic information about your assignment
          </p>

          {/* File upload */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            style={{
              border: `2px dashed ${isDragging ? "#1a1a1a" : "#d5d5d5"}`,
              borderRadius: "10px",
              padding: "32px 20px",
              textAlign: "center",
              marginBottom: "8px",
              background: isDragging ? "#f9f9f9" : "#fafafa",
              transition: "all 0.15s",
            }}
          >
            <div style={{ fontSize: "28px", marginBottom: "8px", color: "#aaa" }}>⬆</div>
            <p style={{ fontSize: "13px", color: "#666", margin: "0 0 12px" }}>
              {uploadedFile
                ? `✓ ${uploadedFile.name}`
                : "Choose a file or drag & drop it here"}
            </p>
            <p style={{ fontSize: "11px", color: "#bbb", margin: "0 0 14px" }}>
              JPEG, PNG, upto 10MB
            </p>
            <label
              style={{
                background: "#fff",
                border: "1px solid #d5d5d5",
                borderRadius: "6px",
                padding: "7px 18px",
                fontSize: "12px",
                cursor: "pointer",
                color: "#444",
              }}
            >
              Browse Files
              <input
                type="file"
                style={{ display: "none" }}
                onChange={(e) => setUploadedFile(e.target.files?.[0] || null)}
              />
            </label>
          </div>
          <p style={{ fontSize: "11px", color: "#bbb", margin: "0 0 20px", textAlign: "center" }}>
            Upload images of your preferred document/image
          </p>

          {/* Subject + Class */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px" }}>
            <div>
              <label style={{ fontSize: "13px", fontWeight: 500, color: "#333", display: "block", marginBottom: "6px" }}>
                Subject
              </label>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Science"
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  border: "1px solid #e5e5e5",
                  borderRadius: "8px",
                  fontSize: "13px",
                  outline: "none",
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: "13px", fontWeight: 500, color: "#333", display: "block", marginBottom: "6px" }}>
                Class / Grade
              </label>
              <input
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                placeholder="e.g. Grade 8"
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  border: "1px solid #e5e5e5",
                  borderRadius: "8px",
                  fontSize: "13px",
                  outline: "none",
                }}
              />
            </div>
          </div>

          {/* Due Date */}
          <div style={{ marginBottom: "24px" }}>
            <label style={{ fontSize: "13px", fontWeight: 500, color: "#333", display: "block", marginBottom: "6px" }}>
              Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 14px",
                border: "1px solid #e5e5e5",
                borderRadius: "8px",
                fontSize: "13px",
                outline: "none",
              }}
            />
          </div>

          {/* Question Types */}
          <div style={{ marginBottom: "24px" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 120px 100px 32px",
                gap: "8px",
                alignItems: "center",
                marginBottom: "10px",
              }}
            >
              <span style={{ fontSize: "13px", fontWeight: 500, color: "#333" }}>Question Type</span>
              <span style={{ fontSize: "12px", color: "#e84545", fontWeight: 500, textAlign: "center" }}>No. of Questions</span>
              <span style={{ fontSize: "12px", color: "#888", fontWeight: 500, textAlign: "center" }}>Marks</span>
              <span />
            </div>

            {questionTypes.map((q) => (
              <div
                key={q.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 120px 100px 32px",
                  gap: "8px",
                  alignItems: "center",
                  marginBottom: "10px",
                }}
              >
                <select
                  value={q.type}
                  onChange={(e) => updateRow(q.id, "type", e.target.value)}
                  style={{
                    padding: "9px 12px",
                    border: "1px solid #e5e5e5",
                    borderRadius: "8px",
                    fontSize: "13px",
                    background: "#fff",
                    outline: "none",
                    cursor: "pointer",
                  }}
                >
                  {QUESTION_TYPE_OPTIONS.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>

                {/* Count counter */}
                <div style={{ display: "flex", alignItems: "center", gap: "6px", justifyContent: "center" }}>
                  <button onClick={() => counter(q.id, "count", -1)} style={counterBtnStyle}>−</button>
                  <span style={{ fontSize: "14px", fontWeight: 500, minWidth: "20px", textAlign: "center" }}>
                    {q.count}
                  </span>
                  <button onClick={() => counter(q.id, "count", 1)} style={counterBtnStyle}>+</button>
                </div>

                {/* Marks counter */}
                <div style={{ display: "flex", alignItems: "center", gap: "6px", justifyContent: "center" }}>
                  <button onClick={() => counter(q.id, "marks", -1)} style={counterBtnStyle}>−</button>
                  <span style={{ fontSize: "14px", fontWeight: 500, minWidth: "20px", textAlign: "center" }}>
                    {q.marks}
                  </span>
                  <button onClick={() => counter(q.id, "marks", 1)} style={counterBtnStyle}>+</button>
                </div>

                <button
                  onClick={() => removeRow(q.id)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "14px",
                    color: "#ccc",
                    padding: "4px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  ✕
                </button>
              </div>
            ))}

            <button
              onClick={addRow}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "13px",
                color: "#1a1a1a",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 0",
                fontWeight: 500,
              }}
            >
              <span
                style={{
                  width: "22px",
                  height: "22px",
                  borderRadius: "50%",
                  background: "#1a1a1a",
                  color: "#fff",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "16px",
                  lineHeight: 1,
                }}
              >
                +
              </span>
              Add Question Type
            </button>

            {/* Totals */}
            <div
              style={{
                textAlign: "right",
                marginTop: "16px",
                borderTop: "1px solid #f0f0f0",
                paddingTop: "12px",
              }}
            >
              <div style={{ fontSize: "13px", color: "#555", marginBottom: "4px" }}>
                Total Questions : <strong>{totalQuestions}</strong>
              </div>
              <div style={{ fontSize: "13px", color: "#555" }}>
                Total Marks : <strong>{totalMarks}</strong>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div>
            <label
              style={{
                fontSize: "13px",
                fontWeight: 500,
                color: "#333",
                display: "block",
                marginBottom: "8px",
              }}
            >
              Additional Information (For better output)
            </label>
            <div style={{ position: "relative" }}>
              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="e.g Generate a question paper for 3 hour exam duration..."
                rows={4}
                style={{
                  width: "100%",
                  padding: "12px 44px 12px 14px",
                  border: "1px solid #e5e5e5",
                  borderRadius: "8px",
                  fontSize: "13px",
                  resize: "none",
                  outline: "none",
                  fontFamily: "inherit",
                }}
              />
              <span
                style={{
                  position: "absolute",
                  right: "12px",
                  bottom: "12px",
                  fontSize: "16px",
                  color: "#aaa",
                }}
              >
                🎙
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom nav */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          padding: "16px 28px",
          background: "#fff",
          borderTop: "1px solid #e5e5e5",
        }}
      >
        <button
          onClick={onBack}
          style={{
            background: "#fff",
            border: "1px solid #d5d5d5",
            borderRadius: "8px",
            padding: "10px 22px",
            fontSize: "13px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          ← Previous
        </button>
        <button
          onClick={handleSubmit}
          disabled={isLoading || questionTypes.length === 0}
          style={{
            background: isLoading ? "#555" : "#1a1a1a",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            padding: "10px 22px",
            fontSize: "13px",
            fontWeight: 600,
            cursor: isLoading ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            opacity: isLoading ? 0.7 : 1,
          }}
        >
          {isLoading ? "Submitting…" : "Next →"}
        </button>
      </div>
    </div>
  );
}
