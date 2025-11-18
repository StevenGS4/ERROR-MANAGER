// srv/api/controllers/autoAssign-controller.js
import { runAutoAssign } from "../services/autoAssign-service.js";

export async function autoAssignHandler(req, res) {
  try {
    const result = await runAutoAssign();
    return res.status(200).json(result);
  } catch (err) {
    console.error("❌ [AutoAssignHandler] Error:", err);
    return res.status(500).json({
      ok: false,
      message: "Error interno en autoAssign",
      error: err.message
    });
  }
}
