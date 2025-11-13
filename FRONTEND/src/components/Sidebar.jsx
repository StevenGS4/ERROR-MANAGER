import React from "react";
import { NavLink } from "react-router-dom";
import { Title } from "@ui5/webcomponents-react";
import "@ui5/webcomponents-icons/dist/AllIcons.js";

const Sidebar = () => (
  <aside
    style={{
      background: "#fff",
      width: "230px",
      borderRight: "1px solid #ddd",
      padding: "1rem",
      height: "100vh",
    }}
  >
    <Title level="H5" style={{ color: "#007bff", marginBottom: "1rem" }}>
      ☰ Menu
    </Title>

    <nav style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      <NavLink
        to="/"
        end
        style={({ isActive }) => ({
          padding: "0.7rem 1rem",
          borderRadius: "8px",
          textDecoration: "none",
          color: isActive ? "#007bff" : "#333",
          backgroundColor: isActive ? "#eaf2ff" : "transparent",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
        })}
      >
        <ui5-icon name="home"></ui5-icon>
        Dashboard
      </NavLink>

      <NavLink
        to="/errors"
        style={({ isActive }) => ({
          padding: "0.7rem 1rem",
          borderRadius: "8px",
          textDecoration: "none",
          color: isActive ? "#007bff" : "#333",
          backgroundColor: isActive ? "#eaf2ff" : "transparent",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
        })}
      >
        <ui5-icon name="alert"></ui5-icon>
        Error Log
      </NavLink>
    </nav>
  </aside>
);

export default Sidebar;
