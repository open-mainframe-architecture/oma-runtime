function configure(module) {
  "use strict";
  module.description = 'This module implements the runtime environment of a web browser.';
  module.depends = ['Std.Core.Runtime'];
  module.requires = {
    loose: 'Std.Supervision.Loose'
  };
  module.provides = {
    'Rt.Env,Rt.Browser': function(roleClass, required) {
      return roleClass.spawn(required.loose);
    }
  };
  module.test = function() {
    return typeof window !== 'undefined';
  };
}