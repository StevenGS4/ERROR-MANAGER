// srv/api/models/zterrorlog-model.js
import mongoose from 'mongoose';

const zterrorlogSchema = new mongoose.Schema(
  {
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
      enum: ['NEW', 'IN_PROGRESS', 'RESOLVED', 'IGNORED'],
      default: 'NEW',
    },
    CONTEXT: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    SEVERITY: {
      type: String,
      enum: ['INFO', 'WARNING', 'ERROR', 'CRITICAL'],
      default: 'ERROR',
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
    USER: {
      type: String,
      default: null,
      maxlength: 255,
      trim: true,
    },

    // ⚙️ Campos adicionales sugeridos para próximas versiones
    PAGE: {
      type: String,
      default: null, // Página de la app donde surgió el error
      maxlength: 500,
    },
    PROCESS: {
      type: String,
      default: null, // Proceso o flujo donde ocurrió el error
      maxlength: 500,
    },
    ENVIRONMENT: {
      type: String,
      enum: ['DEV', 'TEST', 'PROD'],
      default: 'DEV',
    },
    DEVICE: {
      type: String,
      default: null, // Ejemplo: 'Desktop', 'Mobile', 'Tablet'
    },
  },
  { collection: 'ZTERRORLOG' }
);

export default mongoose.model('ZTERRORLOG', zterrorlogSchema);
