function configure(module) {
  "use strict";
  module.description = 'This module adds standard I/O services.';
  module.requires = {
    loose: 'Std.Supervision.Loose'
  };
  module.provides = {
    'Std.IO.Mixer': function(roleClass, required) {
      return roleClass.spawn(required.loose);
    }
  };
}