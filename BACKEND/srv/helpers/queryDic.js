// srv/helpers/queryDic.js
import zterrorlogService from "../api/services/zterrorlog-service.js";

// === GET ALL ===
const getAllFunction = async (params, bitacora) => {
  const { LoggedUser, dbServer } = params;
  let result = await zterrorlogService.GetAllErrors();
  result = JSON.parse(result);
  bitacora.data.push(result.data);
  bitacora.countData = result.results || result.data.length;
  bitacora.success = true;
  bitacora.status = 200;
  bitacora.loggedUser = LoggedUser;
  bitacora.dbServer = dbServer;
  bitacora.messageUSR = "Errores recuperados correctamente";
  bitacora.messageDEV = "GetAll ejecutado correctamente";
  return bitacora;
};

// === GET ONE ===
const getOneFunction = async (params, bitacora, body) => {
  const { LoggedUser, dbServer } = params;
  const id = body?.data?.ERRORID || params?.ERRORID;
  let result = await zterrorlogService.GetOneError(id);
  result = JSON.parse(result);

  console.log(result);

  if (result.data.length > 0) {
    bitacora.data.push(result.data);
    bitacora.countData = 1;
    bitacora.success = true;
    bitacora.status = 200;
    bitacora.loggedUser = LoggedUser;
    bitacora.dbServer = dbServer;
    bitacora.messageUSR = "Error recuperado correctamente";
    bitacora.messageDEV = "GetOne ejecutado correctamente";
    return bitacora;
  }

  bitacora.countData = 0;
  bitacora.success = false;
  bitacora.status = 404;
  bitacora.loggedUser = LoggedUser;
  bitacora.dbServer = dbServer;
  bitacora.messageUSR = result.message;
  bitacora.messageDEV = result.message;
  return bitacora;
};

// === ADD ===
const addFunction = async (params, bitacora, body) => {
  const { LoggedUser, dbServer } = params;
  const result = await zterrorlogService.InsertOneError(body.data);
  const parsed = JSON.parse(result);
  bitacora.data.push(parsed.data);
  bitacora.success = true;
  bitacora.status = 201;
  bitacora.loggedUser = LoggedUser;
  bitacora.dbServer = dbServer;
  bitacora.messageUSR = "Error insertado correctamente";
  bitacora.messageDEV = "Insert ejecutado correctamente";
  return bitacora;
};

// === UPDATE ===
const updateFunction = async (params, bitacora, body) => {
  const { LoggedUser, dbServer } = params;

  const result = await zterrorlogService.UpdateOneError(body.data);

  bitacora.data.push(result.data);
  bitacora.success = true;
  bitacora.status = 200;
  bitacora.loggedUser = LoggedUser;
  bitacora.dbServer = dbServer;
  bitacora.messageUSR = "Error actualizado correctamente";
  bitacora.messageDEV = "Update ejecutado correctamente";
  return bitacora;
};

// === DELETE ===
const deleteFunction = async (params, bitacora, body) => {
  const { LoggedUser, dbServer } = params;

  const { ERRORID } = body.error;

  const result = await zterrorlogService.DeleteOneError(ERRORID);

  const parsed = JSON.parse(result);

  if (result.data) {
    bitacora.data.push(parsed.data);
    bitacora.countData = 1;
    bitacora.success = true;
    bitacora.status = 200;
    bitacora.loggedUser = LoggedUser;
    bitacora.dbServer = dbServer;
    bitacora.messageUSR = "Error eliminado correctamente";
    bitacora.messageDEV = "Delete ejecutado correctamente";
    return bitacora;
  }

  bitacora.data.push(parsed.data);
  bitacora.countData = 0;
  bitacora.success = false;
  bitacora.status = 404;
  bitacora.loggedUser = LoggedUser;
  bitacora.dbServer = dbServer;
  bitacora.messageUSR = parsed.message;
  bitacora.messageDEV = parsed.message;
  return bitacora;
};

// === DELETE ===
const getAISolution = async (params, bitacora) => {
  const { LoggedUser, dbServer, ERRORID } = params;

  const result = await zterrorlogService.AiSolution(ERRORID);

  const parsed = JSON.parse(result);
  console.log(result.status);

  if (parsed.data) {
    console.log("Si tiene data vato 👌👌👌");
    bitacora.data.push(parsed.data);
    bitacora.countData = 1;
    bitacora.success = true;
    bitacora.status = 200;
    bitacora.loggedUser = LoggedUser;
    bitacora.dbServer = dbServer;
    bitacora.messageUSR = "Respuesta de la AI obtenida correctamente";
    bitacora.messageDEV = "Respuesta de la AI obtenida correctamente";
    return bitacora;
  }

  console.log("aqui entre vato");
  bitacora.data.push(parsed.data);
  bitacora.countData = 0;
  bitacora.success = false;
  bitacora.status = 404;
  bitacora.loggedUser = LoggedUser;
  bitacora.dbServer = dbServer;
  bitacora.messageUSR = parsed.message;
  bitacora.messageDEV = parsed.message;
  return bitacora;
};

// === EXPORT ===
export const functionsDic = {
  getAll: getAllFunction,
  getOne: getOneFunction,
  add: addFunction,
  update: updateFunction,
  delete: deleteFunction,
  getAISolution: getAISolution,
};
