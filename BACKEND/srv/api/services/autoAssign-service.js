// srv/api/services/autoAssign-service.js
import axios from "axios";
import ZTERRORLOG from "../models/mongodb/zterrorlog.js";

const USER_GETALL =
  "http://localhost:3333/api/users/crud?ProcessType=getAll&DBServer=MongoDB&LoggedUser=TEST";

const USER_GETBYID =
  "http://localhost:3333/api/users/crud?ProcessType=getById&DBServer=MongoDB&LoggedUser=TEST";

const MODULE_ROLES = {
  PRODUCTOS: ["dev.productos", "jefe.productos"],
};

export async function runAutoAssign() {
  try {
    const errors = await ZTERRORLOG.find({
      STATUS: "NEW",
      CANSEEUSERS: { $size: 0 }
    });

    if (!errors.length) {
      return { ok: true, scanned: 0, updated: 0 };
    }

    // 1️⃣ Obtener usuarios base
    const resAll = await axios.post(USER_GETALL, { usuario: {} });
    const allUsers = resAll?.data?.value?.[0]?.dataRes || [];
    const finalUsers = [];

    // 2️⃣ Obtener roles reales usuario por usuario
    for (const u of allUsers) {
      const detail = await axios.post(USER_GETBYID, {
        usuario: { USERID: u.USERID }
      });

      const userReal = detail?.data?.value?.[0]?.dataRes;

      if (userReal) {
        finalUsers.push(userReal);
      }
    }

    let updated = 0;
    const updates = [];

    // 3️⃣ Auto-assign por error
    for (const err of errors) {
      const expected = MODULE_ROLES[err.MODULE];
      if (!expected) continue;

      // filtrar usuarios con roles válidos
      const validUsers = finalUsers.filter((u) =>
        u.ROLES?.some((r) => expected.includes(r.ROLEID))
      );

      const ids = validUsers.map(u => u.USERID);
      if (!ids.length) continue;

      err.CANSEEUSERS = ids;
      await err.save();

      updates.push({
        errorId: err.ERRORID,
        module: err.MODULE,
        CANSEEUSERS: ids
      });

      updated++;
    }

    return {
      ok: true,
      scanned: errors.length,
      updated,
      updates
    };

  } catch (err) {
    console.error("❌ AutoAssign:", err);
    return { ok: false, error: err.message };
  }
}
