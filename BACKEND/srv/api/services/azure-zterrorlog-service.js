import { TableClient } from "@azure/data-tables";
import dotenvXConfig from "./../../config/dotenvXConfig.js";

const connectionString = dotenvXConfig.AZURE_STRING;

const tableClient = TableClient.fromConnectionString(
  connectionString,
  "zterrorlog"
);

console.log(ent);

const getAllErrors = async () => {
  const results = [];

  try {
    // Azure Table Storage devuelve un async iterable
    for await (const entity of tableClient.listEntities()) {
      results.push(entity);
    }

    return results;
  } catch (error) {
    console.error("Error al obtener registros:", error);
  }
};

const getError = async () => {
  try {
    const ent = await tableClient.getEntity("errorlogs", `ERR-1764193676036`);
    return ent;
  } catch (error) {
    console.error("Error al obtener registro", error);
  }
};

const addError = async (error) => {
  try {
    const res = await tableClient.createEntity({
      partitionKey: "errorlogs",
      rowKey: "ERR-" + Date.now(),
      ERRORMESSAGE: error.ERRORMESSAGE,
      ERRORDATETIME: new Date().toISOString(),
      ERRORCODE: error.ERRORCODE,
      ERRORSOURCE: error.ERRORSOURCE,
      ERRORID: error.ERRORID,
      CANSEEUSERS: JSON.stringify(error.CANSEEUSERS),
      ASIGNEDUSERS: JSON.stringify(error.ASIGNEDUSERS),
      RESOLVEDBY: null,
      RESOLVED_DATE: null,
      COMMENTS: [],
      FINALSOLUTION: null,

      CONTEXT: JSON.stringify(error.CONTEXT),

      AI_REQUESTED: false,
      AI_RESPONSE: null,
      STATUS: "NEW",
      SEVERITY: error.SEVERITY,
      TYPE_ERROR: error.TYPE_ERROR,
      MODULE: error.MODULE,
      APPLICATION: error.APPLICATION,
      CREATED_BY_APP: error.CREATED_BY_APP,
      PROCESS: error.PROCESS,
      ENVIRONMENT: error.ENVIRONMENT,
      DEVICE: error.DEVICE,
    });
    return res;
  } catch (err) {
    console.log(err);
  }
};

export default {
  getAllErrors,
  getError,
  addError,
};
