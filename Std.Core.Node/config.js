function configure(module) {
  "use strict";
  /*global process*/
  module.description = 'This module implements core services for a Node.js environment.';
  module.requires = {
    loose: 'Std.Management.Loose'
  };
  module.test = () => typeof process !== 'undefined';
  module.provides = {
    'Std.HTTP.Client with Std.HTTP.NodeClient': (Provider, required) =>
      Provider.spawn(required.loose),
    'Std.Runtime.Constants with Std.Runtime.NodeConstants': Provider => Provider.create()
  };
}