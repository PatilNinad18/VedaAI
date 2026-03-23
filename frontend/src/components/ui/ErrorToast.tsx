"use client";

import React from "react";

interface ErrorToastProps {
  message: string;
  onDismiss: () => void;
}

export default function ErrorToast({ message, onDismiss }: ErrorToastProps) {
  return (
    <div
      style={{
        background: "#fee2e2",
        color: "#991b1b",
        padding: "12px 20px",
        fontSize: "13px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px",
        borderBottom: "1px solid #fecaca",
      }}
      className="fade-in"
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span style={{ fontSize: "15px" }}>⚠</span>
        <span>{message}</span>
      </div>
      <button
        onClick={onDismiss}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "#991b1b",
          fontWeight: 700,
          fontSize: "16px",
          lineHeight: 1,
          padding: "2px 6px",
        }}
      >
        ✕
      </button>
    </div>
  );
}
