function configure(module) {
  "use strict";
  module.description = 'This module defines standard roles in a theater.';
  module.requires = {
    loose: 'Std.Supervision.Loose'
  };
  module.provides = {
    'Std.Theater.Extra': function(roleClass, required) {
      return roleClass.spawn(required.loose);
    }
  };
}