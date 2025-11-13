import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import {
  ThemeProvider,
  FlexBox,
  FlexBoxDirection
} from "@ui5/webcomponents-react";
import Navbar from "./components/Navbar.jsx";
import Sidebar from "./components/Sidebar.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import ErrorLog from "./pages/ErrorLog.jsx";
import ErrorDetail from "./pages/ErrorDetail.jsx";
import "./styles/main.css";

// Importa los assets UI5 globales UNA sola vez
import "@ui5/webcomponents/dist/Assets.js";
import "@ui5/webcomponents-fiori/dist/Assets.js";
import "@ui5/webcomponents-icons/dist/AllIcons.js";

function App() {
  return (
    <ThemeProvider>
      <Router>
        {/* 🔹 Layout general tipo SAP Fiori */}
        <FlexBox direction={FlexBoxDirection.Row} style={{ height: "100vh" }}>
          {/* 🔹 Menú lateral (Sidebar) */}
          <Sidebar />

          {/* 🔹 Contenedor derecho: ShellBar + contenido dinámico */}
          <FlexBox direction={FlexBoxDirection.Column} style={{ flex: 1 }}>
            <Navbar />
            <div className="content">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/errors" element={<ErrorLog />} />
                <Route path="/errors/:id" element={<ErrorDetail />} />
              </Routes>
            </div>
          </FlexBox>
        </FlexBox>
      </Router>
    </ThemeProvider>
  );
}

export default App;
