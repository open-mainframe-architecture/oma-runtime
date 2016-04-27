function configure(module) {
  "use strict";
  module.description = 'This module defines management roles that handle incidents in a theater.';
  module.depends = ['Std.Core.Theater', 'Std.Core.Data.Types'];
  module.provides = {
    'Std.Theater.Director': roleClass => roleClass.spawn()
  };
  module.datatypes = {
    // an incident describes a managed failure on the theater stage
    Incident: {
      // uptime of runtime system when incident was created
      uptime: 'number',
      // textual description of failure
      reason: 'string',
      // environment-specific stack trace of failure
      trace: 'Maybe([string])',
      // job purpose of offending job
      job: 'string?',
      // name of offending role class
      role: 'string?',
      // name of damage class
      damage: 'string?',
      // locate incident in subsidiary environment
      location: 'Maybe([string])'
    }
  };
}