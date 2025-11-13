namespace err.sch;

using { cuid, managed } from '@sap/cds/common'; // Permite agregar un UUID generado automático

// ENUM para que solo se puedan ingresar las siguientes opciones:
type Status : String(20) enum {
  NEW;
  IN_PROGRESS;
  RESOLVED;
  IGNORED;
}

// ENUM para que solo se puedan ingresar las siguientes opciones:
type Severity : String(10) enum {
  INFO;
  WARNING;
  ERROR;
  CRITICAL;
}

entity zterrorlog : cuid, managed {
  ERRORMESSAGE  : String(2000) not null;
  ERRORDATETIME : DateTime not null @cds.on.insert: $now;
  ERRORCODE     : String(500) not null;
  ERRORSOURCE   : String(500) not null;
  AI_REQUESTED  : Boolean default false;
  AI_RESPONSE   : String(5000);
  STATUS        : Status default 'NEW';
  CONTEXT       : LargeString;
  SEVERITY      : Severity;
  MODULE        : String not null;
  APPLICATION   : String not null;
  USER          : String;
}
