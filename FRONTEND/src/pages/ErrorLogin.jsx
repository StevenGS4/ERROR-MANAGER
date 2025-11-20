import React, { useEffect, useState } from "react";
import {
  Button,
  BusyIndicator,
  Input,
  Text
} from "@ui5/webcomponents-react";

import axios from "axios";
import "../styles/errorLogin.css";

export default function ErrorLogin() {
  const [user, setUser] = useState(null);
  const [manualId, setManualId] = useState("");
  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("loggedUser");

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.USERID) setUser(parsed);
      } catch {}
      setLoading(false);
      return;
    }

    setLoading(false);
  }, []);

  // ============================================================
  // FUNCION DE LOGIN REAL
  // ============================================================
  const validarUsuario = async () => {
    if (!manualId.trim()) {
      setErrorMsg("Ingrese el ID de usuario");
      return;
    }

    try {
      setValidating(true);

      const res = await axios.post(
        "http://localhost:3333/api/users/crud?ProcessType=getById&DBServer=MongoDB&LoggedUser=TEST",
        {
          usuario: { USERID: manualId }
        }
      );

      // ======================================================
      // EXTRACCIÓN REAL SEGÚN LA BITÁCORA QUE MOSTRASTE
      // ======================================================
      const usuario =
        res.data?.value?.[0]?.data?.[0]?.dataRes || // TU API NORMAL
        res.data?.value?.[0]?.data?.[0] ||            // fallback
        null;

      if (!usuario) {
        setErrorMsg("Usuario no encontrado");
        return;
      }

      // ======================================================
      // ROLES (tu API regresa un arreglo en: usuario.ROLES)
      // ======================================================
      const role = usuario.ROLES?.[0]?.ROLEID || "Sin rol";
      usuario.ROLEID = role; // lo guardamos para fácil acceso

      // Guardar en localStorage
      localStorage.setItem("loggedUser", JSON.stringify(usuario));

      setUser(usuario);
      setErrorMsg("");

    } catch (err) {
      console.error("Error login:", err);
      setErrorMsg("Usuario no encontrado");
    } finally {
      setValidating(false);
    }
  };

  const iniciarSesion = () => {
    window.location.href = "/errors";
  };

  // ============================================================
  // LOADING
  // ============================================================
  if (loading)
    return (
      <div className="elogin-loading">
        <BusyIndicator active size="Large" />
        <Text style={{ marginTop: "10px", color: "#fff" }}>Cargando...</Text>
      </div>
    );

  // ============================================================
  // LOGIN MANUAL
  // ============================================================
  if (!user)
    return (
      <div className="elogin-fullscreen">
        <div className="elogin-box">
          <h2 style={{ marginBottom: "6px" }}>Iniciar Sesión</h2>
          <p style={{ color: "#6e7a90", marginBottom: "1rem" }}>
            Introduce tu ID de usuario
          </p>

          <Input
            placeholder="Ej: GSTE"
            value={manualId}
            onInput={(e) => setManualId(e.target.value)}
            className="elogin-input"
          />

          {errorMsg && <p style={{ color: "red", marginTop: "8px" }}>{errorMsg}</p>}

          <Button
            design="Emphasized"
            className="elogin-button"
            onClick={validarUsuario}
            disabled={validating}
          >
            {validating ? "Validando..." : "Continuar"}
          </Button>
        </div>
      </div>
    );

  // ============================================================
  // CONFIRMAR IDENTIDAD
  // ============================================================
  return (
    <div className="elogin-fullscreen">
      <div className="elogin-box">

        <img
          src={`https://i.pravatar.cc/150?u=${user.USERID}`}
          className="elogin-avatar"
          alt="avatar"
        />

        <div className="elogin-title">
          <h2>Acceso a ErrorManager</h2>
          <p>Confirmar identidad</p>
        </div>

        <h1>{user.USERNAME || "Sin nombre"}</h1>

        <span className="elogin-role">
          {user.ROLEID || "Sin rol"}
        </span>

        <div className="elogin-data">
          <p><b>ID:</b> {user.USERID}</p>
          <p><b>Email:</b> {user.EMAIL || "Sin email"}</p>
          <p><b>Alias:</b> {user.ALIAS || "Sin alias"}</p>
        </div>

        <Button
          design="Emphasized"
          className="elogin-button"
          onClick={iniciarSesion}
        >
          Iniciar sesión
        </Button>

      </div>
    </div>
  );
}
