"use client";

import React, { useState, useEffect } from "react";

const STEPS = [
  { label: "Connecting to AI engine…", progress: 15 },
  { label: "Analysing question requirements…", progress: 35 },
  { label: "Generating questions for each section…", progress: 60 },
  { label: "Validating output structure…", progress: 80 },
  { label: "Saving to database…", progress: 95 },
];

export default function GeneratingScreen() {
  const [stepIndex, setStepIndex] = useState(0);
  const [dots, setDots] = useState(".");

  useEffect(() => {
    const dotTimer = setInterval(
      () => setDots((d) => (d.length >= 3 ? "." : d + ".")),
      450
    );
    const stepTimer = setInterval(() => {
      setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
    }, 2800);
    return () => {
      clearInterval(dotTimer);
      clearInterval(stepTimer);
    };
  }, []);

  const current = STEPS[stepIndex];

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f5f5f5",
      }}
    >
      <div
        style={{ textAlign: "center", maxWidth: "400px", padding: "0 24px" }}
        className="fade-in"
      >
        {/* Animated spinner */}
        <div style={{ position: "relative", width: "72px", height: "72px", margin: "0 auto 28px" }}>
          <div
            style={{
              width: "72px",
              height: "72px",
              border: "3px solid #e5e5e5",
              borderTop: "3px solid #1a1a1a",
              borderRadius: "50%",
              animation: "spin 0.9s linear infinite",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: "10px",
              border: "2px solid transparent",
              borderTop: "2px solid #e85d26",
              borderRadius: "50%",
              animation: "spin 1.4s linear infinite reverse",
            }}
          />
        </div>

        <h2
          style={{
            fontSize: "20px",
            fontWeight: 600,
            color: "#1a1a1a",
            margin: "0 0 8px",
          }}
        >
          Generating your question paper{dots}
        </h2>
        <p
          style={{
            fontSize: "14px",
            color: "#888",
            margin: "0 0 32px",
            lineHeight: "1.6",
          }}
        >
          AI is crafting structured questions based on your requirements. This
          usually takes 15–30 seconds.
        </p>

        {/* Progress bar */}
        <div
          style={{
            background: "#e5e5e5",
            borderRadius: "6px",
            height: "6px",
            marginBottom: "12px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              background: "#1a1a1a",
              height: "100%",
              borderRadius: "6px",
              width: `${current.progress}%`,
              transition: "width 0.8s ease",
            }}
          />
        </div>

        <p
          style={{
            fontSize: "12px",
            color: "#aaa",
            margin: 0,
          }}
        >
          {current.label}
        </p>

        {/* Step dots */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "6px",
            marginTop: "20px",
          }}
        >
          {STEPS.map((_, i) => (
            <div
              key={i}
              style={{
                width: i === stepIndex ? "20px" : "6px",
                height: "6px",
                borderRadius: "3px",
                background: i <= stepIndex ? "#1a1a1a" : "#e0e0e0",
                transition: "all 0.3s ease",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
