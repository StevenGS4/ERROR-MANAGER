import React, { useEffect, useState } from "react";
import ErrorCard from "../components/ErrorCard";
import { fetchErrors } from "../services/errorService";
import {
  Title,
  Input,
  Select,
  Button,
  Toolbar,
  ToolbarSpacer,
  BusyIndicator,
  Text,
  FlexBox,
  FlexBoxDirection,
} from "@ui5/webcomponents-react";

import "@ui5/webcomponents/dist/Option.js";
import "@ui5/webcomponents-icons/dist/search.js";
import "@ui5/webcomponents-icons/dist/refresh.js";
import "@ui5/webcomponents-icons/dist/add.js";

const ErrorLog = () => {
  const [errors, setErrors] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [lastUpdate, setLastUpdate] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadErrors = async () => {
    try {
      setLoading(true);
      const { ok, rows } = await fetchErrors();
      if (ok && Array.isArray(rows)) {
        setErrors(rows);
        setLastUpdate(new Date().toLocaleTimeString());
      }
    } catch (err) {
      console.error("❌ Error al cargar errores:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadErrors();
    const interval = setInterval(loadErrors, 10000);
    return () => clearInterval(interval);
  }, []);

  // 🔥 BÚSQUEDA UNIVERSAL — busca en TODO el objeto del error
  const filteredErrors = errors
    .filter((e) => {
      if (!search.trim()) return true;
      const text = search.toLowerCase();

      // Convertimos TODO el error a texto plano
      const full = JSON.stringify(e)
        .toLowerCase()
        .replace(/[\n\r]/g, " ");

      return full.includes(text);
    })
    .filter((e) => {
      if (filter === "ALL") return true;
      if (filter === "UNRESOLVED")
        return e.STATUS === "NEW" || e.STATUS === "IN_PROGRESS";
      if (filter === "RESOLVED") return e.STATUS === "RESOLVED";
      if (filter === "IGNORED") return e.STATUS === "IGNORED";
      return true;
    });

  // 🔥 1) SEPARAMOS NEW (arriba siempre)
  const newErrors = filteredErrors
    .filter((e) => e.STATUS === "NEW" || e.STATUS === "IN_PROGRESS")
    .sort((a, b) => new Date(a.ERRORDATETIME) - new Date(b.ERRORDATETIME));

  const ignoredErrors = filteredErrors.filter((e) => e.STATUS === "IGNORED");
  const resolvedErrors = filteredErrors.filter((e) => e.STATUS === "RESOLVED");

  // 🔥 2) AGRUPAR POR MES para ignorados y resueltos
  const groupByMonth = (list) =>
    list.reduce((acc, error) => {
      const date = new Date(error.ERRORDATETIME);
      const monthKey = date.toLocaleString("es-MX", {
        month: "long",
        year: "numeric",
      });

      if (!acc[monthKey]) acc[monthKey] = [];
      acc[monthKey].push(error);

      acc[monthKey].sort(
        (a, b) => new Date(a.ERRORDATETIME) - new Date(b.ERRORDATETIME)
      );

      return acc;
    }, {});

  const ignoredByMonth = groupByMonth(ignoredErrors);
  const resolvedByMonth = groupByMonth(resolvedErrors);

  return (
    <div
      style={{
        padding: "2rem",
        background: "#f9fafb",
        minHeight: "100vh",
      }}
    >
      <Title level="H2">Error Log</Title>

      <Toolbar style={{ marginTop: "1rem", marginBottom: "1rem" }}>
        <Input
          placeholder="Buscar..."
          value={search}
          onInput={(e) => setSearch(e.target.value)}
          icon="search"
          showClearIcon
          style={{ width: "300px" }}
        />

        <Select
          onChange={(e) =>
            setFilter(e.detail.selectedOption.value.toUpperCase())
          }
          style={{ width: "180px", marginLeft: "1rem" }}
        >
          <ui5-option value="ALL" selected>Todos</ui5-option>
          <ui5-option value="RESOLVED">Resueltos</ui5-option>
          <ui5-option value="UNRESOLVED">Pendientes</ui5-option>
          <ui5-option value="IGNORED">Ignorados</ui5-option>
        </Select>

        <ToolbarSpacer />

        <Button
          icon="refresh"
          design="Transparent"
          onClick={loadErrors}
          disabled={loading}
        >
          {loading ? "Cargando..." : "Refrescar"}
        </Button>
      </Toolbar>

      {/* LOADING */}
      {loading && (
        <FlexBox
          direction={FlexBoxDirection.Column}
          style={{ alignItems: "center", margin: "2rem 0" }}
        >
          <BusyIndicator active size="Large" />
          <Text>Cargando errores...</Text>
        </FlexBox>
      )}

      {/* NEW ALWAYS FIRST */}
      {newErrors.length > 0 && (
        <div style={{ marginBottom: "2rem" }}>
          <Title level="H4">🆕 PENDIENTES</Title>
          {newErrors.map((err) => (
            <ErrorCard key={err._id} error={err} />
          ))}
        </div>
      )}

      {/* IGNORED POR MES */}
      {Object.entries(ignoredByMonth).map(([month, list]) => (
        <div key={"ignored-" + month} style={{ marginBottom: "2rem" }}>
          <Title level="H4">📅 {month.toUpperCase()} — IGNORADOS</Title>
          {list.map((err) => (
            <ErrorCard key={err._id} error={err} />
          ))}
        </div>
      ))}

      {/* RESOLVED POR MES */}
      {Object.entries(resolvedByMonth).map(([month, list]) => (
        <div key={"resolved-" + month} style={{ marginBottom: "2rem" }}>
          <Title level="H4">📅 {month.toUpperCase()} — RESUELTOS</Title>
          {list.map((err) => (
            <ErrorCard key={err._id} error={err} />
          ))}
        </div>
      ))}

      <Text style={{ marginTop: "1.5rem", color: "#555" }}>
        Última actualización: {lastUpdate || "Nunca"}
      </Text>
    </div>
  );
};

export default ErrorLog;
