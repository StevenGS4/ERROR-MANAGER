import mongoService from "../api/services/zterrorlog-service.js";
import azureService from './../api/services/azure-zterrorlog-service.js'; // Asegúrate de guardar el código anterior con este nombre

// ====================================================================
// 🛠️ HELPER: SELECTOR DE SERVICIO
// ====================================================================
/**
 * Decide qué servicio usar y normaliza la ejecución del método
 */
const runService = async (dbServer, action, payload = null) => {
  const isAzure = dbServer === "azure";

  switch (action) {
    case "getAll":
      return isAzure
        ? await azureService.getAllErrors()
        : await mongoService.GetAllErrors();

    case "getOne":
      // Payload es el ID
      return isAzure
        ? await azureService.getError(payload)
        : await mongoService.GetOneError(payload);

    case "add":
      // Payload es el objeto del error
      return isAzure
        ? await azureService.addError(payload)
        : await mongoService.InsertOneError(payload);

    case "update":
      // Payload es el objeto a actualizar
      // ⚠️ ADVERTENCIA: Azure necesita 'rowKey', Mongo necesita '_id'.
      // Si estamos en Azure y viene _id pero no rowKey, lo mapeamos para evitar errores.
      if (isAzure && payload._id && !payload.rowKey) {
        payload.rowKey = payload._id;
      }
      return isAzure
        ? await azureService.updateError(payload)
        : await mongoService.UpdateOneError(payload);

    case "delete":
      // Payload es el ID
      return isAzure
        ? await azureService.deleteError(payload)
        : await mongoService.DeleteOneError(payload);

    default:
      throw new Error(`Acción ${action} no soportada`);
  }
};

// ====================================================================
// 🟢 FUNCIONES DEL DICCIONARIO
// ====================================================================

// === GET ALL ===
const getAllFunction = async (params, bitacora) => {
  const { LoggedUser, dbServer } = params;

  // Ejecutamos dinámicamente según dbServer
  let result = await runService(dbServer, "getAll");

  result = JSON.parse(result); // Ambos servicios devuelven string, parseamos aquí

  bitacora.data.push(result.data);
  bitacora.countData =
    result.results || (Array.isArray(result.data) ? result.data.length : 0);
  bitacora.success = true;
  bitacora.status = 200;
  bitacora.loggedUser = LoggedUser;
  bitacora.dbServer = dbServer || "mongo"; // Default visual
  bitacora.messageUSR = "Errores recuperados correctamente";
  bitacora.messageDEV = `GetAll ejecutado correctamente en [${
    dbServer || "mongo"
  }]`;
  return bitacora;
};

// === GET ONE ===
const getOneFunction = async (params, bitacora, body) => {
  const { LoggedUser, dbServer } = params;

  // Obtenemos ID (funciona para _id de Mongo o rowKey de Azure)
  const id = body?.data?._id || body?.data?.rowKey || params?.id;

  let result = await runService(dbServer, "getOne", id);

  result = JSON.parse(result);
  bitacora.data.push(result.data);
  bitacora.countData = 1;
  bitacora.success = true;
  bitacora.status = result.status === 404 ? 404 : 200;
  bitacora.loggedUser = LoggedUser;
  bitacora.dbServer = dbServer;
  bitacora.messageUSR =
    result.status === 404
      ? "Error no encontrado"
      : "Error recuperado correctamente";
  bitacora.messageDEV = "GetOne ejecutado correctamente";
  return bitacora;
};

// === ADD ===
const addFunction = async (params, bitacora, body) => {
  const { LoggedUser, dbServer } = params;
  let payload = body.data;

  // 1) PARSEAR STRING SI ES NECESARIO
  if (typeof payload === "string") {
    try {
      payload = JSON.parse(payload);
    } catch (err) {
      console.error("❌ Error parseando body.data:", body.data);
      return {
        status: 400,
        messageUSR: "Error al parsear el JSON recibido.",
        messageDEV: err.message,
      };
    }
  }

  // 2) INSERTAR USANDO EL SELECTOR
  const result = await runService(dbServer, "add", payload);
  const parsed = JSON.parse(result);

  bitacora.data.push(parsed.data);
  bitacora.success = true;
  bitacora.status = 201;
  bitacora.loggedUser = LoggedUser;
  bitacora.dbServer = dbServer;
  bitacora.messageUSR = "Error insertado correctamente";
  bitacora.messageDEV = `Insert ejecutado correctamente en [${
    dbServer || "mongo"
  }]`;

  return bitacora;
};

// === UPDATE ===
const updateFunction = async (params, bitacora, body) => {
  const { LoggedUser, dbServer } = params;

  // Parseo preventivo si data viene como string (común en updates complejos)
  let payload = body.data;
  if (typeof payload === "string") {
    try {
      payload = JSON.parse(payload);
    } catch {}
  }

  const result = await runService(dbServer, "update", payload);
  const parsed = JSON.parse(result);

  bitacora.data.push(parsed.data);
  bitacora.success = parsed.status === 200;
  bitacora.status = parsed.status;
  bitacora.loggedUser = LoggedUser;
  bitacora.dbServer = dbServer;
  bitacora.messageUSR = parsed.message || "Error actualizado correctamente";
  bitacora.messageDEV = "Update ejecutado correctamente";
  return bitacora;
};

// === DELETE ===
const deleteFunction = async (params, bitacora, body) => {
  const { LoggedUser, dbServer } = params;

  // Obtenemos ID o RowKey
  const id = body?.data?._id || body?.data?.rowKey || params?.id;

  const result = await runService(dbServer, "delete", id);
  const parsed = JSON.parse(result);

  bitacora.data.push(parsed.data);
  bitacora.countData = 1;
  bitacora.success = parsed.status === 200;
  bitacora.status = parsed.status;
  bitacora.loggedUser = LoggedUser;
  bitacora.dbServer = dbServer;
  bitacora.messageUSR = parsed.message || "Error eliminado correctamente";
  bitacora.messageDEV = "Delete ejecutado correctamente";
  return bitacora;
};

// === EXPORT ===
export const functionsDic = {
  getAll: getAllFunction,
  getOne: getOneFunction,
  add: addFunction,
  update: updateFunction,
  delete: deleteFunction,
};
