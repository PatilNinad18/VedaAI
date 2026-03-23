"use client";

import React, { useState } from "react";
import TopBar from "../layout/TopBar";
import type { AssignmentDocument } from "../../types";

interface AssignmentListProps {
  assignments: AssignmentDocument[];
  onView: (assignment: AssignmentDocument) => void;
  onDelete: (id: string) => void;
  onCreate: () => void;
}

const STATUS_BADGE: Record<string, { bg: string; color: string; label: string }> = {
  pending:    { bg: "#fef9c3", color: "#a16207", label: "Pending" },
  processing: { bg: "#dbeafe", color: "#1d4ed8", label: "Processing…" },
  completed:  { bg: "#dcfce7", color: "#15803d", label: "Completed" },
  failed:     { bg: "#fee2e2", color: "#dc2626", label: "Failed" },
};

export default function AssignmentList({
  assignments,
  onView,
  onDelete,
  onCreate,
}: AssignmentListProps) {
  const [search, setSearch] = useState("");
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const filtered = assignments.filter((a) =>
    a.title.toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "—";
    try {
      return new Date(dateStr).toLocaleDateString("en-GB").replace(/\//g, "-");
    } catch {
      return dateStr;
    }
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <TopBar title="Assignment" />

      <div
        style={{
          flex: 1,
          background: "#f5f5f5",
          overflowY: "auto",
          padding: "24px 28px 100px",
        }}
      >
        {/* Page heading */}
        <div style={{ marginBottom: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "#22c55e",
                flexShrink: 0,
              }}
            />
            <h1 style={{ fontSize: "20px", fontWeight: 700, color: "#1a1a1a" }}>
              Assignments
            </h1>
          </div>
          <p style={{ fontSize: "13px", color: "#888" }}>
            Manage and create assignments for your classes.
          </p>
        </div>

        {/* Search + filter bar */}
        <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
          <button
            style={{
              background: "#fff",
              border: "1px solid #e5e5e5",
              borderRadius: "8px",
              padding: "8px 14px",
              fontSize: "13px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              color: "#555",
            }}
          >
            ⚙ Filter By
          </button>
          <div style={{ flex: 1, position: "relative" }}>
            <span
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: "14px",
                color: "#aaa",
              }}
            >
              🔍
            </span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Assignment"
              style={{
                width: "100%",
                padding: "9px 12px 9px 36px",
                border: "1px solid #e5e5e5",
                borderRadius: "8px",
                fontSize: "13px",
                background: "#fff",
                outline: "none",
              }}
            />
          </div>
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "60px 20px",
              color: "#aaa",
              fontSize: "14px",
            }}
          >
            {search ? `No assignments matching "${search}"` : "No assignments yet."}
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "12px",
            }}
          >
            {filtered.map((assignment) => {
              const badge = STATUS_BADGE[assignment.status] || STATUS_BADGE.pending;
              return (
                <div
                  key={assignment._id}
                  className="fade-in"
                  style={{
                    background: "#fff",
                    borderRadius: "12px",
                    padding: "18px 20px",
                    border: "1px solid #efefef",
                    position: "relative",
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    if (openMenu !== assignment._id) {
                      onView(assignment);
                    }
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <div style={{ flex: 1, marginRight: "8px" }}>
                      <h3
                        style={{
                          fontSize: "15px",
                          fontWeight: 600,
                          color: "#1a1a1a",
                          margin: "0 0 6px",
                        }}
                      >
                        {assignment.title}
                      </h3>
                      <span
                        style={{
                          display: "inline-block",
                          background: badge.bg,
                          color: badge.color,
                          borderRadius: "6px",
                          padding: "2px 8px",
                          fontSize: "11px",
                          fontWeight: 600,
                          marginBottom: "14px",
                        }}
                      >
                        {badge.label}
                      </span>
                    </div>

                    {/* 3-dot menu */}
                    <div style={{ position: "relative" }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenu(openMenu === assignment._id ? null : assignment._id);
                        }}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          fontSize: "18px",
                          color: "#aaa",
                          padding: "2px 6px",
                          borderRadius: "4px",
                        }}
                      >
                        ⋮
                      </button>

                      {openMenu === assignment._id && (
                        <div
                          style={{
                            position: "absolute",
                            right: 0,
                            top: "100%",
                            background: "#fff",
                            border: "1px solid #e5e5e5",
                            borderRadius: "8px",
                            zIndex: 20,
                            boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
                            minWidth: "150px",
                            overflow: "hidden",
                          }}
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenu(null);
                              onView(assignment);
                            }}
                            style={{
                              display: "block",
                              width: "100%",
                              textAlign: "left",
                              padding: "10px 16px",
                              border: "none",
                              background: "none",
                              cursor: "pointer",
                              fontSize: "13px",
                              color: "#333",
                            }}
                          >
                            View Assignment
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenu(null);
                              onDelete(assignment._id);
                            }}
                            style={{
                              display: "block",
                              width: "100%",
                              textAlign: "left",
                              padding: "10px 16px",
                              border: "none",
                              background: "none",
                              cursor: "pointer",
                              fontSize: "13px",
                              color: "#e84545",
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "12px",
                      color: "#888",
                    }}
                  >
                    <span>
                      <strong style={{ color: "#555" }}>Assigned on : </strong>
                      {formatDate(assignment.createdAt)}
                    </span>
                    <span>
                      <strong style={{ color: "#555" }}>Due : </strong>
                      {formatDate(assignment.dueDate)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating create button */}
      <div
        style={{
          position: "fixed",
          bottom: "28px",
          left: "calc(220px + 50%)",
          transform: "translateX(-50%)",
          zIndex: 30,
        }}
      >
        <button
          onClick={onCreate}
          style={{
            background: "#1a1a1a",
            color: "#fff",
            border: "none",
            borderRadius: "24px",
            padding: "13px 26px",
            fontSize: "14px",
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
          }}
        >
          + Create Assignment
        </button>
      </div>
    </div>
  );
}
