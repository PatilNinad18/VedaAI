"use client";

import React, { useRef } from "react";
import TopBar from "../layout/TopBar";
import type { ResultDocument, AssignmentDocument } from "../../types";

interface OutputScreenProps {
  result: ResultDocument;
  assignment: AssignmentDocument;
  onBack: () => void;
  onRegenerate: () => void;
}

const DIFFICULTY_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  easy:   { bg: "#dcfce7", color: "#15803d", label: "Easy" },
  medium: { bg: "#fef9c3", color: "#a16207", label: "Medium" },
  hard:   { bg: "#fee2e2", color: "#dc2626", label: "Hard" },
};

export default function OutputScreen({
  result,
  assignment,
  onBack,
  onRegenerate,
}: OutputScreenProps) {
  const paperRef = useRef<HTMLDivElement>(null);

  const totalMarks = result.sections.reduce(
    (sum, sec) => sum + sec.questions.reduce((s, q) => s + q.marks, 0),
    0
  );

  const handlePrint = () => {
    const content = paperRef.current?.innerHTML || "";
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
  <title>${assignment.title} — Question Paper</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Times New Roman', serif; padding: 40px; color: #000; }
    h1 { font-size: 18px; text-align: center; margin-bottom: 4px; }
    h2 { font-size: 14px; text-align: center; font-weight: normal; margin-bottom: 2px; }
    .section-title { font-size: 15px; font-weight: bold; text-align: center; margin: 20px 0 4px; }
    .section-type { font-size: 13px; font-weight: bold; margin-bottom: 2px; }
    .section-inst { font-size: 12px; font-style: italic; margin-bottom: 12px; }
    .question { display: flex; gap: 8px; margin-bottom: 10px; font-size: 13px; }
    .q-num { font-weight: bold; min-width: 22px; }
    .q-text { flex: 1; line-height: 1.5; }
    .q-marks { font-size: 12px; font-weight: bold; white-space: nowrap; }
    .badge { padding: 1px 6px; border-radius: 3px; font-size: 10px; font-weight: bold; margin-right: 6px; }
    .easy { background: #dcfce7; color: #15803d; }
    .medium { background: #fef9c3; color: #a16207; }
    .hard { background: #fee2e2; color: #dc2626; }
    .meta { display: flex; justify-content: space-between; font-size: 12px; margin: 12px 0; }
    .student-info { margin: 16px 0; font-size: 13px; }
    .student-info p { margin-bottom: 6px; }
    .underline { border-bottom: 1px solid #000; display: inline-block; min-width: 160px; }
    .divider { border: none; border-top: 1.5px solid #000; margin: 16px 0; }
    .footer { text-align: center; margin-top: 30px; font-size: 12px; font-style: italic; color: #555; }
    .answer-key { margin-top: 40px; border-top: 2px solid #000; padding-top: 20px; }
    .answer-key h2 { text-align: left; font-weight: bold; margin-bottom: 14px; font-size: 15px; }
    .answer { display: flex; gap: 8px; font-size: 12px; margin-bottom: 8px; line-height: 1.5; }
    @media print {
      body { padding: 20px; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  ${content}
</body>
</html>`);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 400);
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <TopBar title="Assignment Output" onBack={onBack} />

      {/* Black banner */}
      <div
        style={{
          background: "#1a1a1a",
          color: "#fff",
          padding: "16px 28px",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "20px",
        }}
      >
        <div style={{ flex: 1 }}>
          <p style={{ margin: "0 0 4px", fontSize: "11px", color: "#888" }}>
            Your question paper is ready
          </p>
          <h2 style={{ margin: 0, fontSize: "15px", fontWeight: 600, lineHeight: "1.4" }}>
            Your AI-generated question paper for{" "}
            <span style={{ color: "#e85d26" }}>{assignment.subject}</span> —{" "}
            {assignment.className} is ready to download.
          </h2>
        </div>
        <div style={{ display: "flex", gap: "10px", flexShrink: 0, alignItems: "center" }}>
          <button
            onClick={onRegenerate}
            style={{
              background: "transparent",
              border: "1px solid #555",
              color: "#ccc",
              borderRadius: "7px",
              padding: "8px 16px",
              fontSize: "12px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            ↻ Regenerate
          </button>
          <button
            onClick={handlePrint}
            style={{
              background: "#fff",
              color: "#1a1a1a",
              border: "none",
              borderRadius: "7px",
              padding: "8px 18px",
              fontSize: "12px",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            ⬇ Download as PDF
          </button>
        </div>
      </div>

      {/* Paper content */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "28px",
          background: "#f5f5f5",
        }}
      >
        <div
          ref={paperRef}
          style={{
            background: "#fff",
            borderRadius: "14px",
            padding: "48px 56px",
            border: "1px solid #efefef",
            maxWidth: "820px",
            margin: "0 auto",
          }}
          className="fade-in"
        >
          {/* School header */}
          <div
            style={{
              textAlign: "center",
              marginBottom: "24px",
              paddingBottom: "20px",
              borderBottom: "2px solid #1a1a1a",
            }}
          >
            <h1
              style={{
                fontSize: "20px",
                fontWeight: 700,
                margin: "0 0 4px",
                fontFamily: "Georgia, serif",
              }}
            >
              Delhi Public School, Sector-4, Bokaro
            </h1>
            <p style={{ fontSize: "14px", margin: "0 0 2px" }}>
              Subject: {assignment.subject}
            </p>
            <p style={{ fontSize: "14px", margin: 0 }}>
              Class: {assignment.className}
            </p>
          </div>

          {/* Meta row */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "13px",
              marginBottom: "14px",
            }}
          >
            <span>
              <strong>Time Allowed:</strong> 45 minutes
            </span>
            <span>
              <strong>Maximum Marks:</strong> {totalMarks}
            </span>
          </div>

          <p
            style={{
              fontSize: "13px",
              fontStyle: "italic",
              color: "#555",
              marginBottom: "20px",
            }}
          >
            All questions are compulsory unless stated otherwise.
          </p>

          {/* Student info */}
          <div style={{ marginBottom: "24px" }}>
            {[
              { label: "Name", width: "220px" },
              { label: "Roll Number", width: "180px" },
            ].map(({ label, width }) => (
              <p key={label} style={{ fontSize: "13px", margin: "0 0 8px" }}>
                {label}:{" "}
                <span
                  style={{
                    borderBottom: "1px solid #333",
                    display: "inline-block",
                    width,
                  }}
                >
                  &nbsp;
                </span>
              </p>
            ))}
            <p style={{ fontSize: "13px", margin: 0 }}>
              Class: {assignment.className} &nbsp;&nbsp; Section:{" "}
              <span
                style={{
                  borderBottom: "1px solid #333",
                  display: "inline-block",
                  width: "80px",
                }}
              >
                &nbsp;
              </span>
            </p>
          </div>

          {/* Sections */}
          {result.sections.map((section, si) => (
            <div key={si} style={{ marginBottom: "32px" }}>
              <h2
                style={{
                  fontSize: "16px",
                  fontWeight: 700,
                  textAlign: "center",
                  margin: "0 0 8px",
                }}
              >
                {section.title}
              </h2>
              <h3
                style={{
                  fontSize: "13px",
                  fontWeight: 600,
                  margin: "0 0 4px",
                }}
              >
                {section.questionType}
              </h3>
              <p
                style={{
                  fontSize: "12px",
                  color: "#666",
                  margin: "0 0 14px",
                  fontStyle: "italic",
                }}
              >
                {section.instruction}
              </p>

              {section.questions.map((q, qi) => {
                const diff = DIFFICULTY_STYLE[q.difficulty] || DIFFICULTY_STYLE.easy;
                return (
                  <div
                    key={qi}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "10px",
                      marginBottom: "12px",
                      fontSize: "13px",
                      lineHeight: "1.55",
                    }}
                  >
                    <span style={{ fontWeight: 600, minWidth: "24px", flexShrink: 0 }}>
                      {qi + 1}.
                    </span>
                    <div style={{ flex: 1 }}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "2px 8px",
                          borderRadius: "5px",
                          fontSize: "10px",
                          fontWeight: 700,
                          marginRight: "8px",
                          background: diff.bg,
                          color: diff.color,
                          verticalAlign: "middle",
                        }}
                      >
                        {diff.label}
                      </span>
                      {q.text}
                    </div>
                    <span
                      style={{
                        fontSize: "12px",
                        color: "#444",
                        fontWeight: 600,
                        flexShrink: 0,
                        whiteSpace: "nowrap",
                      }}
                    >
                      [{q.marks} {q.marks === 1 ? "Mark" : "Marks"}]
                    </span>
                  </div>
                );
              })}
            </div>
          ))}

          {/* Footer */}
          <div
            style={{
              textAlign: "center",
              borderTop: "1px solid #e5e5e5",
              paddingTop: "20px",
              marginTop: "8px",
            }}
          >
            <p style={{ fontSize: "13px", color: "#888", fontStyle: "italic" }}>
              End of Question Paper
            </p>
          </div>

          {/* Answer Key */}
          {result.sections.some((s) => s.answerKey && s.answerKey.length > 0) && (
            <div
              style={{
                marginTop: "40px",
                borderTop: "2px solid #1a1a1a",
                paddingTop: "24px",
              }}
            >
              <h2
                style={{
                  fontSize: "16px",
                  fontWeight: 700,
                  margin: "0 0 16px",
                }}
              >
                Answer Key:
              </h2>
              {result.sections.map((section, si) =>
                section.answerKey?.map((ans, ai) => (
                  <div
                    key={`${si}-${ai}`}
                    style={{
                      display: "flex",
                      gap: "8px",
                      fontSize: "13px",
                      marginBottom: "10px",
                      lineHeight: "1.55",
                    }}
                  >
                    <span style={{ fontWeight: 600, minWidth: "24px", flexShrink: 0 }}>
                      {ai + 1}.
                    </span>
                    <span style={{ color: "#444" }}>{ans}</span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
