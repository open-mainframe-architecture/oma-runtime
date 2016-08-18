function configure(module) {
  "use strict";
  module.description = 'This module implements the runtime image service.';
  module.requires = {
    environment: 'Std.Runtime.Environment'
  };
  module.provides = {
    'Std.Runtime.Image': (Provider, required) => Provider.spawn(required.environment)
  };
}