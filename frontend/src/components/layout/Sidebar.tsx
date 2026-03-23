"use client";

import React from "react";
import type { AppScreen } from "../../types";

interface NavItemProps {
  icon: string;
  label: string;
  active?: boolean;
  badge?: string | number;
  onClick: () => void;
}

function NavItem({ icon, label, active, badge, onClick }: NavItemProps) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "9px 12px",
        borderRadius: "8px",
        width: "100%",
        border: "none",
        background: active ? "#1a1a1a" : "transparent",
        color: active ? "#fff" : "#555",
        cursor: "pointer",
        fontSize: "14px",
        fontWeight: active ? 500 : 400,
        transition: "background 0.15s",
        textAlign: "left",
      }}
    >
      <span style={{ fontSize: "15px", opacity: active ? 1 : 0.7 }}>{icon}</span>
      <span style={{ flex: 1 }}>{label}</span>
      {badge !== undefined && (
        <span
          style={{
            background: "#e85d26",
            color: "#fff",
            borderRadius: "10px",
            padding: "1px 7px",
            fontSize: "11px",
            fontWeight: 600,
          }}
        >
          {badge}
        </span>
      )}
    </button>
  );
}

interface SidebarProps {
  activeScreen: AppScreen;
  onNavigate: (screen: AppScreen) => void;
  assignmentCount: number;
}

export default function Sidebar({
  activeScreen,
  onNavigate,
  assignmentCount,
}: SidebarProps) {
  return (
    <aside
      style={{
        width: "220px",
        minHeight: "100vh",
        background: "#fff",
        borderRight: "1px solid #e5e5e5",
        display: "flex",
        flexDirection: "column",
        padding: "20px 12px",
        flexShrink: 0,
        position: "sticky",
        top: 0,
        height: "100vh",
        overflowY: "auto",
      }}
    >
      {/* Logo */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "24px",
          padding: "0 4px",
        }}
      >
        <div
          style={{
            width: "30px",
            height: "30px",
            background: "#e85d26",
            borderRadius: "7px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "16px",
          }}
        >
          🎓
        </div>
        <span
          style={{
            fontWeight: 700,
            fontSize: "17px",
            color: "#1a1a1a",
            fontFamily: "Georgia, serif",
          }}
        >
          VedaAI
        </span>
      </div>

      {/* CTA Button */}
      <button
        onClick={() => onNavigate("create")}
        style={{
          background: "#1a1a1a",
          color: "#fff",
          border: "none",
          borderRadius: "8px",
          padding: "10px 14px",
          fontSize: "13px",
          fontWeight: 600,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          marginBottom: "20px",
          width: "100%",
        }}
      >
        <span>+</span> Create Assignment
      </button>

      {/* Nav */}
      <nav style={{ display: "flex", flexDirection: "column", gap: "2px", flex: 1 }}>
        <NavItem
          icon="⊞"
          label="Home"
          active={activeScreen === "empty"}
          onClick={() => onNavigate("empty")}
        />
        <NavItem icon="👥" label="My Groups" onClick={() => {}} />
        <NavItem
          icon="📄"
          label="Assignments"
          active={activeScreen === "list" || activeScreen === "generating" || activeScreen === "output"}
          badge={assignmentCount > 0 ? assignmentCount : undefined}
          onClick={() => onNavigate("list")}
        />
        <NavItem icon="✨" label="AI Teacher's Toolkit" onClick={() => {}} />
        <NavItem icon="📚" label="My Library" onClick={() => {}} />
      </nav>

      {/* Footer */}
      <div
        style={{
          borderTop: "1px solid #f0f0f0",
          paddingTop: "16px",
          marginTop: "16px",
        }}
      >
        <button
          style={{
            background: "none",
            border: "none",
            color: "#888",
            fontSize: "13px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "6px 4px",
          }}
        >
          ⚙ Settings
        </button>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginTop: "12px",
            padding: "10px 8px",
            background: "#f9f9f9",
            borderRadius: "10px",
          }}
        >
          <div
            style={{
              width: "34px",
              height: "34px",
              borderRadius: "50%",
              background: "#dbeafe",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "14px",
              flexShrink: 0,
            }}
          >
            🏫
          </div>
          <div>
            <div style={{ fontSize: "12px", fontWeight: 600, color: "#1a1a1a" }}>
              Delhi Public School
            </div>
            <div style={{ fontSize: "11px", color: "#888" }}>Bokaro Steel City</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
