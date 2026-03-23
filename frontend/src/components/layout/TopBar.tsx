"use client";

import React from "react";

interface TopBarProps {
  title: string;
  onBack?: () => void;
}

export default function TopBar({ title, onBack }: TopBarProps) {
  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "14px 28px",
        background: "#fff",
        borderBottom: "1px solid #e5e5e5",
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {onBack && (
          <button
            onClick={onBack}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "18px",
              color: "#555",
              display: "flex",
              alignItems: "center",
            }}
          >
            ←
          </button>
        )}
        <span style={{ fontSize: "12px", color: "#aaa" }}>⊞</span>
        <span style={{ fontSize: "14px", color: "#555" }}>{title}</span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
        <span style={{ fontSize: "18px", cursor: "pointer" }}>🔔</span>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div
            style={{
              width: "30px",
              height: "30px",
              borderRadius: "50%",
              background: "#dbeafe",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "13px",
            }}
          >
            👤
          </div>
          <span style={{ fontSize: "13px", color: "#333" }}>John Doe ▾</span>
        </div>
      </div>
    </header>
  );
}
