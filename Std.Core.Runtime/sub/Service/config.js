function configure(module) {
  "use strict";
  module.description = 'This module defines standard runtime services.';
  module.requires = {
    environment: 'Std.Runtime.Environment'
  };
  module.provides = {
    'Std.Runtime.Image': (Provider, required) => Provider.spawn(required.environment)
  };
}