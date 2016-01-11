function configure(module) {
  "use strict";
  /*global MessageChannel,XMLHttpRequest*/
  module.description = 'This module implements what web browsers and workers have in common.';
  module.requires = {
    loose: 'Std.Supervision.Loose'
  };
  module.provides = {
    'Rt.Web.HTTP.Client': function (roleClass, required) {
      return roleClass.spawn(required.loose);
    }
  };
  module.test = function () {
    return typeof MessageChannel !== 'undefined' && typeof XMLHttpRequest !== 'undefined';
  };
}