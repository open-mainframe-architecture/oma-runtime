function configure(module) {
  "use strict";
  /*global process*/
  module.description = 'This module implements core services in a Node.js environment.';
  module.requires = {
    loose: 'Std.Supervision.Loose'
  };
  module.provides = {
    'Rt.Node.HTTP.Client': function (roleClass, required) {
      return roleClass.spawn(required.loose);
    }
  };
  module.test = function () {
    return typeof process !== 'undefined';
  };
}