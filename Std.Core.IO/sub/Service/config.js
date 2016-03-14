function configure(module) {
  "use strict";
  module.description = 'This module adds standard I/O services.';
  module.requires = {
    loose: 'Std.Management.Loose'
  };
  module.provides = {
    'Std.IO.Transfer': function(roleClass, required) {
      return roleClass.spawn(required.loose);
    }
  };
}