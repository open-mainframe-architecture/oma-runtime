function configure(module) {
  "use strict";
  /*global XMLHttpRequest,MessageChannel*/
  module.description = 'This module implements what web browsers and worker have in common.';
  module.depends = ['Std.Core.HTTP'];
  module.requires = {
    loose: 'Std.Supervision.Loose'
  };
  module.provides = {
    'Rt.Web.HTTP.Client': function (roleClass, required) {
      return roleClass.spawn(required.loose);
    }
  };
  module.test = function () {
    return typeof XMLHttpRequest !== 'undefined' && typeof MessageChannel !== 'undefined';
  };
}