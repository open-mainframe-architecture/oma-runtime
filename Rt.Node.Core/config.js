function configure(module) {
  "use strict";
  module.description = 'This module implements the runtime environment of a Node.js process.';
  module.depends = ['Std.Core.Runtime'];
  module.requires = {
    loose: 'Std.Supervision.Loose'
  };
  module.provides = {
    'Rt.Env,Rt.Node': function(roleClass, required) {
      return roleClass.spawn(required.loose);
    }
  };
  module.test = function() {
    return typeof process !== 'undefined';
  };
}