function configure(module) {
  "use strict";
  module.description = 'This module defines standard service roles in a theater.';
  module.requires = {
    loose: 'Std.Management.Loose'
  };
  module.provides = {
    // the 'extra' actor performs code on stage
    'Std.Role': (Provider, required) => Provider.spawn(required.loose)
  };
}