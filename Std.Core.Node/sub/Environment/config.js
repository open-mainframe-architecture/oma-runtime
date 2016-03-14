function configure(module) {
  "use strict";
  module.description = 'This module implements the runtime environment of a Node.js process.';
  module.requires = {
    loose: 'Std.Management.Loose'
  };
  module.provides = {
    'Std.Runtime.Node': function(roleClass, required) {
      return roleClass.spawn(required.loose);
    }
  };
}