import React, { useEffect, useRef, useState } from "react";
import { useVedaStore } from "./store/veda.store";
import { useGlobalStatusListener } from "./hooks/useGlobalStatusListener";
import type { CreateAssignmentPayload, QuestionType } from "./types";

// ─── Constants ────────────────────────────────────────────────────────────────

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

const DIFFICULTY_COLORS = {
  easy: { bg: "#dcfce7", text: "#15803d", label: "Easy" },
  medium: { bg: "#fef9c3", text: "#a16207", label: "Medium" },
  hard: { bg: "#fee2e2", text: "#dc2626", label: "Hard" },
};

// ─── Shared UI primitives ─────────────────────────────────────────────────────

const counterBtn: React.CSSProperties = {
  width: "28px", height: "28px", borderRadius: "6px", border: "1px solid #e5e5e5",
  background: "#fff", cursor: "pointer", fontSize: "16px", display: "flex",
  alignItems: "center", justifyContent: "center", lineHeight: "1", padding: "0",
};

function NavItem({ icon, label, active, badge, onClick }: {
  icon: string; label: string; active?: boolean; badge?: string | number; onClick: () => void;
}) {
  return (
    <button onClick={onClick} style={{
      display: "flex", alignItems: "center", gap: "10px",
      padding: "9px 12px", borderRadius: "8px", width: "100%", border: "none",
      background: active ? "#1a1a1a" : "transparent",
      color: active ? "#fff" : "#555", cursor: "pointer",
      fontSize: "14px", fontWeight: active ? "500" : "400",
      transition: "background 0.15s", textAlign: "left",
    }}>
      <span style={{ fontSize: "15px", opacity: active ? 1 : 0.7 }}>{icon}</span>
      <span style={{ flex: 1 }}>{label}</span>
      {badge && (
        <span style={{
          background: "#e85d26", color: "#fff", borderRadius: "10px",
          padding: "1px 7px", fontSize: "11px", fontWeight: "600",
        }}>{badge}</span>
      )}
    </button>
  );
}

function Sidebar({ activeScreen, onNavigate }: {
  activeScreen: string;
  onNavigate: (target: "home" | "list" | "create") => void;
}) {
  const { assignments } = useVedaStore();
  return (
    <div style={{
      width: "220px", minHeight: "100vh", background: "#fff",
      borderRight: "1px solid #e5e5e5", display: "flex", flexDirection: "column",
      padding: "20px 12px", flexShrink: 0,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "24px", padding: "0 4px" }}>
        <div style={{
          width: "30px", height: "30px", background: "#e85d26", borderRadius: "7px",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px",
        }}>🎓</div>
        <span style={{ fontWeight: "700", fontSize: "17px", color: "#1a1a1a", fontFamily: "Georgia, serif" }}>VedaAI</span>
      </div>

      <button onClick={() => onNavigate("create")} style={{
        background: "#1a1a1a", color: "#fff", border: "none", borderRadius: "8px",
        padding: "10px 14px", fontSize: "13px", fontWeight: "600", cursor: "pointer",
        display: "flex", alignItems: "center", gap: "6px", marginBottom: "20px", width: "100%",
      }}>
        <span>+</span> Create Assignment
      </button>

      <nav style={{ display: "flex", flexDirection: "column", gap: "2px", flex: 1 }}>
        <NavItem icon="⊞" label="Home" active={activeScreen === "empty"} onClick={() => onNavigate("home")} />
        <NavItem icon="👥" label="My Groups" onClick={() => {}} />
        <NavItem
          icon="📄" label="Assignments"
          active={activeScreen === "list" || activeScreen === "create" || activeScreen === "generating" || activeScreen === "output"}
          badge={assignments.length > 0 ? assignments.length : undefined}
          onClick={() => onNavigate("list")}
        />
        <NavItem icon="✨" label="AI Teacher's Toolkit" onClick={() => {}} />
        <NavItem icon="📚" label="My Library" onClick={() => {}} />
      </nav>

      <div style={{ borderTop: "1px solid #f0f0f0", paddingTop: "16px", marginTop: "16px" }}>
        <button style={{
          background: "none", border: "none", color: "#888", fontSize: "13px",
          cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", padding: "6px 4px",
        }}>⚙ Settings</button>
        <div style={{
          display: "flex", alignItems: "center", gap: "10px", marginTop: "12px", padding: "10px 8px",
          background: "#f9f9f9", borderRadius: "10px",
        }}>
          <div style={{
            width: "34px", height: "34px", borderRadius: "50%", background: "#dbeafe",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", flexShrink: 0,
          }}>🏫</div>
          <div>
            <div style={{ fontSize: "12px", fontWeight: "600", color: "#1a1a1a" }}>Delhi Public School</div>
            <div style={{ fontSize: "11px", color: "#888" }}>Bokaro Steel City</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TopBar({ title, onBack }: { title: string; onBack?: () => void }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "14px 28px", background: "#fff", borderBottom: "1px solid #e5e5e5",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {onBack && (
          <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "18px", color: "#555" }}>←</button>
        )}
        <span style={{ fontSize: "12px", color: "#aaa" }}>⊞</span>
        <span style={{ fontSize: "14px", color: "#555" }}>{title}</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
        <span style={{ fontSize: "18px" }}>🔔</span>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ width: "30px", height: "30px", borderRadius: "50%", background: "#dbeafe", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px" }}>👤</div>
          <span style={{ fontSize: "13px", color: "#333" }}>John Doe ▾</span>
        </div>
      </div>
    </div>
  );
}

// ─── Screen 1: Empty Dashboard ────────────────────────────────────────────────

function EmptyDashboard({ onCreateFirst }: { onCreateFirst: () => void }) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <TopBar title="Assignment" />
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: "#f5f5f5" }}>
        <div style={{ textAlign: "center", maxWidth: "380px" }}>
          <svg width="120" height="100" viewBox="0 0 120 100" style={{ display: "block", margin: "0 auto 16px" }}>
            <circle cx="60" cy="50" r="36" fill="#e8e8e8" />
            <rect x="38" y="32" width="32" height="4" rx="2" fill="#ccc" />
            <rect x="38" y="42" width="24" height="4" rx="2" fill="#ccc" />
            <circle cx="80" cy="68" r="14" fill="#fff" stroke="#e5e5e5" strokeWidth="1.5" />
            <text x="80" y="73" textAnchor="middle" fontSize="16" fill="#e84545">✕</text>
            <circle cx="26" cy="34" r="5" fill="#d4f1e6" />
            <circle cx="92" cy="32" r="3" fill="#c7d7ff" />
            <circle cx="94" cy="70" r="3" fill="#c7d7ff" />
            <circle cx="28" cy="70" r="2" fill="#fcd5b5" />
          </svg>
          <h2 style={{ fontSize: "20px", fontWeight: "600", color: "#1a1a1a", margin: "0 0 10px" }}>No assignments yet</h2>
          <p style={{ fontSize: "14px", color: "#888", lineHeight: "1.6", margin: "0 0 28px" }}>
            Create your first assignment to start collecting and grading student submissions. You can set up rubrics, define marking criteria, and let AI assist with grading.
          </p>
          <button onClick={onCreateFirst} style={{
            background: "#1a1a1a", color: "#fff", border: "none", borderRadius: "8px",
            padding: "12px 22px", fontSize: "14px", fontWeight: "600", cursor: "pointer",
            display: "inline-flex", alignItems: "center", gap: "6px",
          }}>
            + Create Your First Assignment
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Screen 2: Assignment List ────────────────────────────────────────────────

function AssignmentList({ onView, onDelete, onCreate }: {
  onView: (id: string) => void;
  onDelete: (id: string) => void;
  onCreate: () => void;
}) {
  const { assignments, isLoading } = useVedaStore();
  const [search, setSearch] = useState("");
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const filtered = assignments.filter(a =>
    a.title.toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (iso: string) => {
    if (!iso) return "—";
    if (iso.includes("-") && iso.length === 10 && iso[4] === "-") {
      const d = new Date(iso);
      return isNaN(d.getTime()) ? iso : d.toLocaleDateString("en-GB").replace(/\//g, "-");
    }
    return iso;
  };

  const statusBadge = (status: string) => {
    const map: Record<string, { bg: string; color: string }> = {
      completed: { bg: "#dcfce7", color: "#15803d" },
      pending: { bg: "#fef9c3", color: "#a16207" },
      processing: { bg: "#dbeafe", color: "#1d4ed8" },
      failed: { bg: "#fee2e2", color: "#dc2626" },
    };
    const s = map[status] || map.pending;
    return (
      <span style={{
        background: s.bg, color: s.color, borderRadius: "6px",
        padding: "2px 8px", fontSize: "10px", fontWeight: "600", textTransform: "capitalize",
      }}>{status}</span>
    );
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#f5f5f5" }}>
      <TopBar title="Assignment" />
      <div style={{ flex: 1, padding: "24px 28px", overflowY: "auto" }}>
        <div style={{ marginBottom: "20px" }}>
          <h1 style={{ fontSize: "22px", fontWeight: "700", color: "#1a1a1a", margin: "0 0 4px" }}>Assignments</h1>
          <p style={{ fontSize: "13px", color: "#888", margin: 0 }}>Manage and create assignments for your classes.</p>
        </div>

        <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
          <button style={{
            background: "#fff", border: "1px solid #e5e5e5", borderRadius: "8px",
            padding: "8px 14px", fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px",
          }}>⚙ Filter By</button>
          <div style={{ flex: 1, position: "relative" }}>
            <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", fontSize: "14px", color: "#aaa" }}>🔍</span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search Assignment"
              style={{
                width: "100%", padding: "8px 12px 8px 36px", border: "1px solid #e5e5e5",
                borderRadius: "8px", fontSize: "13px", background: "#fff", boxSizing: "border-box", outline: "none",
              }}
            />
          </div>
        </div>

        {isLoading && filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#aaa" }}>Loading assignments...</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            {filtered.map(a => (
              <div key={a._id} style={{
                background: "#fff", borderRadius: "12px", padding: "18px 20px",
                border: "1px solid #efefef", position: "relative",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                  <h3 style={{ fontSize: "15px", fontWeight: "600", color: "#1a1a1a", margin: 0, flex: 1, paddingRight: "8px" }}>{a.title}</h3>
                  <div style={{ position: "relative" }}>
                    <button onClick={() => setOpenMenu(openMenu === a._id ? null : a._id)} style={{
                      background: "none", border: "none", cursor: "pointer", fontSize: "16px", color: "#aaa", padding: "2px 4px",
                    }}>⋮</button>
                    {openMenu === a._id && (
                      <div style={{
                        position: "absolute", right: 0, top: "100%", background: "#fff",
                        border: "1px solid #e5e5e5", borderRadius: "8px", zIndex: 10,
                        boxShadow: "0 4px 12px rgba(0,0,0,0.08)", minWidth: "140px", overflow: "hidden",
                      }}>
                        <button onClick={() => { onView(a._id); setOpenMenu(null); }} style={{
                          display: "block", width: "100%", textAlign: "left", padding: "10px 16px",
                          border: "none", background: "none", cursor: "pointer", fontSize: "13px", color: "#333",
                        }}>View Assignment</button>
                        <button onClick={() => { onDelete(a._id); setOpenMenu(null); }} style={{
                          display: "block", width: "100%", textAlign: "left", padding: "10px 16px",
                          border: "none", background: "none", cursor: "pointer", fontSize: "13px", color: "#e84545",
                        }}>Delete</button>
                      </div>
                    )}
                  </div>
                </div>
                <div style={{ marginBottom: "12px" }}>{statusBadge(a.status)}</div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#888" }}>
                  <span><strong style={{ color: "#555" }}>Assigned on :</strong> {formatDate(a.createdAt)}</span>
                  <span><strong style={{ color: "#555" }}>Due :</strong> {formatDate(a.dueDate)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ position: "fixed", bottom: "24px", left: "50%", transform: "translateX(-50%)" }}>
        <button onClick={onCreate} style={{
          background: "#1a1a1a", color: "#fff", border: "none", borderRadius: "24px",
          padding: "12px 24px", fontSize: "14px", fontWeight: "600", cursor: "pointer",
          display: "flex", alignItems: "center", gap: "6px",
          boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
        }}>
          + Create Assignment
        </button>
      </div>
    </div>
  );
}

// ─── Screen 3: Create Assignment ──────────────────────────────────────────────

function CreateAssignment({ onBack, onSubmit }: {
  onBack: () => void;
  onSubmit: (payload: CreateAssignmentPayload) => void;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("Science");
  const [className, setClassName] = useState("Grade 8");
  const [dueDate, setDueDate] = useState("");
  const [instructions, setInstructions] = useState("");
  const [questionTypes, setQuestionTypes] = useState<(QuestionType & { id: number })[]>([
    { id: 1, type: "Multiple Choice Questions", count: 4, marks: 1 },
    { id: 2, type: "Short Questions", count: 3, marks: 2 },
    { id: 3, type: "Diagram/Graph-Based Questions", count: 5, marks: 5 },
    { id: 4, type: "Numerical Problems", count: 5, marks: 5 },
  ]);
  const nextId = useRef(10);

  const totalQuestions = questionTypes.reduce((s, q) => s + q.count, 0);
  const totalMarks = questionTypes.reduce((s, q) => s + q.count * q.marks, 0);

  const addRow = () => {
    setQuestionTypes(prev => [...prev, { id: nextId.current++, type: "Multiple Choice Questions", count: 2, marks: 1 }]);
  };
  const removeRow = (id: number) => setQuestionTypes(prev => prev.filter(q => q.id !== id));
  const updateRow = (id: number, field: "type", val: string) => {
    setQuestionTypes(prev => prev.map(q => q.id === id ? { ...q, [field]: val } : q));
  };
  const counter = (id: number, field: "count" | "marks", delta: number) => {
    setQuestionTypes(prev => prev.map(q => q.id === id ? { ...q, [field]: Math.max(1, q[field] + delta) } : q));
  };

  const handleSubmit = () => {
    if (!title.trim()) { alert("Please enter a title for the assignment"); return; }
    if (!dueDate) { alert("Please select a due date"); return; }
    onSubmit({
      title: title.trim(),
      dueDate,
      subject,
      className,
      questionTypes: questionTypes.map(({ type, count, marks }) => ({ type, count, marks })),
      instructions,
    });
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#f5f5f5" }}>
      <TopBar title="Assignment" onBack={onBack} />
      <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>
        <div style={{ marginBottom: "20px" }}>
          <h1 style={{ fontSize: "20px", fontWeight: "700", color: "#1a1a1a", margin: "0 0 4px" }}>Create Assignment</h1>
          <p style={{ fontSize: "13px", color: "#888", margin: 0 }}>Setup a new assignment for your students.</p>
        </div>

        <div style={{ background: "#e5e5e5", borderRadius: "4px", height: "4px", marginBottom: "24px" }}>
          <div style={{ background: "#1a1a1a", width: "50%", height: "100%", borderRadius: "4px" }} />
        </div>

        <div style={{ background: "#fff", borderRadius: "14px", padding: "28px", border: "1px solid #efefef" }}>
          <h2 style={{ fontSize: "16px", fontWeight: "600", margin: "0 0 4px" }}>Assignment Details</h2>
          <p style={{ fontSize: "12px", color: "#aaa", margin: "0 0 24px" }}>Basic information about your assignment</p>

          {/* Title + Subject + Class */}
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "12px", marginBottom: "20px" }}>
            <div>
              <label style={{ fontSize: "13px", fontWeight: "500", color: "#333", display: "block", marginBottom: "6px" }}>Assignment Title *</label>
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Quiz on Electricity"
                style={{ width: "100%", padding: "10px 14px", border: "1px solid #e5e5e5", borderRadius: "8px", fontSize: "13px", outline: "none", boxSizing: "border-box" }} />
            </div>
            <div>
              <label style={{ fontSize: "13px", fontWeight: "500", color: "#333", display: "block", marginBottom: "6px" }}>Subject</label>
              <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="e.g. Science"
                style={{ width: "100%", padding: "10px 14px", border: "1px solid #e5e5e5", borderRadius: "8px", fontSize: "13px", outline: "none", boxSizing: "border-box" }} />
            </div>
            <div>
              <label style={{ fontSize: "13px", fontWeight: "500", color: "#333", display: "block", marginBottom: "6px" }}>Class</label>
              <input value={className} onChange={e => setClassName(e.target.value)} placeholder="e.g. Grade 8"
                style={{ width: "100%", padding: "10px 14px", border: "1px solid #e5e5e5", borderRadius: "8px", fontSize: "13px", outline: "none", boxSizing: "border-box" }} />
            </div>
          </div>

          {/* File Upload */}
          <div
            onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={e => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files[0]; if (f) setUploadedFile(f); }}
            style={{
              border: `2px dashed ${isDragging ? "#1a1a1a" : "#d5d5d5"}`,
              borderRadius: "10px", padding: "32px 20px", textAlign: "center", marginBottom: "8px",
              background: isDragging ? "#f9f9f9" : "#fafafa", transition: "all 0.15s",
            }}
          >
            <div style={{ fontSize: "28px", marginBottom: "8px", color: "#aaa" }}>⬆</div>
            <p style={{ fontSize: "13px", color: "#666", margin: "0 0 12px" }}>
              {uploadedFile ? `✓ ${uploadedFile.name}` : "Choose a file or drag & drop it here"}
            </p>
            <p style={{ fontSize: "11px", color: "#bbb", margin: "0 0 14px" }}>JPEG, PNG, upto 10MB</p>
            <label style={{ background: "#fff", border: "1px solid #d5d5d5", borderRadius: "6px", padding: "7px 18px", fontSize: "12px", cursor: "pointer", color: "#444" }}>
              Browse Files
              <input type="file" style={{ display: "none" }} onChange={e => { const f = e.target.files?.[0]; if (f) setUploadedFile(f); }} />
            </label>
          </div>
          <p style={{ fontSize: "11px", color: "#bbb", margin: "0 0 20px", textAlign: "center" }}>Upload images of your preferred document/image</p>

          {/* Due Date */}
          <div style={{ marginBottom: "24px" }}>
            <label style={{ fontSize: "13px", fontWeight: "500", color: "#333", display: "block", marginBottom: "8px" }}>Due Date *</label>
            <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
              style={{ width: "100%", padding: "10px 14px", border: "1px solid #e5e5e5", borderRadius: "8px", fontSize: "13px", outline: "none", boxSizing: "border-box" }} />
          </div>

          {/* Question Types */}
          <div style={{ marginBottom: "24px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 110px 90px 28px", gap: "8px", alignItems: "center", marginBottom: "10px" }}>
              <span style={{ fontSize: "13px", fontWeight: "500", color: "#333" }}>Question Type</span>
              <span style={{ fontSize: "12px", color: "#e84545", fontWeight: "500", textAlign: "center" }}>No. of Questions</span>
              <span style={{ fontSize: "12px", color: "#888", fontWeight: "500", textAlign: "center" }}>Marks</span>
              <span />
            </div>

            {questionTypes.map(q => (
              <div key={q.id} style={{ display: "grid", gridTemplateColumns: "1fr 110px 90px 28px", gap: "8px", alignItems: "center", marginBottom: "10px" }}>
                <select value={q.type} onChange={e => updateRow(q.id, "type", e.target.value)}
                  style={{ padding: "9px 12px", border: "1px solid #e5e5e5", borderRadius: "8px", fontSize: "13px", background: "#fff", outline: "none", cursor: "pointer" }}>
                  {QUESTION_TYPE_OPTIONS.map(t => <option key={t}>{t}</option>)}
                </select>
                <div style={{ display: "flex", alignItems: "center", gap: "4px", justifyContent: "center" }}>
                  <button onClick={() => counter(q.id, "count", -1)} style={counterBtn}>−</button>
                  <span style={{ fontSize: "14px", fontWeight: "500", minWidth: "20px", textAlign: "center" }}>{q.count}</span>
                  <button onClick={() => counter(q.id, "count", 1)} style={counterBtn}>+</button>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "4px", justifyContent: "center" }}>
                  <button onClick={() => counter(q.id, "marks", -1)} style={counterBtn}>−</button>
                  <span style={{ fontSize: "14px", fontWeight: "500", minWidth: "20px", textAlign: "center" }}>{q.marks}</span>
                  <button onClick={() => counter(q.id, "marks", 1)} style={counterBtn}>+</button>
                </div>
                <button onClick={() => removeRow(q.id)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "16px", color: "#ccc", padding: "4px" }}>✕</button>
              </div>
            ))}

            <button onClick={addRow} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "13px", color: "#1a1a1a", display: "flex", alignItems: "center", gap: "6px", padding: "8px 0", fontWeight: "500" }}>
              <span style={{ width: "22px", height: "22px", borderRadius: "50%", background: "#1a1a1a", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}>+</span>
              Add Question Type
            </button>

            <div style={{ textAlign: "right", marginTop: "16px", borderTop: "1px solid #f0f0f0", paddingTop: "12px" }}>
              <div style={{ fontSize: "13px", color: "#555", marginBottom: "4px" }}>Total Questions : <strong>{totalQuestions}</strong></div>
              <div style={{ fontSize: "13px", color: "#555" }}>Total Marks : <strong>{totalMarks}</strong></div>
            </div>
          </div>

          {/* Instructions */}
          <div>
            <label style={{ fontSize: "13px", fontWeight: "500", color: "#333", display: "block", marginBottom: "8px" }}>Additional Information (For better output)</label>
            <div style={{ position: "relative" }}>
              <textarea value={instructions} onChange={e => setInstructions(e.target.value)}
                placeholder="e.g Generate a question paper for 3 hour exam duration..." rows={4}
                style={{ width: "100%", padding: "12px 14px", border: "1px solid #e5e5e5", borderRadius: "8px", fontSize: "13px", resize: "none", outline: "none", boxSizing: "border-box", fontFamily: "inherit" }} />
              <span style={{ position: "absolute", right: "12px", bottom: "12px", fontSize: "16px", color: "#aaa" }}>🎙</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", padding: "16px 28px", background: "#fff", borderTop: "1px solid #e5e5e5" }}>
        <button onClick={onBack} style={{ background: "#fff", border: "1px solid #d5d5d5", borderRadius: "8px", padding: "10px 22px", fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
          ← Previous
        </button>
        <button onClick={handleSubmit} style={{ background: "#1a1a1a", color: "#fff", border: "none", borderRadius: "8px", padding: "10px 22px", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>
          Generate Paper →
        </button>
      </div>
    </div>
  );
}

// ─── Generating Screen ────────────────────────────────────────────────────────

function GeneratingScreen() {
  const [dots, setDots] = useState(".");
  useEffect(() => {
    const t = setInterval(() => setDots(d => d.length >= 3 ? "." : d + "."), 500);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: "#f5f5f5" }}>
      <div style={{ textAlign: "center", maxWidth: "420px" }}>
        <div style={{
          width: "64px", height: "64px", border: "3px solid #e5e5e5",
          borderTop: "3px solid #1a1a1a", borderRadius: "50%", margin: "0 auto 24px",
          animation: "spin 0.8s linear infinite",
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <h2 style={{ fontSize: "20px", fontWeight: "600", color: "#1a1a1a", margin: "0 0 12px" }}>
          Generating your question paper{dots}
        </h2>
        <p style={{ fontSize: "14px", color: "#888", lineHeight: "1.7", margin: 0 }}>
          Your assignment has been queued. The AI worker is crafting structured questions.
          This page will update automatically when complete.
        </p>
        <div style={{ marginTop: "28px", display: "flex", flexDirection: "column", gap: "8px", alignItems: "flex-start", background: "#fff", borderRadius: "12px", padding: "20px 24px", border: "1px solid #efefef", textAlign: "left" }}>
          {["Assignment saved to database", "Job added to BullMQ queue", "AI worker processing...", "Waiting for WebSocket event"].map((step, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", color: i < 3 ? "#555" : "#bbb" }}>
              <span style={{ fontSize: "14px" }}>{i < 2 ? "✅" : i === 2 ? "⏳" : "⌛"}</span>
              {step}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Screen 4: Output ─────────────────────────────────────────────────────────

function OutputScreen({ onBack, onRegenerate }: { onBack: () => void; onRegenerate: () => void; }) {
  const { currentResult, currentAssignment } = useVedaStore();
  const printRef = useRef<HTMLDivElement>(null);

  const handleDownload = () => {
    const content = printRef.current?.innerHTML || "";
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`<html><head><title>Question Paper</title>
      <style>body{font-family:Georgia,serif;margin:40px;line-height:1.6;} .badge{padding:2px 8px;border-radius:4px;font-size:11px;font-weight:600;display:inline-block;margin-right:6px;} .easy{background:#dcfce7;color:#15803d;} .medium{background:#fef9c3;color:#a16207;} .hard{background:#fee2e2;color:#dc2626;}</style>
    </head><body>${content}</body></html>`);
    win.document.close();
    win.print();
  };

  const sections = currentResult?.sections || [];
  const totalMarks = sections.reduce((sum, s) => sum + s.questions.reduce((qs, q) => qs + q.marks, 0), 0);

  if (!currentResult) {
    return (
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: "#f5f5f5" }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: "16px", color: "#888" }}>No result to display.</p>
          <button onClick={onBack} style={{ marginTop: "16px", background: "#1a1a1a", color: "#fff", border: "none", borderRadius: "8px", padding: "10px 20px", cursor: "pointer" }}>← Back</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#f5f5f5" }}>
      <TopBar title="Assignment Output" onBack={onBack} />

      {/* Banner */}
      <div style={{ background: "#1a1a1a", color: "#fff", padding: "16px 28px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <p style={{ margin: "0 0 4px", fontSize: "11px", color: "#888" }}>Your question paper is ready</p>
          <h2 style={{ margin: 0, fontSize: "15px", fontWeight: "600" }}>
            Here is your customised question paper for {currentAssignment?.subject || "Science"} — {currentAssignment?.className || "Grade 8"}
          </h2>
        </div>
        <div style={{ display: "flex", gap: "10px", flexShrink: 0, marginLeft: "24px" }}>
          <button onClick={onRegenerate} style={{ background: "transparent", border: "1px solid #555", color: "#ccc", borderRadius: "7px", padding: "8px 16px", fontSize: "12px", cursor: "pointer" }}>
            ↻ Regenerate
          </button>
          <button onClick={handleDownload} style={{ background: "#fff", color: "#1a1a1a", border: "none", borderRadius: "7px", padding: "8px 16px", fontSize: "12px", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
            ⬇ Download as PDF
          </button>
        </div>
      </div>

      {/* Paper */}
      <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>
        <div ref={printRef} style={{ background: "#fff", borderRadius: "12px", padding: "40px 48px", border: "1px solid #efefef", maxWidth: "800px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "28px", borderBottom: "2px solid #1a1a1a", paddingBottom: "20px" }}>
            <h1 style={{ fontSize: "20px", fontWeight: "700", margin: "0 0 4px" }}>Delhi Public School, Sector-4, Bokaro</h1>
            <p style={{ fontSize: "14px", margin: "0 0 2px" }}>Subject: {currentAssignment?.subject || "Science"}</p>
            <p style={{ fontSize: "14px", margin: 0 }}>Class: {currentAssignment?.className || "Grade 8"}</p>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "16px" }}>
            <span><strong>Time Allowed:</strong> 3 Hours</span>
            <span><strong>Maximum Marks:</strong> {totalMarks}</span>
          </div>

          <p style={{ fontSize: "13px", fontStyle: "italic", color: "#555", marginBottom: "20px" }}>All questions are compulsory unless stated otherwise.</p>

          <div style={{ marginBottom: "24px" }}>
            <p style={{ fontSize: "13px", margin: "0 0 6px" }}>Name: <span style={{ borderBottom: "1px solid #333", display: "inline-block", width: "200px" }}>&nbsp;</span></p>
            <p style={{ fontSize: "13px", margin: "0 0 6px" }}>Roll Number: <span style={{ borderBottom: "1px solid #333", display: "inline-block", width: "160px" }}>&nbsp;</span></p>
            <p style={{ fontSize: "13px", margin: 0 }}>Class: {currentAssignment?.className || "8th"}&nbsp;&nbsp; Section: <span style={{ borderBottom: "1px solid #333", display: "inline-block", width: "80px" }}>&nbsp;</span></p>
          </div>

          {sections.map((section, si) => (
            <div key={si} style={{ marginBottom: "28px" }}>
              <h2 style={{ fontSize: "16px", fontWeight: "700", textAlign: "center", margin: "0 0 6px" }}>{section.title}</h2>
              <h3 style={{ fontSize: "13px", fontWeight: "600", margin: "0 0 4px" }}>{section.questionType}</h3>
              <p style={{ fontSize: "12px", color: "#666", margin: "0 0 14px", fontStyle: "italic" }}>{section.instruction}</p>

              {section.questions.map((q, qi) => (
                <div key={qi} style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: "12px", fontSize: "13px", lineHeight: "1.6" }}>
                  <span style={{ fontWeight: "500", minWidth: "24px", flexShrink: 0 }}>{qi + 1}.</span>
                  <div style={{ flex: 1 }}>
                    <span style={{
                      display: "inline-block", padding: "1px 7px", borderRadius: "4px",
                      fontSize: "10px", fontWeight: "600", marginRight: "8px",
                      background: DIFFICULTY_COLORS[q.difficulty]?.bg || "#f0f0f0",
                      color: DIFFICULTY_COLORS[q.difficulty]?.text || "#555",
                    }}>
                      {DIFFICULTY_COLORS[q.difficulty]?.label || q.difficulty}
                    </span>
                    {q.text}
                  </div>
                  <span style={{ fontSize: "12px", color: "#555", fontWeight: "500", flexShrink: 0 }}>[{q.marks} Marks]</span>
                </div>
              ))}
            </div>
          ))}

          <div style={{ textAlign: "center", borderTop: "1px solid #e5e5e5", paddingTop: "20px", marginTop: "8px" }}>
            <p style={{ fontSize: "13px", color: "#888", fontStyle: "italic", margin: 0 }}>End of Question Paper</p>
          </div>

          {sections.some(s => s.answerKey && s.answerKey.length > 0) && (
            <div style={{ marginTop: "32px", borderTop: "2px solid #1a1a1a", paddingTop: "20px" }}>
              <h2 style={{ fontSize: "16px", fontWeight: "700", margin: "0 0 16px" }}>Answer Key:</h2>
              {sections.map((section, si) =>
                section.answerKey?.map((ans, ai) => (
                  <div key={`${si}-${ai}`} style={{ fontSize: "13px", marginBottom: "10px", display: "flex", gap: "8px" }}>
                    <span style={{ fontWeight: "600", flexShrink: 0 }}>{si > 0 ? sections.slice(0, si).reduce((acc, s) => acc + s.questions.length, 0) + ai + 1 : ai + 1}.</span>
                    <span style={{ color: "#444", lineHeight: "1.6" }}>{ans}</span>
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

// ─── Root App ──────────────────────────────────────────────────────────────────

export default function App() {
  const {
    screen, setScreen,
    assignments, assignmentsLoaded,
    loadAssignments,
    submitAssignment,
    viewAssignment,
    deleteAssignment,
    currentAssignment,
    loadResult,
    error, setError,
    isLoading,
  } = useVedaStore();

  // Mount global WebSocket listener
  useGlobalStatusListener();

  // Load assignments on mount
  useEffect(() => {
    if (!assignmentsLoaded) {
      loadAssignments();
    }
  }, [assignmentsLoaded, loadAssignments]);

  const handleNavigate = (target: "home" | "list" | "create") => {
    if (target === "home") setScreen(assignments.length > 0 ? "list" : "empty");
    if (target === "list") setScreen(assignments.length > 0 ? "list" : "empty");
    if (target === "create") setScreen("create");
  };

  const handleView = async (id: string) => {
    const assignment = assignments.find(a => a._id === id);
    if (assignment) await viewAssignment(assignment);
  };

  const handleRegenerate = async () => {
    if (!currentAssignment) return;
    await submitAssignment({
      title: currentAssignment.title,
      dueDate: currentAssignment.dueDate,
      subject: currentAssignment.subject,
      className: currentAssignment.className,
      questionTypes: currentAssignment.questionTypes,
      instructions: currentAssignment.instructions,
    });
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>
      <Sidebar activeScreen={screen} onNavigate={handleNavigate} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Error banner */}
        {error && (
          <div style={{ background: "#fee2e2", color: "#dc2626", padding: "12px 24px", fontSize: "13px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>⚠ {error}</span>
            <button onClick={() => setError(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#dc2626", fontWeight: "600", fontSize: "16px" }}>✕</button>
          </div>
        )}

        {screen === "empty" && <EmptyDashboard onCreateFirst={() => setScreen("create")} />}

        {screen === "list" && (
          <AssignmentList
            onView={handleView}
            onDelete={deleteAssignment}
            onCreate={() => setScreen("create")}
          />
        )}

        {screen === "create" && (
          <CreateAssignment
            onBack={() => setScreen(assignments.length > 0 ? "list" : "empty")}
            onSubmit={submitAssignment}
          />
        )}

        {screen === "generating" && <GeneratingScreen />}

        {screen === "output" && (
          <OutputScreen
            onBack={() => setScreen("list")}
            onRegenerate={handleRegenerate}
          />
        )}
      </div>
    </div>
  );
}
