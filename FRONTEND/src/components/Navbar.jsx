import React, { useEffect, useState, useRef } from "react";
import {
  Button,
  Avatar,
  Popover,
  List,
  StandardListItem
} from "@ui5/webcomponents-react";

import "../styles/navbar.css";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState("light");
  const popoverRef = useRef();

  useEffect(() => {
    const savedUser = localStorage.getItem("loggedUser");

    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);

        // Defensa: validar que tenga USERID o USERNAME
        if (parsed && (parsed.USERID || parsed.USERNAME)) {
          setUser(parsed);
        }
      } catch (e) {
        console.error("Usuario corrupto en localStorage");
      }
    }

    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);
    document.body.setAttribute("data-theme", savedTheme);
  }, []);


  const cerrarSesion = () => {
    localStorage.removeItem("loggedUser");
    window.location.href = "/login-error";
  };

  if (!user) return null;

  return (
    <>
      <header className="nav-wrapper">
        <div className="nav-left">
          <h2 className="nav-title">Error Manager</h2>

          {/* 🔥 Fallbacks para evitar mostrar () */}
          <span className="nav-user-name">
            {user.USERNAME || "Usuario"} 
          </span>
        </div>

        <div className="nav-right">
          <Button
            icon="home"
            design="Transparent"
            className="nav-icon-btn"
            onClick={() => (window.location.href = "/errors")}
          />

          <img
            src={`https://i.pravatar.cc/150?u=${user.USERID || "default"}`}
            alt="avatar"
            className="nav-avatar"
            onClick={(e) => popoverRef.current.showAt(e.target)}
          />
        </div>
      </header>

      <Popover ref={popoverRef} placement="BottomEnd" className="nav-popover">
        <List separators="Inner">
          <StandardListItem icon="employee" type="Inactive">
            {user.USERNAME || "Usuario"} ({user.USERID || "?"})
          </StandardListItem>

          <StandardListItem icon="settings" onClick={() => (window.location.href = "/config")}>
            Configuración
          </StandardListItem>

          <StandardListItem icon="log-out" onClick={cerrarSesion}>
            Cerrar sesión
          </StandardListItem>
        </List>
      </Popover>
    </>
  );
}
