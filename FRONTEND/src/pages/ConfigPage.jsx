// src/pages/ConfigPage.jsx
import React, { useEffect, useState, useMemo, useRef } from "react";
import {
  Button,
  Card,
  Title,
  Text,
  Input,
  Label,
  MessageStrip,
  TabContainer,
  Tab,
  BusyIndicator,
  FlexBox,
  FlexBoxDirection,
  Dialog,
} from "@ui5/webcomponents-react";

import axios from "axios";
import "../styles/configPage.css";

import "@ui5/webcomponents/dist/TabContainer.js";
import "@ui5/webcomponents/dist/Tab.js";
import "@ui5/webcomponents-icons/dist/employee.js";
import "@ui5/webcomponents-icons/dist/settings.js";
import "@ui5/webcomponents-icons/dist/sys-monitor.js";
import "@ui5/webcomponents-icons/dist/refresh.js";
import "@ui5/webcomponents-icons/dist/search.js";
import "@ui5/webcomponents-icons/dist/status-inactive.js";
import "@ui5/webcomponents-icons/dist/status-positive.js";

const USERS_API_BASE = "http://localhost:3333/api/users/crud";

// Función para validar formato de fecha
const isValidDateValue = (value) => {
  const dateRegex = /^[0-9-]*$/;
  return dateRegex.test(value);
};

// ======================================================
// 🔹 COMPONENTE PRINCIPAL
// ======================================================
export default function ConfigPage() {
  const [loggedUser, setLoggedUser] = useState(null);
  const [profileForm, setProfileForm] = useState({});
  const [activeTab, setActiveTab] = useState("tab-profile");

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingUserId, setSavingUserId] = useState(null);
  const [message, setMessage] = useState(null);
  
  // 🌟 ESTADOS PARA EL DIÁLOGO DEL AVATAR 🌟
  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false);
  const [newAvatarUrl, setNewAvatarUrl] = useState(""); 
  const newAvatarInputRef = useRef(null);

  // ======================================================
  // 🔹 Cargar usuario desde localStorage
  // ======================================================
  useEffect(() => {
    const saved = localStorage.getItem("loggedUser");
    if (!saved) return;

    try {
      const user = JSON.parse(saved);
      setLoggedUser(user);

      // Usar PROFILE_PIC_URL del usuario o el avatar local/por defecto
      const avatarUrl = user.PROFILE_PIC_URL 
        ? user.PROFILE_PIC_URL
        : localStorage.getItem(`userAvatar_${user.USERID}`) ||
          `https://i.pravatar.cc/150?u=${user.USERID}`;

      setProfileForm({
        ...user,
        AVATAR: avatarUrl, // Usamos AVATAR como campo temporal para el frontend
      });
      setNewAvatarUrl(user.PROFILE_PIC_URL || ""); // Inicializar la URL en el diálogo
    } catch {
      // ignore
    }
  }, []);

  const showMessage = (type, text) => setMessage({ type, text });

  const mapMsgDesign = (t) =>
    t === "error"
      ? "Negative"
      : t === "success"
      ? "Positive"
      : "Information";

  const cleanUserForUpdate = (user) => {
    // ⚠️ Esta lista es la "whitelist" de campos permitidos
    const allowed = [
      "USERID",
      "USERNAME",
      "EMAIL",
      "ALIAS",
      "PHONENUMBER",
      "EXTENSION",
      "COMPANYID",
      "CEDIID",
      "EMPLOYEEID",
      "BIRTHDATE",
      "PROFILE_PIC_URL",
      "ACTIVE", 
    ];

    const clean = {};

    for (const key of allowed) {
      if (user[key] !== undefined) clean[key] = user[key];
    }

    return clean;
  };

  const saveToServer = async (userToSave, loggedUserId) => {
    const cleanBody = cleanUserForUpdate(userToSave);
    // ... (rest of function)
    const params = new URLSearchParams({
      ProcessType: "updateOne",
      DBServer: "MongoDB",
      LoggedUser: loggedUserId || "SYSTEM",
    });

    const url = `${USERS_API_BASE}?${params.toString()}`;

    console.log("📤 Enviando a backend (updateOne):", cleanBody);

    return axios.post(url, { usuario: cleanBody });
  };

  // ======================================================
  // 🔹 Manejar cambio de perfil con validación de fecha
  // ======================================================
  const handleProfileChange = (f) => (e) => {
    const value = e.target.value;
    
    // VALIDACIÓN PARA BIRTHDATE
    if (f === "BIRTHDATE") {
      if (value && !isValidDateValue(value)) {
        console.warn("Entrada inválida en fecha. Solo se permiten números y guiones.");
        return; 
      }
    }

    setProfileForm((p) => ({ ...p, [f]: value }));
  };

  // ======================================================
  // 🌟 GUARDAR LA NUEVA URL DEL AVATAR 🌟
  // ======================================================
  const handleAvatarSave = async () => {
    if (!loggedUser || !newAvatarUrl) {
      setAvatarDialogOpen(false);
      return;
    }

    setSavingProfile(true);

    try {
      const merged = {
        ...loggedUser,
        PROFILE_PIC_URL: newAvatarUrl.trim(), // Actualizar la URL para el backend
      };

      await saveToServer(merged, loggedUser.USERID);

      // Guardar en localStorage (incluyendo la nueva PROFILE_PIC_URL)
      localStorage.setItem("loggedUser", JSON.stringify(merged));
      
      // Actualizar el estado del frontend
      setLoggedUser(merged);
      setProfileForm((p) => ({
        ...p,
        PROFILE_PIC_URL: newAvatarUrl.trim(), // Nuevo valor para el backend
        AVATAR: newAvatarUrl.trim(), // Valor para mostrar en el frontend
      }));

      // Limpiar el localStorage del avatar temporal si existía
      localStorage.removeItem(`userAvatar_${loggedUser.USERID}`);

      showMessage("success", "Foto de perfil actualizada correctamente");
    } catch (err) {
      console.error("❌ Error guardando URL del Avatar:", err);
      showMessage("error", "No se pudo guardar la nueva foto de perfil");
    } finally {
      setSavingProfile(false);
      setAvatarDialogOpen(false);
    }
  };


  // ======================================================
  // 🔹 Guardar perfil (solo campos válidos)
  // ⚠️ Asegura que PROFILE_PIC_URL no se borre si ya está en merged
  // ======================================================
  const handleProfileSave = async () => {
    if (!loggedUser) return;
    setSavingProfile(true);

    try {
      // Mezclamos lo que había en loggedUser con lo editado en profileForm
      const merged = {
        ...loggedUser,
        ...profileForm,
        // La URL de la foto de perfil se toma de profileForm para el envío
        PROFILE_PIC_URL: profileForm.PROFILE_PIC_URL || loggedUser.PROFILE_PIC_URL,
      };

      // El avatar (campo AVATAR) es solo local para UI, lo eliminamos antes de enviar
      delete merged.AVATAR;

      await saveToServer(merged, loggedUser.USERID);

      // Guardamos versión limpia en localStorage
      localStorage.setItem("loggedUser", JSON.stringify(merged));

      // Volvemos a poner el avatar para UI (podría ser la misma URL si es que se guardó antes)
      const avatar = merged.PROFILE_PIC_URL ||
        localStorage.getItem(`userAvatar_${merged.USERID}`);

      setLoggedUser(merged);
      setProfileForm({ ...merged, AVATAR: avatar });

      showMessage("success", "Perfil actualizado correctamente");
    } catch (err) {
      console.error("❌ Error guardando perfil:", err);
      showMessage("error", "No se pudo guardar el perfil");
    } finally {
      setSavingProfile(false);
    }
  };


  if (!loggedUser)
    return (
      <div className="config-page-container">
        <BusyIndicator active size="Large" />
      </div>
    );

  // El avatar ahora se basa en el campo AVATAR del estado (que contiene la URL final)
  const headerAvatar =
    profileForm.AVATAR || `https://i.pravatar.cc/48?u=${profileForm.USERID}`;

  const bigAvatar =
    profileForm.AVATAR || `https://i.pravatar.cc/150?u=${profileForm.USERID}`;

  // ======================================================
  // 🔹 RENDER
  // ======================================================
  return (
    <div className="config-page-container">
      {/* HEADER */}
      <div className="config-page-header">
        {/* ... (código del header) */}
        <div>
          <Title level="H1">Configuración</Title>
          <Text>Administra tu perfil</Text>
        </div>

        <div className="config-header-user">
          <img src={headerAvatar} alt="" className="config-header-avatar" />
          <div>
            <Text>{profileForm.USERNAME}</Text>
            <Text>{profileForm.USERID}</Text>
          </div>
        </div>
      </div>

      {message && (
        <MessageStrip
          design={mapMsgDesign(message.type)}
          style={{ marginBottom: "1rem" }}
        >
          {message.text}
        </MessageStrip>
      )}

      <TabContainer
        activeTabId={activeTab}
        onTabSelect={(e) => {
          const tab = e.detail?.tab || e.detail?.selectedTab;
          if (tab?.id) setActiveTab(tab.id);
        }}
      >
        {/* TAB PERFIL */}
        <Tab id="tab-profile" text="Mi Perfil" icon="employee">
          <Card>
            <div className="config-page-content">
              <FlexBox
                direction={FlexBoxDirection.Row}
                style={{ gap: "2rem" }}
              >
                {/* AVATAR Y BOTÓN DE CAMBIO */}
                <FlexBox direction={FlexBoxDirection.Column} style={{ gap: "0.5rem", alignItems: "center" }}>
                  <img
                    src={bigAvatar}
                    alt=""
                    className="config-page-avatar"
                  />
                  {/* 🌟 BOTÓN PARA ABRIR DIÁLOGO 🌟 */}
                  <Button
                    icon="refresh"
                    design="Emphasized"
                    onClick={() => {
                      setNewAvatarUrl(profileForm.PROFILE_PIC_URL || "");
                      setAvatarDialogOpen(true);
                      setTimeout(() => newAvatarInputRef.current?.focus(), 100);
                    }}
                  >
                    Cambiar Foto
                  </Button>
                </FlexBox>

                {/* FORM */}
                <div className="config-page-form">
                  <Label>ID</Label>
                  <Input value={profileForm.USERID} disabled />

                  {/* Campo Cumpleaños */}
                  <Label>Cumpleaños</Label>
                  <Input
                    value={profileForm.BIRTHDATE || ""} 
                    onInput={handleProfileChange("BIRTHDATE")}
                    type="Date" 
                  />
                  {/* ... (resto de campos que no cambian) ... */}
                  <Label>Nombre</Label>
                  <Input
                    value={profileForm.USERNAME}
                    onInput={handleProfileChange("USERNAME")}
                  />

                  <Label>Email</Label>
                  <Input
                    value={profileForm.EMAIL}
                    onInput={handleProfileChange("EMAIL")}
                  />

                  <Label>Alias</Label>
                  <Input
                    value={profileForm.ALIAS || ""}
                    onInput={handleProfileChange("ALIAS")}
                  />

                  <Label>Teléfono</Label>
                  <Input
                    value={profileForm.PHONENUMBER || ""}
                    onInput={handleProfileChange("PHONENUMBER")}
                    type="Number" 
                  />

                  <Label>Extensión</Label>
                  <Input
                    value={profileForm.EXTENSION || ""}
                    onInput={handleProfileChange("EXTENSION")} disabled
                  />

                  <Label>Company ID</Label>
                  <Input
                    value={profileForm.COMPANYID || ""}
                    onInput={handleProfileChange("COMPANYID")} disabled
                  />

                  <Label>Employee ID</Label>
                  <Input
                    value={profileForm.EMPLOYEEID || ""}
                    onInput={handleProfileChange("EMPLOYEEID")} disabled
                  />
                </div>
              </FlexBox>

              <div className="config-page-footer">
                <Button onClick={handleProfileSave} disabled={savingProfile}>
                  {savingProfile ? "Guardando..." : "Guardar cambios"}
                </Button>
              </div>
            </div>
          </Card>
        </Tab>

      </TabContainer>

      {/* 🌟 DIÁLOGO PARA CAMBIAR FOTO DE PERFIL 🌟 */}
      <Dialog
        headerText="Cambiar Foto de Perfil"
        open={avatarDialogOpen}
        onAfterClose={() => setAvatarDialogOpen(false)}
        footer={
          <>
            <Button design="Emphasized" onClick={handleAvatarSave}>
              Guardar URL
            </Button>
            <Button design="Transparent" onClick={() => setAvatarDialogOpen(false)}>
              Cancelar
            </Button>
          </>
        }
      >
        <div style={{ padding: "1rem" }}>
          <Text style={{ marginBottom: "1rem", display: "block" }}>
            Introduce la nueva URL de la imagen de tu perfil.
          </Text>
          <Input
            ref={newAvatarInputRef}
            placeholder="Ej: https://miservidor.com/mi-foto.jpg"
            value={newAvatarUrl}
            onInput={(e) => setNewAvatarUrl(e.target.value)}
            style={{ width: "100%" }}
          />
          <img 
            src={newAvatarUrl || bigAvatar} 
            alt="Vista previa" 
            style={{ width: "100%", height: "auto", marginTop: "1rem", maxHeight: "200px", objectFit: "contain", border: "1px solid #ccc" }}
            onError={(e) => e.target.src = bigAvatar}
          />
        </div>
      </Dialog>

    </div>
  );
}