// srv/api/services/autoAssign-service.js
import axios from "axios";
import ZTERRORLOG from "../models/mongodb/zterrorlog.js";

const USER_API = "http://localhost:3333/api/users/ztusers";

// Diccionario MODULE → ROLES válidos
const MODULE_ROLES = {
  PRODUCTOS: ["dev.productos", "jefe.productos"],
  // Agrega más módulos si es necesario
};

export async function runAutoAssign() {
  try {
    // 1. Buscar errores NEW con CANSEEUSERS vacío
    const errors = await ZTERRORLOG.find({
      STATUS: "NEW",
      CANSEEUSERS: { $size: 0 },
    });

    if (!errors.length) {
      return {
        ok: true,
        scanned: 0,
        updated: 0,
        message: "No hay errores NEW pendientes por asignar.",
      };
    }

    // 2. Obtener usuarios del API
    const { data } = await axios.get(USER_API);
    const userList = data?.value || [];

    let updated = 0;
    const updates = [];

    // 3. Procesar cada error
    for (const err of errors) {
      const moduleName = err.MODULE;
      const expectedRoles = MODULE_ROLES[moduleName];

      if (!expectedRoles) continue;

      // 4. Filtrar usuarios con roles del módulo
      const validUsers = userList.filter((u) =>
        u.ROLES?.some((r) => expectedRoles.includes(r.ROLEID))
      );

      const userIds = validUsers.map((u) => u.USERID);

      if (!userIds.length) continue;

      // 5. Asignar
      err.CANSEEUSERS = userIds;
      //err.ASIGNEDUSERS = userIds;
      await err.save();

      updates.push({
        errorId: err._id,
        module: moduleName,
        users: userIds,
      });

      updated++;
    }

    return {
      ok: true,
      scanned: errors.length,
      updated,
      updates,
      message: `Escaneados: ${errors.length}, Actualizados: ${updated}`,
    };
  } catch (err) {
    console.error("❌ [runAutoAssign] Error:", err);
    return {
      ok: false,
      message: "Error interno en autoAssign",
      error: err.message,
    };
  }
}
