function configure(module) {
  "use strict";
  module.description = 'This module implements the runtime environment of a web worker.';
  module.depends = ['Std.Core.Runtime'];
  module.requires = {
    loose: 'Std.Supervision.Loose'
  };
  module.provides = {
    'Rt.Env,Rt.Worker': function(roleClass, required) {
      return roleClass.spawn(required.loose);
    }
  };
  module.test = function() {
    return typeof WorkerGlobalScope !== 'undefined';
  };
}