function configure(module) {
  "use strict";
  module.description = 'This module defines standard service roles in a theater.';
  module.requires = {
    loose: 'Std.Management.Loose'
  };
  module.provides = {
    'Std.Theater.Extra': function(roleClass, required) {
      return roleClass.spawn(required.loose);
    }
  };
}