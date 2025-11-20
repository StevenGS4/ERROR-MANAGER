import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Tabs from "../components/Tabs";
import axios from "axios";

import {
  fetchErrorById,
  updateError,
  fetchAISolution
} from "../services/errorService";


import {
  Card,
  CardHeader,
  FlexBox,
  FlexBoxDirection,
  Title,
  Text,
  Button,
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
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [showAISuggestion, setShowAISuggestion] = useState(false);


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
        STATUS: status,
        RESOLVEDBY: status === "RESOLVED" ? "Admin" : error.RESOLVEDBY
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

  const createdBy = error.CREATED_BY_APP || "Sistema";

  const ctxItem = Array.isArray(error.CONTEXT) ? error.CONTEXT[0] : null;


  const loggedUser = JSON.parse(localStorage.getItem("loggedUser") || "{}");

  async function assignToUser(userId) {
    try {
      const res = await axios.post(
        "http://localhost:3334/api/error/assign",   // ✔ endpoint correcto
        {
          errorId: error.ERRORID,        // ✔ usar ERRORID, no _id
          assignedUser: userId,
          assignedBy: loggedUser.USERID  // ✔ esto sí está bien
        }
      );

      alert("Usuario asignado correctamente.");
      loadError(); // recargar datos actualizados

    } catch (err) {
      console.error("❌ Error asignando usuario:", err);
      alert("Error asignando usuario.");
    }
  }


  // ============================================================
  // 🔹 TABS
  // ============================================================
  const tabs = [

    // ------------------------------------------------------------
    // 1) DESCRIPCIÓN
    // ------------------------------------------------------------
    {
      label: "Descripción del Error",
      content: (
        <div style={{ maxWidth: "100%", overflowX: "hidden" }}>
          <p><b>Mensaje:</b> {error.ERRORMESSAGE}</p>
          <p><b>Código:</b> {error.ERRORCODE}</p>
          <p><b>Origen:</b> {error.ERRORSOURCE}</p>
          <p><b>Severidad:</b> {error.SEVERITY}</p>
          <p><b>Módulo:</b> {error.MODULE}</p>
          <p><b>Aplicación:</b> {error.APPLICATION}</p>
          <p><b>Generado por:</b> {createdBy}</p>
          <p><b>Fecha:</b> {fecha}</p>
        </div>
      ),
    },

    // ------------------------------------------------------------
    // 2) USUARIOS
    // ------------------------------------------------------------
    {
      label: "Usuarios",
      content: (
        <div style={{ maxWidth: "100%", overflowX: "hidden" }}>

          <h4>👥 Usuarios que pueden ver este error:</h4>

          <div className="user-cards">
            {error.CANSEEUSERS?.length ? (
              error.CANSEEUSERS.map((u) => (
                <div key={u} className="user-card">
                  <p><b>{u}</b></p>

                  {/* ✔ Los roles vienen como arreglo, no como ROLEID directo */}
                  {loggedUser.ROLES?.some(r => r.ROLEID === "jefe.productos") && (
                    <button
                      className="assign-btn"
                      onClick={() => assignToUser(u)}
                    >
                      Asignar
                    </button>
                  )}
                </div>
              ))
            ) : (
              <i>Sin usuarios asignados</i>
            )}
          </div>

          <h4 style={{ marginTop: "1rem" }}>👤 Usuario asignado:</h4>
          <p>{error.ASIGNEDUSERS?.[0] || "Ninguno"}</p>

          <h4 style={{ marginTop: "1rem" }}>✔ Resuelto por:</h4>
          <p>{error.RESOLVEDBY || "Aún no resuelto"}</p>

        </div>
      ),
    }

    ,

    // ------------------------------------------------------------
    // 3) CONTEXTO TÉCNICO (todas las correcciones aquí)
    // ------------------------------------------------------------
    {
      label: "Contexto Técnico",
      content: (
        <div style={{ maxWidth: "100%", overflowX: "hidden" }}>

          {/* STACKTRACE */}
          {ctxItem?.stack && (
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
                overflowX: "auto",
                maxWidth: "100%"
              }}
            >
              {ctxItem.stack}
            </pre>
          )}

          {/* JSON COMPLETO */}
          <pre
            style={{
              background: "#111827",
              color: "#f9fafb",
              padding: "1rem",
              borderRadius: "8px",
              whiteSpace: "pre-wrap",
              overflowX: "auto",
              maxWidth: "100%"
            }}
          >
            {JSON.stringify(error.CONTEXT, null, 2)}
          </pre>

          {/* HISTORIAL SESIÓN */}
          <h4 style={{ marginTop: "1.5rem", marginBottom: "0.5rem" }}>📝 Historial de Sesión</h4>

          <pre
            style={{
              background: "#0a0f18",
              color: "#9ee4ff",
              padding: "1rem",
              borderRadius: "8px",
              fontFamily: "Consolas, monospace",
              whiteSpace: "pre-wrap",
              fontSize: "13px",
              lineHeight: "1.5",
              maxHeight: "300px",
              overflowY: "auto",
              overflowX: "auto",
              maxWidth: "100%",
              border: "1px solid #1f2937"
            }}
          >
            {error.USER_SESSION_LOG?.length
              ? error.USER_SESSION_LOG.join("\n")
              : "No hay historial de sesión registrado."}
          </pre>
        </div>
      ),
    },

    // ------------------------------------------------------------
    // 4) FORO DE SOLUCIONES
    // ------------------------------------------------------------
    {
      label: "Foro de Soluciones",
      content: (
        <Card header={<CardHeader titleText="Foro de colaboración" />}>

          {/* LISTA DE COMENTARIOS */}
          <div
            style={{
              maxHeight: "300px",
              overflowY: "auto",
              maxWidth: "100%",
              overflowX: "hidden",
            }}
          >
            {error.COMMENTS?.length ? (
              error.COMMENTS.map((c, i) => (
                <div
                  key={i}
                  style={{
                    marginBottom: "1rem",
                    padding: "0.8rem",
                    borderRadius: "10px",
                    background: "#f3f4f6",
                    maxWidth: "100%",
                  }}
                >
                  {/* CABECERA DEL COMENTARIO */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.8rem",
                      maxWidth: "100%",
                    }}
                  >
                    <img
                      src={`https://i.pravatar.cc/50?u=${c.user}`}
                      style={{ borderRadius: "50%" }}
                    />
                    <div style={{ maxWidth: "100%", overflowX: "hidden" }}>
                      <strong>{c.user}</strong>
                      <p style={{ fontSize: "0.75rem", color: "#555", margin: 0 }}>
                        {new Date(c.date).toLocaleString("es-MX")}
                      </p>
                    </div>
                  </div>

                  {/* MENSAJE — YA NO SE DESBORDA */}
                  <p
                    style={{
                      marginTop: "0.6rem",
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                      overflowWrap: "anywhere",
                      maxWidth: "100%",
                    }}
                  >
                    {c.message}
                  </p>
                </div>
              ))
            ) : (
              <Text>📝 Aún no hay comentarios en este error.</Text>
            )}
          </div>

          {/* ENVIAR COMENTARIO */}
          <div style={{ marginTop: "1rem", maxWidth: "100%" }}>
            <TextArea
              rows={3}
              placeholder="Escribe un comentario..."
              id="commentBox"
              style={{ maxWidth: "100%" }}
            />

            <Button
              design="Emphasized"
              style={{ marginTop: "0.5rem" }}
              onClick={async () => {
                const box = document.getElementById("commentBox");
                const text = box.value.trim();
                if (!text) return alert("Escribe un mensaje antes de enviar");

                const loggedUser = JSON.parse(localStorage.getItem("loggedUser"));
                const userName =
                  loggedUser?.USERID ||
                  loggedUser?.ALIAS ||
                  loggedUser?.USERNAME ||
                  "Anon";

                const newComment = {
                  user: userName,
                  message: text,
                  date: new Date().toISOString(),
                };

                const updated = {
                  ...error,
                  COMMENTS: [...(error.COMMENTS || []), newComment],
                };

                const { ok } = await updateError(updated);
                if (!ok) return alert("⚠ No se pudo guardar el comentario");

                box.value = "";
                setError(updated);
              }}
            >
              Enviar
            </Button>
          </div>
        </Card>
      ),
    },


    // ------------------------------------------------------------
    // 5) SOLUCIÓN FINAL
    // ------------------------------------------------------------
    {
      label: "Solución Final",
      content: (() => {
        const loggedUser = JSON.parse(localStorage.getItem("loggedUser"));
        const solucionGuardada = Boolean(error.FINALSOLUTION);
        const solucion = error.FINALSOLUTION;

        return (
          <Card
            header={
              <CardHeader
                titleText="Solución final del error"
                action={
                  <Button
                    design="Positive"
                    icon="lightbulb"
                    tooltip="Generar sugerencia IA"
                    style={{
                      fontSize: "0.75rem",
                      padding: "0.35rem 0.75rem",
                      borderRadius: "6px",
                      marginRight: "0.5rem"
                    }}
                    onClick={async () => {
                      setAiLoading(true);
                      const ai = await fetchAISolution(error._id);

                      if (!ai.ok) {
                        alert("❌ No se pudo obtener la sugerencia IA");
                        setAiLoading(false);
                        return;
                      }

                      setAiSuggestion(ai.ai);
                      setShowAISuggestion(true);
                      setAiLoading(false);
                    }}
                  >
                    IA
                  </Button>
                }
              />
            }
          >

            {/* Loader IA */}
            {aiLoading && (
              <p style={{ margin: "1rem 0" }}>
                <BusyIndicator active /> Generando sugerencia IA...
              </p>
            )}

            {/* PANEL DE SUGERENCIA IA */}
            {showAISuggestion && aiSuggestion && (
              <div
                style={{
                  marginTop: "1rem",
                  background: "#e0f2fe",
                  padding: "1rem",
                  borderRadius: "10px",
                  border: "1px solid #38bdf8",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  overflowWrap: "anywhere",
                }}
              >
                <h4>🤖 Sugerencia generada por IA</h4>
                <p>{aiSuggestion}</p>

                <Button
                  design="Negative"
                  style={{ marginTop: "1rem" }}
                  onClick={() => setShowAISuggestion(false)}
                >
                  Ocultar sugerencia IA
                </Button>

                <Button
                  design="Emphasized"
                  style={{ marginTop: "1rem", marginLeft: "1rem" }}
                  onClick={async () => {
                    const updated = {
                      ...error,
                      FINALSOLUTION: aiSuggestion,
                      AI_RESPONSE: aiSuggestion,
                      AI_REQUESTED: true,
                      RESOLVEDBY: loggedUser?.USERID || "Admin",
                      RESOLVED_DATE: new Date().toISOString(),
                    };

                    const { ok } = await updateError(updated);
                    if (!ok) return alert("No se pudo guardar la sugerencia");

                    alert("Sugerencia IA guardada como solución final");
                    setError(updated);
                  }}
                >
                  Guardar como solución final
                </Button>
              </div>
            )}

            {/* =======================
            MODO — VER SOLUCIÓN
        ======================= */}
            {solucionGuardada && !error.FINAL_SOLUTION_EDIT_MODE ? (
              <div style={{ padding: "1rem", maxWidth: "100%" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                  }}
                >
                  <img
                    src={`https://i.pravatar.cc/60?u=${error.RESOLVEDBY}`}
                    style={{ borderRadius: "50%", width: "60px", height: "60px" }}
                  />
                  <div>
                    <strong>{error.RESOLVEDBY}</strong>
                    <p style={{ fontSize: "0.75rem", margin: 0 }}>
                      {error.RESOLVED_DATE
                        ? new Date(error.RESOLVED_DATE).toLocaleString("es-MX")
                        : "Fecha no registrada"}
                    </p>
                  </div>
                </div>

                <div
                  style={{
                    marginTop: "1rem",
                    background: "#f3f4f6",
                    padding: "1rem",
                    borderRadius: "10px",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    overflowWrap: "anywhere",
                  }}
                >
                  {solucion}
                </div>

                <Button
                  design="Transparent"
                  icon="edit"
                  style={{ marginTop: "1rem" }}
                  onClick={() => {
                    setError({ ...error, FINAL_SOLUTION_EDIT_MODE: true });
                  }}
                >
                  Editar solución
                </Button>
              </div>
            ) : null}

            {/* =======================
            MODO — EDITAR / AGREGAR
        ======================= */}
            {(!solucionGuardada || error.FINAL_SOLUTION_EDIT_MODE) && (
              <div style={{ padding: "1rem", maxWidth: "100%" }}>
                <Text>Aquí puedes documentar la solución definitiva.</Text>

                <TextArea
                  rows={6}
                  placeholder="Describe la solución completa..."
                  defaultValue={error.FINALSOLUTION || ""}
                  id="solutionBox"
                  style={{
                    marginTop: "1rem",
                    maxWidth: "100%",
                    wordBreak: "break-word",
                    overflowWrap: "anywhere",
                  }}
                />

                <Button
                  design="Emphasized"
                  style={{ marginTop: "0.8rem" }}
                  onClick={async () => {
                    const sol = document.getElementById("solutionBox").value.trim();
                    if (!sol) return alert("La solución no puede estar vacía");

                    const updated = {
                      ...error,
                      FINALSOLUTION: sol,
                      RESOLVEDBY: loggedUser?.USERID || "Admin",
                      RESOLVED_DATE: new Date().toISOString(),
                      FINAL_SOLUTION_EDIT_MODE: undefined,
                    };

                    const { ok } = await updateError(updated);
                    if (!ok) return alert("⚠ No se pudo guardar la solución");

                    alert("✅ Solución final guardada");
                    setError(updated);
                  }}
                >
                  Guardar solución
                </Button>
              </div>
            )}
          </Card>
        );
      })()
    }



  ];

  // ============================================================
  // ESTADO VISUAL
  // ============================================================
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
            subtitleText={`${createdBy} — ${fecha}`}
            avatar={
              <img
                src={`https://i.pravatar.cc/80?u=${createdBy}`}
                alt={createdBy}
                className="error-avatar"
              />
            }
          >
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
        <Button
          design="Negative"
          disabled={saving || error.STATUS === "IGNORED"}
          onClick={() => handleStatusChange("IGNORED")}
        >
          🚫 Ignorar
        </Button>

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
