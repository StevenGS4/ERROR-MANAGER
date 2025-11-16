// srv/api/models/zterrorlog-model.js
import mongoose from "mongoose";

const zterrorlogSchema = new mongoose.Schema(
  {
    ERRORID: {
      type: String,
      required: true,
    },

    CANSEEUSERS: {
      type: [String],
      required: true,
    },

    ASSIGNEDUSERS: {
      type: [String],
      default: [],
    },

    RESOLVEDBY: {
      type: String,
      default: null,
    },

    COMMENTS: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },

    FINALSOLUTION: {
      type: String,
      default: null,
    },

    CONTEXT: {
      type: [
        {
          stack: { type: String },
          endpoint: { type: String },
          requestBody: { type: mongoose.Schema.Types.Mixed },
          browser: String,
          os: String,
          DEVICE: {
            type: String,
            default: null,
          },
        },
      ],
      default: [],
    },

    ERRORMESSAGE: {
      type: String,
      required: true,
      maxlength: 2000,
      trim: true,
    },

    ERRORDATETIME: {
      type: Date,
      default: Date.now,
      required: true,
    },

    ERRORCODE: {
      type: String,
      required: true,
      maxlength: 500,
      trim: true,
    },

    ERRORSOURCE: {
      type: String,
      required: true,
      maxlength: 500,
      trim: true,
    },

    AI_REQUESTED: {
      type: Boolean,
      default: false,
    },

    AI_RESPONSE: {
      type: String,
      maxlength: 5000,
      default: null,
    },

    STATUS: {
      type: String,
      enum: ["NEW", "IN_PROGRESS", "RESOLVED", "IGNORED"],
      default: "NEW",
    },

    SEVERITY: {
      type: String,
      enum: ["INFO", "WARNING", "ERROR", "CRITICAL"],
      default: "ERROR",
    },

    MODULE: {
      type: String,
      required: true,
      maxlength: 500,
      trim: true,
    },

    APPLICATION: {
      type: String,
      required: true,
      maxlength: 500,
      trim: true,
    },

    CREATED_BY_APP: {
      type: String,
      default: null,
      maxlength: 255,
      trim: true,
    },

    PROCESS: {
      type: String,
      default: null,
      maxlength: 500,
    },

    ENVIRONMENT: {
      type: String,
      enum: ["DEV", "TEST", "PROD"],
      default: "DEV",
    },
  },
  { collection: "ZTERRORLOG" }
);

export default mongoose.model("ZTERRORLOG", zterrorlogSchema);
