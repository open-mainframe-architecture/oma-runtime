function configure(module) {
  "use strict";
  module.description = 'This module implements the runtime environment of a Node.js process.';
  module.requires = {
    loose: 'Std.Management.Loose'
  };
  module.provides = {
    'Std.Runtime.Environment.Node': (roleClass, required) => roleClass.spawn(required.loose)
  };
}