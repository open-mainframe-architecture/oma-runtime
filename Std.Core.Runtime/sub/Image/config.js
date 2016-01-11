function configure(module) {
  "use strict";
  module.description = 'This module implements the runtime image service.';
  module.requires = {
    loose: 'Std.Supervision.Loose'
  };
  module.provides = {
    'Rt.Image': function (roleClass, required) {
      return roleClass.spawn(required.loose);
    }
  };
}