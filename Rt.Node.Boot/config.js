function configure(module) {
  "use strict";
  module.description = 'This module boots basic runtime services for a Node.js process.';
  module.depends = ['Std.Core.HTTP'];
  module.requires = {
    loose: 'Std.Supervision.Loose'
  };
  module.provides = {
    'Std.HTTP.Client,Rt.Node.HTTP.Client': function(roleClass, required) {
      return roleClass.spawn(required.loose);
    }
  };
  module.test = function() {
    return typeof process !== 'undefined';
  };
}