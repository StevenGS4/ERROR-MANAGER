import React, { useEffect, useState } from "react";
import ErrorCard from "../components/ErrorCard";
import { fetchErrors, createError } from "../services/errorService";
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

// 🔹 Importaciones necesarias de UI5 base
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

  // 🔹 Cargar errores desde el backend CAP
  const loadErrors = async () => {
    try {
      setLoading(true);
      const { ok, rows } = await fetchErrors();
      if (ok && Array.isArray(rows)) {
        setErrors(rows);
        setLastUpdate(new Date().toLocaleTimeString());
      } else {
        console.warn("⚠️ No se pudieron cargar los errores");
      }
    } catch (err) {
      console.error("❌ Error al cargar errores:", err);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Cargar al iniciar y refrescar cada 10 segundos
  useEffect(() => {
    loadErrors();
    const interval = setInterval(loadErrors, 10000);
    return () => clearInterval(interval);
  }, []);

  // 🔹 Crear error simulado
  const handleCreateError = async () => {
    const nuevo = {
      ERRORMESSAGE: "Error simulado desde frontend",
      ERRORCODE: "ERR-FRONT",
      ERRORSOURCE: "ReactUI",
      SEVERITY: "ERROR",
      MODULE: "Interfaz",
      APPLICATION: "ErrorManager",
      USER: "Admin",
    };

    const { ok, rows, message } = await createError(nuevo);
    if (ok) {
      alert("✅ Error creado exitosamente");
      setErrors((prev) => [rows[0], ...prev]);
    } else {
      alert(`❌ Falló al crear el error: ${message}`);
    }
  };

  // 🔹 Filtro dinámico
  const filteredErrors = errors
    .filter((e) =>
      e.ERRORMESSAGE?.toLowerCase().includes(search.toLowerCase())
    )
    .filter((e) => {
      if (filter === "ALL") return true;
      if (filter === "UNRESOLVED")
        return e.STATUS === "NEW" || e.STATUS === "IN_PROGRESS";
      if (filter === "RESOLVED") return e.STATUS === "RESOLVED";
      if (filter === "IGNORED") return e.STATUS === "IGNORED";
      return true;
    });

  return (
    <div
      style={{
        padding: "2rem",
        background: "#f9fafb",
        minHeight: "100vh",
      }}
    >
      {/* 🔹 Título principal */}
      <Title level="H2">Error Log</Title>

      {/* 🔹 Barra superior con filtros y acciones */}
      <Toolbar style={{ marginTop: "1rem", marginBottom: "1rem" }}>
        {/* Campo de búsqueda */}
        <Input
          placeholder="Buscar por mensaje, código o fuente..."
          value={search}
          onInput={(e) => setSearch(e.target.value)}
          icon="search"
          showClearIcon
          style={{ width: "300px" }}
        />

        {/* Selector de filtros */}
        <Select
          onChange={(e) =>
            setFilter(e.detail.selectedOption.value.toUpperCase())
          }
          style={{ width: "180px", marginLeft: "1rem" }}
        >
          <ui5-option value="ALL" selected>
            Todos
          </ui5-option>
          <ui5-option value="RESOLVED">Resueltos</ui5-option>
          <ui5-option value="UNRESOLVED">Pendientes</ui5-option>
          <ui5-option value="IGNORED">Ignorados</ui5-option>
        </Select>

        <ToolbarSpacer />

        {/* Botón de refresco */}
        <Button
          icon="refresh"
          design="Transparent"
          onClick={loadErrors}
          disabled={loading}
        >
          {loading ? "Cargando..." : "Refrescar"}
        </Button>

      </Toolbar>

      {/* 🔹 Estado de carga */}
      {loading && (
        <FlexBox
          direction={FlexBoxDirection.Column}
          style={{
            alignItems: "center",
            marginTop: "2rem",
            marginBottom: "2rem",
          }}
        >
          <BusyIndicator active size="Large" />
          <Text>Cargando errores...</Text>
        </FlexBox>
      )}

      {/* 🔹 Lista de errores */}
      <div style={{ marginTop: "1rem" }}>
        {!loading && filteredErrors.length === 0 ? (
          <Text>No se encontraron errores.</Text>
        ) : (
          filteredErrors.map((err) => (
            <ErrorCard key={err.ERRORID || err._id} error={err} />
          ))
        )}
      </div>

      {/* 🔹 Última actualización */}
      <Text style={{ display: "block", marginTop: "1.5rem", color: "#555" }}>
        Última actualización: {lastUpdate || "Nunca"}
      </Text>
    </div>
  );
};

export default ErrorLog;
