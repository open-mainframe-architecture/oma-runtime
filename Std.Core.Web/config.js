function configure(module) {
  "use strict";
  /*global MessageChannel,XMLHttpRequest*/
  module.description = 'This module implements what web browsers and workers have in common.';
  module.requires = {
    loose: 'Std.Management.Loose'
  };
  module.test = function() {
    return typeof MessageChannel !== 'undefined' && typeof XMLHttpRequest !== 'undefined';
  };
  module.provides = {
    'Std.HTTP.WebClient': function(roleClass, required) {
      return roleClass.spawn(required.loose);
    }
  };
}