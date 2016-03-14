function configure(module) {
  "use strict";
  /*global process*/
  module.description = 'This module implements core services for a Node.js environment.';
  module.requires = {
    loose: 'Std.Management.Loose'
  };
  module.test = function() {
    return typeof process !== 'undefined';
  };
  module.provides = {
    'Std.HTTP.NodeClient': function(roleClass, required) {
      return roleClass.spawn(required.loose);
    },
    'Std.Runtime.NodeConstants': function(serviceClass) {
      return serviceClass.create();
    }
  };
}