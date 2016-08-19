function configure(module) {
  "use strict";
  module.description = 'This module provides user settings.';
  // depend on Std.Core.Theater.Promise for thenable jobs
  module.depends = ['Std.Core.Theater.Promise'];
  module.requires = {
    environment: 'Std.Runtime.Environment'
  };
  module.provides = {
    // promise to create user settings when boot record of runtime environment can be attained
    'Std.Runtime.Settings': (Provider, required) => required.environment.attainBootRecord()
      .then(bootRecord => Provider.create(bootRecord.settings))
  };
}