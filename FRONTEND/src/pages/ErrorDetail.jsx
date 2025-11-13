import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Tabs from "../components/Tabs";

import {
  fetchErrorById,
  updateError
} from "../services/errorService";

import {
  Card,
  CardHeader,
  FlexBox,
  FlexBoxDirection,
  Title,
  Text,
  Button,
  Avatar,
  ObjectStatus,
  BusyIndicator,
  TextArea,
} from "@ui5/webcomponents-react";

const ErrorDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 🔹 Cargar error desde backend
  const loadError = async () => {
    try {
      setLoading(true);

      const { ok, rows, message } = await fetchErrorById(id);
      const data = Array.isArray(rows) ? rows : [rows];

      if (!ok || !data.length) throw new Error(message || "No encontrado");

      setError(data[0]);

    } catch (err) {
      console.error("❌ Error al cargar detalle:", err);
      alert("Error al cargar el detalle del error.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadError();
  }, [id]);

  // 🔹 Actualizar estado (resolver o ignorar)
  const handleStatusChange = async (status) => {
    if (!window.confirm(`¿Seguro de marcar este error como ${status}?`)) return;

    try {
      setSaving(true);

      const payload = {
        ...error,
        STATUS: status
      };

      const { ok, message } = await updateError(payload);

      if (!ok) {
        alert("⚠️ No se pudo actualizar: " + message);
        return;
      }

      alert(`✅ Error marcado como ${status}`);
      navigate("/errors");

    } catch (err) {
      console.error("❌ Error al actualizar:", err);
      alert("Error interno al actualizar.");
    } finally {
      setSaving(false);
    }
  };

  // 🔹 Loading inicial
  if (loading) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <BusyIndicator active size="Large" />
        <p>Cargando detalle...</p>
      </div>
    );
  }

  if (!error) {
    return <p style={{ padding: "2rem" }}>No se encontró información del error.</p>;
  }

  // 🔹 Fecha
  const fecha = error.ERRORDATETIME
    ? new Date(error.ERRORDATETIME).toLocaleString("es-MX", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "Fecha desconocida";

  // 🔹 Tabs
  const tabs = [
    {
      label: "Descripción del Error",
      content: (
        <div>
          <p><b>Mensaje:</b> {error.ERRORMESSAGE}</p>
          <p><b>Código:</b> {error.ERRORCODE}</p>
          <p><b>Origen:</b> {error.ERRORSOURCE}</p>
          <p><b>Severidad:</b> {error.SEVERITY}</p>
          <p><b>Módulo:</b> {error.MODULE}</p>
          <p><b>Aplicación:</b> {error.APPLICATION}</p>
          <p><b>Usuario:</b> {error.USER}</p>
          <p><b>Fecha:</b> {fecha}</p>
        </div>
      ),
    },
    {
      label: "Contexto Técnico",
      content: (
        <>
          {/* 🔥 STACKTRACE COMPLETO COMO CONSOLA (AGREGADO) */}
          {error.CONTEXT?.errorMessageRaw && (
            <pre
              style={{
                background: "#0d1117",
                color: "#f0f6fc",
                padding: "1rem",
                borderRadius: "8px",
                fontFamily: "Consolas, Menlo, monospace",
                whiteSpace: "pre-wrap",
                marginBottom: "1rem",
                fontSize: "14px",
                lineHeight: "1.4",
                overflowX: "auto"
              }}
            >
              {error.CONTEXT.errorMessageRaw}
            </pre>
          )}

          {/* 🔹 Tu JSON.stringify original (NO TOCADO) */}
          <pre
            style={{
              background: "#111827",
              color: "#f9fafb",
              padding: "1rem",
              borderRadius: "8px"
            }}
          >
            {JSON.stringify(error.CONTEXT, null, 2) || "Sin información de contexto"}
          </pre>
        </>
      ),
    },
    {
      label: "Asistencia",
      content: (
        <Card header={<CardHeader titleText="Asistencia generada" />}>
          <Text style={{ fontStyle: "italic" }}>
            {error.AI_RESPONSE || "No se generó respuesta de parte de un desarrollador"}
          </Text>

          <FlexBox
            direction={FlexBoxDirection.Column}
            style={{ marginTop: "1rem", gap: "0.5rem" }}
          >
            <TextArea placeholder="Describe cómo solucionaste el error..." rows="3" />
            <Button design="Emphasized">💾 Guardar comentario</Button>
          </FlexBox>
        </Card>
      ),
    }
  ];

  // 🔹 Estado visual UI5
  const statusState =
    error.STATUS === "RESOLVED"
      ? "Success"
      : error.STATUS === "IGNORED"
      ? "Warning"
      : "Error";

  return (
    <div style={{ padding: "2rem" }}>
      <Title level="H2">🧩 Detalle del Error — {error.ERRORCODE}</Title>

      {/* Header */}
      <Card
        header={
          <CardHeader
            titleText={error.ERRORMESSAGE}
            subtitleText={`${error.USER || "Sin usuario"} — ${fecha}`}
            avatar={
              <img
                src={`https://i.pravatar.cc/80?u=${error.USER || error._id || "default-user"}`}
                alt={error.USER || "Usuario"}
                className="error-avatar"
              />
            }
          >
            {/* ⭐ Status ajustado correctamente con slot */}
            <ObjectStatus slot="status" state={statusState} showDefaultIcon>
              {error.STATUS}
            </ObjectStatus>
          </CardHeader>
        }
      />

      {/* Tabs */}
      <div style={{ marginTop: "1.5rem" }}>
        <Tabs tabs={tabs} />
      </div>

      {/* Botones */}
      <FlexBox
        direction={FlexBoxDirection.Row}
        style={{
          justifyContent: "flex-end",
          gap: "1rem",
          marginTop: "1.5rem",
        }}
      >
        {/* Ignorar */}
        <Button
          design="Negative"
          disabled={saving || error.STATUS === "IGNORED"}
          onClick={() => handleStatusChange("IGNORED")}
        >
          🚫 Ignorar
        </Button>

        {/* Resolver */}
        <Button
          design="Emphasized"
          disabled={saving || error.STATUS === "RESOLVED"}
          onClick={() => handleStatusChange("RESOLVED")}
        >
          ✅ Marcar Resuelto
        </Button>
      </FlexBox>
    </div>
  );
};

export default ErrorDetail;
