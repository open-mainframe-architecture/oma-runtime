function configure(module) {
  "use strict";
  /*global window*/
  module.description = 'This module implements the runtime environment of a web browser.';
  module.requires = {
    loose: 'Std.Supervision.Loose'
  };
  module.provides = {
    'Rt.Web.Browser': function (roleClass, required) {
      return roleClass.spawn(required.loose);
    }
  };
  module.test = function () {
    return typeof window !== 'undefined';
  };
}