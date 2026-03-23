"use client";

import React, { useEffect } from "react";
import Sidebar from "./layout/Sidebar";
import TopBar from "./layout/TopBar";
import EmptyDashboard from "./screens/EmptyDashboard";
import AssignmentList from "./screens/AssignmentList";
import CreateAssignment from "./screens/CreateAssignment";
import GeneratingScreen from "./screens/GeneratingScreen";
import OutputScreen from "./screens/OutputScreen";
import ErrorToast from "./ui/ErrorToast";
import { useVedaStore } from "../store/veda.store";
import { useGlobalStatusListener } from "../hooks/useGlobalStatusListener";
import type { CreateAssignmentPayload } from "../types";

export default function VedaApp() {
  const {
    screen,
    setScreen,
    assignments,
    assignmentsLoaded,
    loadAssignments,
    submitAssignment,
    deleteAssignment,
    viewAssignment,
    currentResult,
    currentAssignment,
    isLoading,
    error,
    setError,
  } = useVedaStore();

  // Mount global WebSocket listener for real-time status updates
  useGlobalStatusListener();

  // Load assignments on first mount
  useEffect(() => {
    if (!assignmentsLoaded) {
      loadAssignments();
    }
  }, [assignmentsLoaded, loadAssignments]);

  const handleSidebarNavigate = (target: typeof screen) => {
    if (target === "list") {
      if (assignments.length === 0) {
        setScreen("empty");
      } else {
        setScreen("list");
      }
    } else {
      setScreen(target);
    }
  };

  const handleSubmit = async (payload: CreateAssignmentPayload) => {
    await submitAssignment(payload);
  };

  const handleBack = () => {
    if (assignments.length > 0) {
      setScreen("list");
    } else {
      setScreen("empty");
    }
  };

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        fontFamily: "'Helvetica Neue', Arial, sans-serif",
        background: "#f5f5f5",
      }}
    >
      <Sidebar
        activeScreen={screen}
        onNavigate={handleSidebarNavigate}
        assignmentCount={assignments.length}
      />

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          maxHeight: "100vh",
          overflowY: "auto",
        }}
      >
        {/* Global error banner */}
        {error && (
          <ErrorToast message={error} onDismiss={() => setError(null)} />
        )}

        {/* ── Screen router ────────────────────────────────────────────────── */}

        {screen === "empty" && (
          <EmptyDashboard onCreateFirst={() => setScreen("create")} />
        )}

        {screen === "list" && (
          <AssignmentList
            assignments={assignments}
            onView={viewAssignment}
            onDelete={deleteAssignment}
            onCreate={() => setScreen("create")}
          />
        )}

        {screen === "create" && (
          <CreateAssignment
            onBack={handleBack}
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />
        )}

        {screen === "generating" && <GeneratingScreen />}

        {screen === "output" && currentResult && currentAssignment && (
          <OutputScreen
            result={currentResult}
            assignment={currentAssignment}
            onBack={() => setScreen("list")}
            onRegenerate={() => {
              if (currentAssignment) {
                submitAssignment({
                  title: currentAssignment.title,
                  dueDate: currentAssignment.dueDate,
                  questionTypes: currentAssignment.questionTypes,
                  instructions: currentAssignment.instructions,
                  subject: currentAssignment.subject,
                  className: currentAssignment.className,
                });
              }
            }}
          />
        )}

        {/* Fallback: output screen without result */}
        {screen === "output" && (!currentResult || !currentAssignment) && (
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#f5f5f5",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: "16px", color: "#888", marginBottom: "16px" }}>
                No result to display.
              </p>
              <button
                onClick={handleBack}
                style={{
                  background: "#1a1a1a",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  padding: "10px 20px",
                  fontSize: "13px",
                  cursor: "pointer",
                }}
              >
                ← Back to Assignments
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
