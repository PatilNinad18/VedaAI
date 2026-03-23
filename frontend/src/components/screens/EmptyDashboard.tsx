"use client";

import React from "react";
import TopBar from "../layout/TopBar";

interface EmptyDashboardProps {
  onCreateFirst: () => void;
}

export default function EmptyDashboard({ onCreateFirst }: EmptyDashboardProps) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <TopBar title="Assignment" />
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
          style={{ textAlign: "center", maxWidth: "380px", padding: "0 24px" }}
          className="fade-in"
        >
          {/* Illustration */}
          <svg
            width="120"
            height="110"
            viewBox="0 0 120 110"
            style={{ display: "block", margin: "0 auto 20px" }}
          >
            <circle cx="60" cy="54" r="38" fill="#e8e8e8" />
            <rect x="40" y="36" width="30" height="4" rx="2" fill="#c8c8c8" />
            <rect x="40" y="46" width="22" height="4" rx="2" fill="#c8c8c8" />
            <rect x="40" y="56" width="26" height="4" rx="2" fill="#c8c8c8" />
            <circle cx="80" cy="74" r="15" fill="#fff" stroke="#e0e0e0" strokeWidth="1.5" />
            <line x1="75" y1="69" x2="85" y2="79" stroke="#e84545" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="85" y1="69" x2="75" y2="79" stroke="#e84545" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="24" cy="38" r="5" fill="#d4f1e6" />
            <circle cx="94" cy="30" r="3.5" fill="#c7d7ff" />
            <circle cx="96" cy="72" r="3" fill="#c7d7ff" />
            <circle cx="26" cy="74" r="2.5" fill="#fcd5b5" />
            <path d="M 90 20 L 92 24 L 88 24 Z" fill="#fde68a" />
          </svg>

          <h2
            style={{
              fontSize: "20px",
              fontWeight: 600,
              color: "#1a1a1a",
              margin: "0 0 12px",
            }}
          >
            No assignments yet
          </h2>
          <p
            style={{
              fontSize: "14px",
              color: "#888",
              lineHeight: "1.65",
              margin: "0 0 28px",
            }}
          >
            Create your first assignment to start collecting and grading student
            submissions. You can set up rubrics, define marking criteria, and let
            AI assist with grading.
          </p>
          <button
            onClick={onCreateFirst}
            style={{
              background: "#1a1a1a",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              padding: "12px 22px",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            + Create Your First Assignment
          </button>
        </div>
      </div>
    </div>
  );
}
