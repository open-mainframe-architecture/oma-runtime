function configure(module) {
  "use strict";
  module.description = 'This module implements the runtime environment of a Node.js process.';
  module.requires = {
    loose: 'Std.Supervision.Loose'
  };
  module.provides = {
    'Rt.Node': function (roleClass, required) {
      return roleClass.spawn(required.loose);
    }
  };
}