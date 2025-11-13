import zterrorlog from '../models/mongodb/zterrorlog.js';
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
    const error = await zterrorlog.findById(id).lean();
    if (!error) {
      return JSON.stringify({
        status: 404,
        message: `Error with ID ${id} not found`,
        data: [],
      });
    }
    return JSON.stringify({
      status: 200,
      data: error,
    });
  } catch (error) {
    console.error("❌ [GetOneError] Error:", error);
    return JSON.stringify({
      status: 500,
      message: "Internal error in GetOneError",
      data: [],
      error: error.message,
    });
  }
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
    console.error("❌ [InsertOneError] Error:", error);
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
  const { _id } = error;
  try {
    const editedError = await zterrorlog.findOneAndUpdate({ _id }, error, { new: true });
    if (!editedError) {
      return JSON.stringify({
        status: 404,
        message: `Error with ID ${_id} not found`,
        data: [],
      });
    }
    return JSON.stringify({
      status: 200,
      message: "Error updated successfully",
      data: editedError,
    });
  } catch (error) {
    console.error("❌ [UpdateOneError] Error:", error);
    return JSON.stringify({
      status: 500,
      message: "Internal error updating error",
      data: [],
      error: error.message,
    });
  }
};

// === DELETE ONE ===
const DeleteOneError = async (id) => {
  try {
    const deletedError = await zterrorlog.findByIdAndDelete(id);
    if (!deletedError) {
      return JSON.stringify({
        status: 404,
        message: `Error with ID ${id} not found`,
        data: [],
      });
    }
    return JSON.stringify({
      status: 200,
      message: "Error deleted successfully",
      data: deletedError,
    });
  } catch (error) {
    console.error("❌ [DeleteOneError] Error:", error);
    return JSON.stringify({
      status: 500,
      message: "Internal error deleting error",
      data: [],
      error: error.message,
    });
  }
};

export default {
  GetAllErrors,
  GetOneError,
  InsertOneError,
  UpdateOneError,
  DeleteOneError,
};
