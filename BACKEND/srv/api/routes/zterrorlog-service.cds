using { err.sch as err } from '../models/schema-zterrorlog';

@impl: 'srv/api/controllers/zterrorlog-controller.js'

service ZterrorLogServiceRoute @(path: 'api/error') {
  entity ErrSrv as projection on err.zterrorlog;

  @Core.Description: 'crud-error'
  @path            : 'crud'
  action crud(data : LargeString) returns array of ErrSrv;
}
