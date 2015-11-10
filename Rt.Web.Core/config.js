function configure(module) {
  "use strict";
  module.description = 'This module uses XMLHttpRequest to implement an HTTP client.';
  module.depends = ['Std.Core.HTTP'];
  module.requires = {
    loose: 'Std.Supervision.Loose'
  };
  module.provides = {
    'Std.HTTP.Client,Rt.Web.Client': function(roleClass, required) {
      return roleClass.spawn(required.loose);
    }
  };
  module.test = function() {
    return typeof XMLHttpRequest !== 'undefined';
  };
}