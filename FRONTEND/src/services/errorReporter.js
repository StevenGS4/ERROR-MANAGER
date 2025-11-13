import { createError } from "./errorService";

export function sendErrorToServer(err, extra = {}) {
  const payload = {
    ERRORMESSAGE: err.message,
    ERRORCODE: extra.code || "ERR-UI-GEN",
    ERRORSOURCE: extra.source || extra.component || "Frontend",
    SEVERITY: extra.severity || "HIGH",
    MODULE: extra.module || "UI",
    APPLICATION: "ErrorManager",
    USER: extra.user || "Admin",
    STATUS: "NEW",

    CONTEXT: {
      component: extra.component || "Unknown",
      function: extra.function || "Unknown",
      errorMessageRaw: err.stack || String(err),
      stackTrace: (err.stack || "").split("\n"),

      httpRequest: extra.http || null,

      timestamp: new Date().toISOString(),

      browser: {
        name: navigator.userAgentData?.brands?.[0]?.brand || "Unknown",
        version: navigator.userAgentData?.brands?.[0]?.version || "Unknown",
        os: navigator.userAgentData?.platform || "Unknown"
      }
    }
  };

  return createError(payload);
}
