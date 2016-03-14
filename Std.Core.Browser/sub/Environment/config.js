function configure(module) {
  "use strict";
  module.description = 'This module implements the runtime environment of a web browser.';
  module.requires = {
    loose: 'Std.Management.Loose'
  };
  module.provides = {
    'Std.Runtime.Browser': function(roleClass, required) {
      return roleClass.spawn(required.loose);
    }
  };
}