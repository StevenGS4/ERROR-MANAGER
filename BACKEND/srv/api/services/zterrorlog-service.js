import zterrorlog from "../models/mongodb/zterrorlog.js";
import { getAISolution } from "../services/ai-service.js";

// === GET ALL ===
const GetAllErrors = async () => {
  try {
    const errors = await zterrorlog.find().lean();
    return JSON.stringify({
      status: 200,
      results: errors.length,
      data: errors,
    });
  } catch (error) {
    console.error("❌ [GetAllErrors] Error:", error);
    return JSON.stringify({
      status: 500,
      message: "Error retrieving errors",
      data: [],
      error: error.message,
    });
  }
};

// === GET ONE ===
const GetOneError = async (id) => {
  try {
    const error = await zterrorlog.findOne({ ERRORID: id }).lean();

    if (!error) {
      const err = new Error(`Error with ID ${id} not found`);
      err.status = 404;
      throw err;
    }

    return JSON.stringify({
      status: 200,
      data: [error],
    });
  } catch (error) {
    console.error("[GetOneError] Error:", error);
    return JSON.stringify({
      status: 500,
      message: error.message || "Internal error in GetOneError",
      data: [],
      error: error.message,
    });
  }
};

const AiSolution = async (id) => {
  try {
    // const res = await GetOneError(id);

    const error = await zterrorlog.findOne({ ERRORID: id }).lean();
    console.log(!error);
    if (!error) {
      const err = new Error(`Error with ID ${id} not found`);
      err.status = 404;
      throw err;
    }

    const aiSolution = await getAISolution(error);

    const newError = {
      ...error,
      AI_REQUESTED: true,
      AI_RESPONSE: aiSolution.aiResponse,
    };
    const updatedError = await UpdateOneError(newError);
    // const parsedUpdatedError = JSON.parse(updatedError);

    console.log("error si actualizado");

    return JSON.stringify({
      status: 200,
      data: updatedError.data,
    });
  } catch (error) {
    console.error("[GetAiSOlution] Error:", error);
    return JSON.stringify({
      status: 500,
      message: error.message || "Internal error in GetAiSOlution",
      error: error.message,
    });
  }

  /*
  "CONTEXT": [
                    {
                        "stack": "MongoServerError: E11000 duplicate key error collection: pacientes index: CURP_1 dup key",
                        "endpoint": "/api/pacientes/register",
                        "requestBody": {
                            "curp": "ROAJ890312HDFRRS02",
                            "nombre": "Juan Pérez"
                        },
                        "browser": "Chrome 142",
                        "os": "Android 14",
                        "DEVICE": "Mobile",
                        "_id": "691a89c4f388373b35c6528c"
                    }
                ],
                "ERRORMESSAGE": "Intento de registrar un CURP duplicado en la base de datos.",
                "ERRORDATETIME": "2025-11-16T19:20:00.000Z",
                "ERRORCODE": "PACIENTE_DUP_CURP",
                "ERRORSOURCE": "/api/pacientes/register.js",
                "AI_REQUESTED": false,
                "AI_RESPONSE": null,
                "STATUS": "NEW",
                "SEVERITY": "ERROR",
                "MODULE": "Pacientes",
                "APPLICATION": "SafePet-Backend",
                "CREATED_BY_APP": "system",
                "PROCESS": "REGISTER_PACIENTE",
                "ENVIRONMENT": "PROD",
                "__v": 0
            }
  */
};

// === INSERT ONE ===
const InsertOneError = async (error) => {
  try {
    // Si llega como string, intenta parsear
    if (typeof error === "string") {
      try {
        error = JSON.parse(error);
      } catch {
        return JSON.stringify({
          status: 400,
          message: "Invalid JSON format",
          data: [],
        });
      }
    }

    const newError = await zterrorlog.create(error);
    return JSON.stringify({
      status: 201,
      message: "Error inserted successfully",
      data: newError,
    });
  } catch (error) {
    console.error("[InsertOneError] Error:", error);
    return JSON.stringify({
      status: 500,
      message: "Internal error inserting error",
      data: [],
      error: error.message,
    });
  }
};

// === UPDATE ONE ===
const UpdateOneError = async (error) => {
  try {
    if (!error.ERRORID) {
      return {
        status: 400,
        message: "ERRORID is required for updating",
        data: null,
      };
    }

    const editedError = await zterrorlog
      .findOneAndUpdate(
        { ERRORID: error.ERRORID },
        { $set: error },
        { new: true, runValidators: true }
      )
      .lean();

    if (!editedError) {
      return {
        status: 404,
        message: `Error with ID ${error.ERRORID} not found`,
        data: null,
      };
    }

    return {
      status: 200,
      message: "Error updated successfully",
      data: editedError,
    };
  } catch (err) {
    console.error("[UpdateOneError] Error:", err);
    return {
      status: 500,
      message: "Internal error updating error",
      data: null,
      error: err.message,
    };
  }
};

// === DELETE ONE ===
const DeleteOneError = async (id) => {
  // try {
  //   const deletedError = await zterrorlog.findOneAndDelete({ ERRORID: id },);
  //   if (!deletedError) {
  //     return JSON.stringify({
  //       status: 404,
  //       message: `Error with ID ${id} not found`,
  //       data: [],
  //     });
  //   }
  //   return JSON.stringify({
  //     status: 200,
  //     message: "Error deleted successfully",
  //     data: deletedError,
  //   });
  // } catch (error) {
  //   console.error("❌ [DeleteOneError] Error:", error);
  //   return JSON.stringify({
  //     status: 500,
  //     message: "Internal error deleting error",
  //     data: [],
  //     error: error.message,
  //   });
  // }
  console.log(`id ${id}`);
  try {
    if (!id) {
      return {
        status: 400,
        message: "ID is required",
        data: null,
      };
    }

    const deleted = await zterrorlog.deleteOne({ ERRORID: id });
    console.log(deleted);
    return deleted.deletedCount == 0
      ? JSON.stringify({
          status: 404,
          message: `Error with ID ${id} not found`,
          data: null,
        })
      : JSON.stringify({
          status: 200,
          message: "Error deleted successfully",
          data: deleted,
        });
  } catch (err) {
    console.error("[DeleteOneError]", err);
    return {
      status: 500,
      message: "Internal server error",
      error: err.message,
      data: null,
    };
  }
};

export default {
  GetAllErrors,
  GetOneError,
  InsertOneError,
  UpdateOneError,
  DeleteOneError,
  AiSolution,
};
