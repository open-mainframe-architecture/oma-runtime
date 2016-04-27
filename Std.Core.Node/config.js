function configure(module) {
  "use strict";
  /*global process*/
  module.description = 'This module implements core services for a Node.js environment.';
  module.requires = {
    loose: 'Std.Management.Loose'
  };
  module.test = () => typeof process !== 'undefined';
  module.provides = {
    'Std.HTTP.NodeClient': (roleClass, required) => roleClass.spawn(required.loose),
    'Std.Runtime.NodeConstants': serviceClass => serviceClass.create()
  };
}