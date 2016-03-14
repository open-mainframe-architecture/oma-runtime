function configure(module) {
  "use strict";
  module.description = 'This module implements runtime services.';
  module.requires = {
    loose: 'Std.Management.Loose'
  };
  module.provides = {
    'Std.Runtime.Image': function(roleClass, required) {
      return roleClass.spawn(required.loose);
    }
  };
}