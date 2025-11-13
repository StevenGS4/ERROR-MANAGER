import React from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardHeader,
  Avatar,
  ObjectStatus,
  Text,
  FlexBox,
  FlexBoxDirection,
} from "@ui5/webcomponents-react";
import "@ui5/webcomponents-icons/dist/employee.js";

const ErrorCard = ({ error }) => {
  const fecha = error.ERRORDATETIME
    ? new Date(error.ERRORDATETIME).toLocaleString("es-MX", {
      dateStyle: "short",
      timeStyle: "medium",
    })
    : "Fecha desconocida";

  const statusState =
    error.STATUS === "RESOLVED"
      ? "Success"
      : error.STATUS === "IGNORED"
        ? "Warning"
        : "Error";

  const to = `/errors/${error._id || error.ERRORID}`;

  return (
    <div style={{ marginBottom: "1rem", position: "relative" }}>
      <Link to={to} style={{ textDecoration: "none", color: "inherit" }}>
        <Card style={{ position: "relative" }}>

          {/* ⭐ ESTATUS EN LA ESQUINA SUPERIOR DERECHA */}
          <div
            style={{
              position: "absolute",
              top: "12px",
              right: "16px",
              zIndex: 10,
            }}
          >
            <ObjectStatus state={statusState} showDefaultIcon>
              {error.STATUS || "NEW"}
            </ObjectStatus>
          </div>

          <CardHeader
            titleText={`${error.ERRORCODE || "Sin código"} — ${error.ERRORSOURCE || "Origen desconocido"
              }`}
            subtitleText={`${error.USER || "Sin usuario"} — ${fecha}`}
            avatar={
              <img
                src={`https://i.pravatar.cc/50?u=${error.USER || error._id || error.ERRORCODE || "default"}`}
                alt={error.USER || "Usuario"}
                className="error-avatar"
              />

            }
          />

          <FlexBox
            direction={FlexBoxDirection.Column}
            style={{
              padding: "1rem",
              backgroundColor: "#fff",
              borderRadius: "0 0 8px 8px",
            }}
          >
            <Text style={{ lineHeight: "1.4" }}>
              {error.ERRORMESSAGE || "Sin descripción del error"}
            </Text>
          </FlexBox>
        </Card>
      </Link>
    </div>
  );
};

export default ErrorCard;
